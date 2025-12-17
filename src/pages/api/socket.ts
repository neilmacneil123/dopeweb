import type { NextApiRequest } from 'next';
import type { NextApiResponse } from 'next';
import { Server as NetServer } from 'http';
import { Server as SocketIOServer, type Socket } from 'socket.io';
import type { MarketPrices, TerritoryStatus } from '@/lib/gameUtils';

type NextApiResponseWithSocket = NextApiResponse & {
  socket: any & {
    server: NetServer & {
      io?: SocketIOServer;
    };
  };
};

export const config = {
  api: {
    bodyParser: false,
  },
};

type TerritorySnapshot = {
  city: string;
  status: TerritoryStatus;
  updatedAt: number;
};

type TerritoryEventPayload = {
  city?: string;
  status?: TerritoryStatus;
};

const territoryCache = new Map<string, TerritorySnapshot>();

function isValidStatus(status: unknown): status is TerritoryStatus {
  if (!status || typeof status !== 'object') return false;
  const candidate = status as Record<string, unknown>;

  const ownerValid =
    candidate.owner === null ||
    typeof candidate.owner === 'string';

  const contestedValid = typeof candidate.contested === 'boolean';
  const claimEndsValid =
    candidate.claimEndsAt === null ||
    typeof candidate.claimEndsAt === 'number';

  return ownerValid && contestedValid && claimEndsValid;
}

function isValidPayload(payload: TerritoryEventPayload): payload is Required<TerritoryEventPayload> {
  return Boolean(payload && typeof payload.city === 'string' && payload.city.trim() && isValidStatus(payload.status));
}

function cacheAndBroadcast(io: SocketIOServer, payload: Required<TerritoryEventPayload>) {
  const snapshot: TerritorySnapshot = {
    city: payload.city.trim(),
    status: payload.status,
    updatedAt: Date.now(),
  };
  territoryCache.set(snapshot.city, snapshot);
  io.emit('territory:state', snapshot);
}

function emitPresence(socket: Socket, io: SocketIOServer, city: string) {
  const room = io.sockets.adapter.rooms.get(city);
  const count = room ? room.size : 1;
  io.to(city).emit('presence', { city, count });
}

function emitCachedTerritories(socket: Socket) {
  territoryCache.forEach((territory) => {
    socket.emit('territory:state', territory);
  });
}

export default function handler(req: NextApiRequest, res: NextApiResponseWithSocket) {
  if (!res.socket.server.io) {
    const io = new SocketIOServer(res.socket.server, {
      path: '/api/socket',
    });
    res.socket.server.io = io;

    io.on('connection', (socket) => {
      socket.on('join-city', (city: string) => {
        if (socket.data.city) {
          socket.leave(socket.data.city);
        }
        socket.data.city = city;
        socket.join(city);
        emitPresence(socket, io, city);
        emitCachedTerritories(socket);
      });

      socket.on('travel', (city: string) => {
        if (socket.data.city) {
          socket.leave(socket.data.city);
        }
        socket.data.city = city;
        socket.join(city);
        emitPresence(socket, io, city);
        emitCachedTerritories(socket);
      });

      socket.on('market:update', (payload: { city: string; prices: MarketPrices }) => {
        io.to(payload.city).emit('market:broadcast', payload);
      });

      const handleTerritoryEvent = (payload: TerritoryEventPayload) => {
        if (!isValidPayload(payload)) return;
        cacheAndBroadcast(io, payload);
      };

      socket.on('territory:claim', handleTerritoryEvent);
      socket.on('territory:defend', handleTerritoryEvent);
      socket.on('territory:update', handleTerritoryEvent);

      socket.on('disconnect', () => {
        const city = socket.data.city;
        if (city) {
          emitPresence(socket, io, city);
        }
      });
    });
  }

  res.end();
}

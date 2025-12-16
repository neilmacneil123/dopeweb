import type { NextApiRequest } from 'next';
import type { NextApiResponse } from 'next';
import { Server as NetServer } from 'http';
import { Server as SocketIOServer, type Socket } from 'socket.io';
import type { MarketPrices } from '@/lib/gameUtils';

type TerritoryStatus = {
  city: string;
  region: string;
  status: 'claimed' | 'defending' | 'contested' | 'neutral';
  controller?: string;
  note?: string;
  updatedAt: number;
};

type TerritoryPayload = {
  city?: string;
  region?: string;
  status?: TerritoryStatus['status'];
  controller?: string;
  note?: string;
};

const VALID_TERRITORY_STATUSES: TerritoryStatus['status'][] = ['claimed', 'defending', 'contested', 'neutral'];

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

const territoryCache = new Map<string, TerritoryStatus>();

function isValidTerritoryPayload(payload: TerritoryPayload): payload is Required<Pick<TerritoryPayload, 'city' | 'region'>> & TerritoryPayload {
  return Boolean(payload && typeof payload.city === 'string' && payload.city.trim() && typeof payload.region === 'string' && payload.region.trim());
}

function normalizeTerritoryPayload(payload: TerritoryPayload, fallbackStatus: TerritoryStatus['status']): TerritoryStatus | null {
  if (!isValidTerritoryPayload(payload)) return null;

  return {
    city: payload.city.trim(),
    region: payload.region.trim(),
    status: VALID_TERRITORY_STATUSES.includes(payload.status as TerritoryStatus['status'])
      ? (payload.status as TerritoryStatus['status'])
      : fallbackStatus,
    controller: payload.controller?.trim(),
    note: payload.note,
    updatedAt: Date.now(),
  };
}

function cacheAndBroadcast(io: SocketIOServer, territory: TerritoryStatus) {
  const key = `${territory.city}:${territory.region}`;
  territoryCache.set(key, territory);

  const regionRoom = `${territory.city}:${territory.region}`;
  io.to(territory.city).to(regionRoom).emit('territory:state', territory);
}

function emitPresence(socket: Socket, io: SocketIOServer, city: string) {
  const room = io.sockets.adapter.rooms.get(city);
  const count = room ? room.size : 1;
  io.to(city).emit('presence', { city, count });
}

function emitCachedTerritories(socket: Socket, city: string) {
  const cached = Array.from(territoryCache.values()).filter((territory) => territory.city === city);
  cached.forEach((territory) => socket.emit('territory:state', territory));
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
        emitCachedTerritories(socket, city);
      });

      socket.on('travel', (city: string) => {
        if (socket.data.city) {
          socket.leave(socket.data.city);
        }
        socket.data.city = city;
        socket.join(city);
        emitPresence(socket, io, city);
        emitCachedTerritories(socket, city);
      });

      socket.on('market:update', (payload: { city: string; prices: MarketPrices }) => {
        io.to(payload.city).emit('market:broadcast', payload);
      });

      socket.on('territory:claim', (payload: TerritoryPayload) => {
        const territory = normalizeTerritoryPayload(payload, 'claimed');
        if (!territory) return;
        cacheAndBroadcast(io, territory);
      });

      socket.on('territory:defend', (payload: TerritoryPayload) => {
        const territory = normalizeTerritoryPayload(payload, 'defending');
        if (!territory) return;
        cacheAndBroadcast(io, territory);
      });

      socket.on('territory:update', (payload: TerritoryPayload) => {
        const territory = normalizeTerritoryPayload(payload, 'neutral');
        if (!territory) return;
        cacheAndBroadcast(io, territory);
      });

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

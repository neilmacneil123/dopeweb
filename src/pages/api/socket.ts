import type { NextApiRequest } from 'next';
import type { NextApiResponse } from 'next';
import { Server as NetServer } from 'http';
import { Server as SocketIOServer, type Socket } from 'socket.io';
import type { MarketPrices } from '@/lib/gameUtils';

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

function emitPresence(socket: Socket, io: SocketIOServer, city: string) {
  const room = io.sockets.adapter.rooms.get(city);
  const count = room ? room.size : 1;
  io.to(city).emit('presence', { city, count });
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
      });

      socket.on('travel', (city: string) => {
        if (socket.data.city) {
          socket.leave(socket.data.city);
        }
        socket.data.city = city;
        socket.join(city);
        emitPresence(socket, io, city);
      });

      socket.on('market:update', (payload: { city: string; prices: MarketPrices }) => {
        io.to(payload.city).emit('market:broadcast', payload);
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

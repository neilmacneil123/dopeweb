import { Server as NetServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { NextApiRequest } from 'next';
import { NextApiResponse } from 'next';

export type NextApiResponseServerIO = NextApiResponse & {
  socket: any & {
    server: NetServer & {
      io: SocketIOServer;
    };
  };
};

export const config = {
  api: {
    bodyParser: false,
  },
};

export default function ioHandler(req: NextApiRequest, res: NextApiResponseServerIO) {
  if (!res.socket.server.io) {
    const io = new SocketIOServer(res.socket.server);
    res.socket.server.io = io;

    io.on('connection', (socket) => {
      console.log('Client connected:', socket.id);

      socket.on('join-city', (city: string) => {
        socket.join(city);
        io.to(city).emit('player-joined', { id: socket.id, city });
      });

      socket.on('leave-city', (city: string) => {
        socket.leave(city);
        io.to(city).emit('player-left', { id: socket.id, city });
      });

      socket.on('market-update', (data: any) => {
        io.to(data.city).emit('market-changed', data);
      });

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
      });
    });
  }
  res.end();
}
'use client';

import clientIo from 'socket.io-client';

let socket: ReturnType<typeof clientIo> | null = null;

export function getSocket() {
  if (!socket) {
    socket = clientIo(process.env.NEXT_PUBLIC_SOCKET_URL || '', {
      path: '/api/socket',
      autoConnect: true,
      transports: ['websocket', 'polling'],
    });
  }
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

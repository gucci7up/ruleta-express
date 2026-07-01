import { io, Socket } from 'socket.io-client';
import { SocketEvent } from '@ruleta/shared';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(import.meta.env.VITE_DISPLAY_WS_URL ?? 'http://localhost:3000', {
      transports: ['websocket'],
    });
  }
  return socket;
}

export { SocketEvent };

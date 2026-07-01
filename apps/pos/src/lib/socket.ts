import { io, Socket } from 'socket.io-client';
import { SocketEvent } from '@ruleta/shared';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(import.meta.env.VITE_WS_URL ?? 'http://localhost:3000', {
      transports: ['websocket'],
      autoConnect: true,
    });
  }
  return socket;
}

export function subscribeToBranch(branchId: number) {
  getSocket().emit(SocketEvent.SUBSCRIBE_BRANCH, { branchId });
}

export function subscribeToTicket(uuid: string) {
  getSocket().emit(SocketEvent.SUBSCRIBE_TICKET, { uuid });
}

export { SocketEvent };

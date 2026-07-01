import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import {
  SocketEvent,
  RoundStatePayload,
  RoundResultPayload,
  TicketResultPayload,
  SOCKET_ROOMS,
} from '@ruleta/shared';

@WebSocketGateway({
  cors: { origin: '*', credentials: true },
  namespace: '/',
})
export class RuletaGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(RuletaGateway.name);

  handleConnection(client: Socket) {
    this.logger.log(`Cliente conectado: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Cliente desconectado: ${client.id}`);
  }

  // El cliente se suscribe a los eventos de una sucursal
  @SubscribeMessage(SocketEvent.SUBSCRIBE_BRANCH)
  handleSubscribeBranch(
    @MessageBody() data: { branchId: number },
    @ConnectedSocket() client: Socket,
  ) {
    const room = SOCKET_ROOMS.branch(data.branchId);
    client.join(room);
    this.logger.log(`${client.id} → sala ${room}`);
    return { joined: room };
  }

  // El cliente se suscribe a actualizaciones de un ticket específico (página QR)
  @SubscribeMessage(SocketEvent.SUBSCRIBE_TICKET)
  handleSubscribeTicket(
    @MessageBody() data: { uuid: string },
    @ConnectedSocket() client: Socket,
  ) {
    const room = SOCKET_ROOMS.ticket(data.uuid);
    client.join(room);
    return { joined: room };
  }

  // ── Métodos para emitir desde otros servicios ──────────────

  emitRoundState(branchId: number, payload: RoundStatePayload) {
    this.server.to(SOCKET_ROOMS.branch(branchId)).emit(SocketEvent.ROUND_STATE, payload);
  }

  emitCountdown(branchId: number, seconds: number) {
    this.server.to(SOCKET_ROOMS.branch(branchId)).emit(SocketEvent.ROUND_COUNTDOWN, { seconds });
  }

  emitClosingWarning(branchId: number, secondsLeft: number) {
    this.server.to(SOCKET_ROOMS.branch(branchId)).emit(SocketEvent.ROUND_CLOSING, { secondsLeft });
  }

  emitRoundClosed(branchId: number, roundId: number) {
    this.server.to(SOCKET_ROOMS.branch(branchId)).emit(SocketEvent.ROUND_CLOSED, { roundId });
  }

  emitDrawing(branchId: number, roundId: number) {
    this.server.to(SOCKET_ROOMS.branch(branchId)).emit(SocketEvent.ROUND_DRAWING, { roundId });
  }

  emitResult(branchId: number, payload: RoundResultPayload) {
    this.server.to(SOCKET_ROOMS.branch(branchId)).emit(SocketEvent.ROUND_RESULT, payload);
  }

  emitTicketResult(uuid: string, payload: TicketResultPayload) {
    this.server.to(SOCKET_ROOMS.ticket(uuid)).emit(SocketEvent.TICKET_RESULT, payload);
  }
}

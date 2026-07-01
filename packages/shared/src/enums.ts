export enum RoundStatus {
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
  DRAWING = 'DRAWING',
  FINISHED = 'FINISHED',
}

export enum TicketStatus {
  PENDING = 'PENDING',
  WINNER = 'WINNER',
  LOSER = 'LOSER',
  CANCELLED = 'CANCELLED',
  PAID = 'PAID',
}

export enum BetType {
  NUMBER = 'NUMBER',
  COLOR = 'COLOR',
}

export enum UserRole {
  SUPERADMIN = 'SUPERADMIN',
  ADMIN = 'ADMIN',
  SUPERVISOR = 'SUPERVISOR',
  OPERATOR = 'OPERATOR',
}

export enum ColorName {
  VERDE = 'VERDE',
  ROJO = 'ROJO',
  NEGRO = 'NEGRO',
}

export enum SocketEvent {
  ROUND_STATE = 'round:state',
  ROUND_COUNTDOWN = 'round:countdown',
  ROUND_CLOSING = 'round:closing',
  ROUND_CLOSED = 'round:closed',
  ROUND_DRAWING = 'round:drawing',
  ROUND_RESULT = 'round:result',
  TICKET_RESULT = 'ticket:result',
  SUBSCRIBE_BRANCH = 'subscribe:branch',
  SUBSCRIBE_TICKET = 'subscribe:ticket',
}

import { BetType, ColorName, RoundStatus, TicketStatus, UserRole } from './enums';

export interface RoundStatePayload {
  roundId: number;
  status: RoundStatus;
  secondsLeft: number;
  openAt: string;
  closeAt: string;
  drawAt: string;
}

export interface RoundResultPayload {
  roundId: number;
  number: number;
  color: ColorName;
  colorHex: string;
  drawnAt: string;
}

export interface TicketResultPayload {
  uuid: string;
  status: TicketStatus;
  totalBet: number;
  totalPrize: number;
}

export interface BetItemDto {
  type: BetType;
  reference: string; // "0"-"18" | "ROJO" | "NEGRO" | "VERDE"
  amount: number;
}

export interface TicketPublicDto {
  uuid: string;
  roundId: number;
  roundStatus: RoundStatus;
  status: TicketStatus;
  totalBet: number;
  totalPrize: number;
  items: {
    type: BetType;
    reference: string;
    amount: number;
    isWinner: boolean | null;
    prize: number;
  }[];
  createdAt: string;
  round: {
    closeAt: string;
    drawAt: string;
    winningNumber?: {
      number: number;
      color: ColorName;
    };
  };
}

export interface JwtPayload {
  sub: number;
  email: string;
  role: UserRole;
  branchId: number | null;
  terminalId: number | null;
}

export interface NumberColorMap {
  number: number;
  color: ColorName;
  hex: string;
}

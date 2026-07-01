import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { BetType, RoundStatus, TicketStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { SettingsService } from '../settings/settings.service';
import { RuletaGateway } from '../websockets/ruleta.gateway';
import { CreateTicketDto } from './dto/create-ticket.dto';

@Injectable()
export class TicketsService {
  private readonly logger = new Logger(TicketsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly settings: SettingsService,
    private readonly gateway: RuletaGateway,
  ) {}

  async create(dto: CreateTicketDto, userId: number, terminalId: number) {
    // Validar que la ronda existe y está ABIERTA
    const round = await this.prisma.round.findUnique({ where: { id: dto.roundId } });
    if (!round) throw new NotFoundException('Ronda no encontrada');
    if (round.status !== RoundStatus.OPEN) {
      throw new BadRequestException('Las apuestas para esta ronda están cerradas');
    }

    // Validar montos
    const { minAmount, maxAmount } = await this.settings.getBetConfig();
    for (const item of dto.items) {
      if (item.amount < minAmount || item.amount > maxAmount) {
        throw new BadRequestException(
          `El monto de cada apuesta debe estar entre RD$${minAmount} y RD$${maxAmount}`,
        );
      }
    }

    // Validar referencias (número 0-18 o color válido)
    for (const item of dto.items) {
      if (item.type === BetType.NUMBER) {
        const n = parseInt(item.reference);
        if (isNaN(n) || n < 0 || n > 18) {
          throw new BadRequestException(`Número inválido: ${item.reference}`);
        }
        item.reference = String(n); // normalizar
      } else {
        if (!['ROJO', 'NEGRO', 'VERDE'].includes(item.reference)) {
          throw new BadRequestException(`Color inválido: ${item.reference}`);
        }
      }
    }

    const totalBet = dto.items.reduce((sum, i) => sum + i.amount, 0);

    const ticket = await this.prisma.ticket.create({
      data: {
        roundId: dto.roundId,
        terminalId,
        userId,
        totalBet,
        items: {
          create: dto.items.map((i) => ({
            type: i.type as BetType,
            reference: i.reference,
            amount: i.amount,
          })),
        },
      },
      include: {
        items: true,
        round: { select: { closeAt: true, drawAt: true, status: true } },
        terminal: { include: { branch: { select: { id: true, name: true } } } },
        user: { select: { id: true, name: true } },
      },
    });

    this.logger.log(`Ticket ${ticket.uuid} creado — RD$${totalBet} — ${dto.items.length} apuestas`);
    return ticket;
  }

  async findByUuid(uuid: string) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { uuid },
      include: {
        items: true,
        round: {
          include: { winningNumber: { include: { color: true } } },
        },
        terminal: { select: { name: true, branch: { select: { name: true } } } },
        user: { select: { name: true } },
      },
    });
    if (!ticket) throw new NotFoundException('Ticket no encontrado');
    return ticket;
  }

  async findByTerminal(terminalId: number, date?: string) {
    const start = date ? new Date(date) : new Date(new Date().setHours(0, 0, 0, 0));
    const end = date ? new Date(new Date(date).setHours(23, 59, 59, 999)) : new Date(new Date().setHours(23, 59, 59, 999));

    return this.prisma.ticket.findMany({
      where: { terminalId, createdAt: { gte: start, lte: end } },
      include: { items: true, round: { select: { status: true, winningNumber: { include: { color: true } } } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async cancel(uuid: string, userId: number) {
    const ticket = await this.findByUuid(uuid);
    if (ticket.userId !== userId) throw new ForbiddenException('No puedes cancelar este ticket');
    if (ticket.status !== TicketStatus.PENDING) {
      throw new BadRequestException('Solo se pueden cancelar tickets pendientes');
    }
    if (ticket.round.status !== RoundStatus.OPEN) {
      throw new BadRequestException('No se puede cancelar: la ronda ya cerró');
    }

    return this.prisma.ticket.update({
      where: { uuid },
      data: { status: TicketStatus.CANCELLED, cancelledAt: new Date() },
    });
  }

  async markPrinted(uuid: string) {
    return this.prisma.ticket.update({
      where: { uuid },
      data: { printedAt: new Date() },
    });
  }

  async markPaid(uuid: string) {
    const ticket = await this.findByUuid(uuid);
    if (ticket.status !== TicketStatus.WINNER) {
      throw new BadRequestException('Solo se pueden pagar tickets ganadores');
    }
    return this.prisma.ticket.update({
      where: { uuid },
      data: { status: TicketStatus.PAID, paidAt: new Date() },
    });
  }
}

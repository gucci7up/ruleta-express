import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { RoundStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { RoundsService } from './rounds.service';

@Injectable()
export class RoundSchedulerJob {
  private readonly logger = new Logger(RoundSchedulerJob.name);
  private processing = new Set<number>(); // evita procesar la misma ronda dos veces

  constructor(
    private readonly prisma: PrismaService,
    private readonly roundsService: RoundsService,
  ) {}

  // Corre cada 5 segundos — maneja transiciones de estado
  @Cron('*/5 * * * * *')
  async handleRoundTransitions() {
    const now = new Date();

    // 1. OPEN → CLOSED (cuando closeAt ya pasó)
    const toClose = await this.prisma.round.findMany({
      where: { status: RoundStatus.OPEN, closeAt: { lte: now } },
      select: { id: true, branchId: true },
    });

    for (const round of toClose) {
      if (this.processing.has(round.id)) continue;
      this.processing.add(round.id);
      try {
        await this.roundsService.closeRound(round.id);
      } catch (e) {
        this.logger.error(`Error cerrando ronda #${round.id}`, e);
      } finally {
        this.processing.delete(round.id);
      }
    }

    // 2. CLOSED → DRAWING → FINISHED (cuando drawAt ya pasó)
    const toDraw = await this.prisma.round.findMany({
      where: { status: RoundStatus.CLOSED, drawAt: { lte: now } },
      select: { id: true, branchId: true },
    });

    for (const round of toDraw) {
      if (this.processing.has(round.id)) continue;
      this.processing.add(round.id);
      try {
        const result = await this.roundsService.executeDrawing(round.id);
        // Calcular premios de los tickets de esta ronda
        await this.calculateRoundPrizes(round.id, result.winningNumber, result.color);
        // Abrir siguiente ronda automáticamente
        await this.roundsService.createRound(round.branchId);
      } catch (e) {
        this.logger.error(`Error en sorteo ronda #${round.id}`, e);
      } finally {
        this.processing.delete(round.id);
      }
    }
  }

  // Corre cada segundo — envía countdown a clientes
  @Cron(CronExpression.EVERY_SECOND)
  async handleCountdown() {
    const openRounds = await this.prisma.round.findMany({
      where: { status: RoundStatus.OPEN },
      select: { id: true, branchId: true, closeAt: true },
    });

    for (const round of openRounds) {
      await this.roundsService.tickCountdown(round);
    }
  }

  // Al arrancar el servidor: verificar que cada sucursal activa tiene una ronda abierta
  async onModuleInit() {
    const branchIds = await this.roundsService.getActiveBranches();
    for (const branchId of branchIds) {
      const existing = await this.roundsService.findCurrent(branchId);
      if (!existing) {
        this.logger.log(`Sucursal ${branchId}: sin ronda activa, creando...`);
        await this.roundsService.createRound(branchId);
      }
    }
  }

  private async calculateRoundPrizes(roundId: number, winningNumber: number, winningColor: string) {
    const tickets = await this.prisma.ticket.findMany({
      where: { roundId, status: 'PENDING' },
      include: { items: true },
    });

    for (const ticket of tickets) {
      let totalPrize = 0;
      const itemUpdates: { id: number; isWinner: boolean; prize: number }[] = [];

      for (const item of ticket.items) {
        const isWinner =
          item.type === 'NUMBER'
            ? item.reference === String(winningNumber)
            : item.reference === winningColor;

        if (isWinner) {
          const payout = await this.prisma.payout.findUnique({
            where: { type_reference: { type: item.type, reference: item.reference } },
          });
          const multiplier = payout ? Number(payout.multiplier) : 0;
          const prize = Number(item.amount) * multiplier;
          totalPrize += prize;
          itemUpdates.push({ id: item.id, isWinner: true, prize });
        } else {
          itemUpdates.push({ id: item.id, isWinner: false, prize: 0 });
        }
      }

      await this.prisma.$transaction([
        ...itemUpdates.map((u) =>
          this.prisma.ticket_Item.update({
            where: { id: u.id },
            data: { isWinner: u.isWinner, prize: u.prize },
          }),
        ),
        this.prisma.ticket.update({
          where: { id: ticket.id },
          data: {
            status: totalPrize > 0 ? 'WINNER' : 'LOSER',
            totalPrize,
          },
        }),
      ]);
    }

    this.logger.log(`Premios calculados para ronda #${roundId} — ${tickets.length} tickets`);
  }
}

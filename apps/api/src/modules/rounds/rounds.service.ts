import { Injectable, Inject, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { RoundStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { RuletaGateway } from '../websockets/ruleta.gateway';
import { ColorsService } from '../colors/colors.service';
import { SettingsService } from '../settings/settings.service';
import { DrawProvider, DRAW_PROVIDER } from '../draw/draw.interface';

@Injectable()
export class RoundsService {
  private readonly logger = new Logger(RoundsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly gateway: RuletaGateway,
    private readonly colors: ColorsService,
    private readonly settings: SettingsService,
    @Inject(DRAW_PROVIDER) private readonly drawProvider: DrawProvider,
  ) {}

  async findAll(branchId?: number, status?: RoundStatus) {
    return this.prisma.round.findMany({
      where: { ...(branchId && { branchId }), ...(status && { status }) },
      include: {
        winningNumber: { include: { color: true } },
        _count: { select: { tickets: true } },
      },
      orderBy: { openAt: 'desc' },
      take: 50,
    });
  }

  async findCurrent(branchId: number) {
    return this.prisma.round.findFirst({
      where: { branchId, status: { in: [RoundStatus.OPEN, RoundStatus.CLOSED, RoundStatus.DRAWING] } },
      include: { winningNumber: { include: { color: true } } },
      orderBy: { openAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const round = await this.prisma.round.findUnique({
      where: { id },
      include: {
        winningNumber: { include: { color: true } },
        _count: { select: { tickets: true } },
        branch: { select: { id: true, name: true } },
      },
    });
    if (!round) throw new NotFoundException('Ronda no encontrada');
    return round;
  }

  // Crea una nueva ronda OPEN para una sucursal
  async createRound(branchId: number): Promise<typeof this.prisma.round.fields> {
    const config = await this.settings.getRoundConfig();
    const now = new Date();
    const durationMs = config.duration * 60 * 1000;
    const drawOffsetMs = config.drawDuration * 1000;

    const openAt = now;
    const closeAt = new Date(now.getTime() + durationMs - drawOffsetMs - (config.finishPause * 1000));
    const drawAt = new Date(closeAt.getTime() + config.closeWarning * 1000);

    const round = await this.prisma.round.create({
      data: { branchId, status: RoundStatus.OPEN, openAt, closeAt, drawAt },
    });

    this.logger.log(`Ronda #${round.id} abierta para sucursal ${branchId}`);
    this.emitRoundState(round);
    return round as any;
  }

  // Transición OPEN → CLOSED
  async closeRound(roundId: number) {
    const round = await this.prisma.round.update({
      where: { id: roundId },
      data: { status: RoundStatus.CLOSED },
    });
    this.logger.log(`Ronda #${roundId} CERRADA`);
    this.gateway.emitRoundClosed(round.branchId, roundId);
    return round;
  }

  // Transición CLOSED → DRAWING → ejecuta sorteo → FINISHED
  async executeDrawing(roundId: number) {
    const round = await this.prisma.round.update({
      where: { id: roundId },
      data: { status: RoundStatus.DRAWING },
    });

    this.gateway.emitDrawing(round.branchId, roundId);
    this.logger.log(`Ronda #${roundId} GIRANDO...`);

    // El DrawProvider es pluggable — no hay lógica hardcodeada aquí
    const winningNumber = await this.drawProvider.draw(roundId);
    const colorEntry = await this.colors.getColorForNumber(winningNumber);

    // Guardar resultado
    const winningRecord = await this.prisma.winningNumber.create({
      data: {
        roundId,
        number: winningNumber,
        colorId: (await this.prisma.color.findUnique({ where: { name: colorEntry.color } }))!.id,
      },
      include: { color: true },
    });

    await this.prisma.round.update({
      where: { id: roundId },
      data: { status: RoundStatus.FINISHED, finishAt: new Date() },
    });

    this.logger.log(`Ronda #${roundId} → número ganador: ${winningNumber} (${colorEntry.color})`);

    this.gateway.emitResult(round.branchId, {
      roundId,
      number: winningNumber,
      color: colorEntry.color as any,
      colorHex: colorEntry.hex,
      drawnAt: winningRecord.drawnAt.toISOString(),
    });

    return { roundId, winningNumber, color: colorEntry.color };
  }

  // Lógica del countdown y warnings — llamado por el job cada segundo
  async tickCountdown(round: { id: number; branchId: number; closeAt: Date }) {
    const secondsLeft = Math.max(0, Math.floor((round.closeAt.getTime() - Date.now()) / 1000));
    this.gateway.emitCountdown(round.branchId, secondsLeft);

    const config = await this.settings.getRoundConfig();
    if (secondsLeft <= config.closeWarning && secondsLeft > 0) {
      this.gateway.emitClosingWarning(round.branchId, secondsLeft);
    }
  }

  private async emitRoundState(round: any) {
    const secondsLeft = Math.max(0, Math.floor((round.closeAt.getTime() - Date.now()) / 1000));
    this.gateway.emitRoundState(round.branchId, {
      roundId: round.id,
      status: round.status,
      secondsLeft,
      openAt: round.openAt.toISOString(),
      closeAt: round.closeAt.toISOString(),
      drawAt: round.drawAt.toISOString(),
    });
  }

  async getHistory(branchId: number, limit = 20) {
    return this.prisma.round.findMany({
      where: { branchId, status: RoundStatus.FINISHED },
      include: { winningNumber: { include: { color: true } } },
      orderBy: { finishAt: 'desc' },
      take: limit,
    });
  }

  async getActiveBranches(): Promise<number[]> {
    const branches = await this.prisma.branch.findMany({
      where: { isActive: true },
      select: { id: true },
    });
    return branches.map((b) => b.id);
  }
}

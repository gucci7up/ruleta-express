import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CloseCashDto } from './dto/close-cash.dto';

@Injectable()
export class CashService {
  constructor(private readonly prisma: PrismaService) {}

  async close(dto: CloseCashDto, userId: number, terminalId: number) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [salesResult, prizesResult] = await Promise.all([
      this.prisma.ticket.aggregate({
        where: { terminalId, status: { not: 'CANCELLED' }, createdAt: { gte: today } },
        _sum: { totalBet: true },
      }),
      this.prisma.ticket.aggregate({
        where: { terminalId, status: { in: ['WINNER', 'PAID'] }, createdAt: { gte: today } },
        _sum: { totalPrize: true },
      }),
    ]);

    const salesTotal = Number(salesResult._sum.totalBet ?? 0);
    const prizesTotal = Number(prizesResult._sum.totalPrize ?? 0);

    const terminal = await this.prisma.terminal.findUnique({ where: { id: terminalId } });
    if (!terminal) throw new BadRequestException('Terminal no encontrada');

    return this.prisma.cashClosing.create({
      data: {
        terminalId,
        branchId: terminal.branchId,
        userId,
        openAmount: dto.openAmount,
        closeAmount: dto.closeAmount,
        salesTotal,
        prizesTotal,
        netTotal: salesTotal - prizesTotal,
        notes: dto.notes,
      },
    });
  }

  async getHistory(terminalId: number) {
    return this.prisma.cashClosing.findMany({
      where: { terminalId },
      include: { user: { select: { name: true } } },
      orderBy: { date: 'desc' },
      take: 30,
    });
  }
}

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboard(branchId?: number) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const where = {
      createdAt: { gte: today, lt: tomorrow },
      status: { not: 'CANCELLED' as any },
      ...(branchId && { terminal: { branchId } }),
    };

    const [totalTickets, salesResult, prizesResult, winners, rounds] = await Promise.all([
      this.prisma.ticket.count({ where }),
      this.prisma.ticket.aggregate({ where, _sum: { totalBet: true } }),
      this.prisma.ticket.aggregate({
        where: { ...where, status: { in: ['WINNER', 'PAID'] } },
        _sum: { totalPrize: true },
      }),
      this.prisma.ticket.count({ where: { ...where, status: { in: ['WINNER', 'PAID'] } } }),
      this.prisma.round.count({
        where: {
          status: 'FINISHED',
          createdAt: { gte: today, lt: tomorrow },
          ...(branchId && { branchId }),
        },
      }),
    ]);

    const totalSales = Number(salesResult._sum.totalBet ?? 0);
    const totalPrizes = Number(prizesResult._sum.totalPrize ?? 0);

    return {
      date: today.toISOString().split('T')[0],
      totalTickets,
      totalSales,
      totalPrizes,
      netRevenue: totalSales - totalPrizes,
      winners,
      winRate: totalTickets > 0 ? (winners / totalTickets) * 100 : 0,
      rtp: totalSales > 0 ? (totalPrizes / totalSales) * 100 : 0,
      rounds,
    };
  }

  async getByDate(date: string, branchId?: number) {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    const tickets = await this.prisma.ticket.findMany({
      where: {
        createdAt: { gte: start, lte: end },
        status: { not: 'CANCELLED' },
        ...(branchId && { terminal: { branchId } }),
      },
      include: {
        items: true,
        terminal: { select: { name: true, branch: { select: { name: true } } } },
        user: { select: { name: true } },
        round: { include: { winningNumber: { include: { color: true } } } },
      },
      orderBy: { createdAt: 'asc' },
    });

    return tickets;
  }

  async getByOperator(userId: number, startDate: string, endDate: string) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const [tickets, summary] = await Promise.all([
      this.prisma.ticket.findMany({
        where: { userId, createdAt: { gte: start, lte: end }, status: { not: 'CANCELLED' } },
        include: { items: true, round: { select: { status: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.ticket.aggregate({
        where: { userId, createdAt: { gte: start, lte: end }, status: { not: 'CANCELLED' } },
        _sum: { totalBet: true, totalPrize: true },
        _count: true,
      }),
    ]);

    return {
      tickets,
      summary: {
        count: summary._count,
        totalBet: Number(summary._sum.totalBet ?? 0),
        totalPrize: Number(summary._sum.totalPrize ?? 0),
      },
    };
  }

  async getByRound(roundId: number) {
    const [round, tickets, summary] = await Promise.all([
      this.prisma.round.findUnique({
        where: { id: roundId },
        include: { winningNumber: { include: { color: true } } },
      }),
      this.prisma.ticket.findMany({
        where: { roundId, status: { not: 'CANCELLED' } },
        include: { items: true, user: { select: { name: true } } },
      }),
      this.prisma.ticket.aggregate({
        where: { roundId, status: { not: 'CANCELLED' } },
        _sum: { totalBet: true, totalPrize: true },
        _count: true,
      }),
    ]);

    return {
      round,
      tickets,
      summary: {
        count: summary._count,
        totalBet: Number(summary._sum.totalBet ?? 0),
        totalPrize: Number(summary._sum.totalPrize ?? 0),
        net: Number(summary._sum.totalBet ?? 0) - Number(summary._sum.totalPrize ?? 0),
      },
    };
  }

  async getMonthly(year: number, month: number, branchId?: number) {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59);

    return this.prisma.ticket.groupBy({
      by: ['createdAt'],
      where: {
        createdAt: { gte: start, lte: end },
        status: { not: 'CANCELLED' },
        ...(branchId && { terminal: { branchId } }),
      },
      _sum: { totalBet: true, totalPrize: true },
      _count: true,
    });
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { BetType } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdatePayoutDto } from './dto/update-payout.dto';

@Injectable()
export class PayoutsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.payout.findMany({
      where: { isActive: true },
      orderBy: [{ type: 'asc' }, { reference: 'asc' }],
    });
  }

  // Obtener multiplicador para una apuesta específica — siempre consulta DB
  async getMultiplier(type: BetType, reference: string): Promise<number> {
    const payout = await this.prisma.payout.findUnique({
      where: { type_reference: { type, reference } },
    });
    if (!payout || !payout.isActive) {
      throw new NotFoundException(`No hay payout configurado para ${type}:${reference}`);
    }
    return Number(payout.multiplier);
  }

  async update(id: number, dto: UpdatePayoutDto) {
    const payout = await this.prisma.payout.findUnique({ where: { id } });
    if (!payout) throw new NotFoundException('Payout no encontrado');
    return this.prisma.payout.update({ where: { id }, data: dto });
  }

  async toggleActive(id: number) {
    const payout = await this.prisma.payout.findUnique({ where: { id } });
    if (!payout) throw new NotFoundException('Payout no encontrado');
    return this.prisma.payout.update({ where: { id }, data: { isActive: !payout.isActive } });
  }
}

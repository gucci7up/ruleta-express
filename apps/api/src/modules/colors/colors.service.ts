import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateNumberColorDto } from './dto/update-number-color.dto';

@Injectable()
export class ColorsService {
  constructor(private readonly prisma: PrismaService) {}

  // Retorna todos los colores disponibles
  getColors() {
    return this.prisma.color.findMany({ orderBy: { name: 'asc' } });
  }

  // Retorna el mapping completo número → color (0-18)
  async getNumberColorMap() {
    const entries = await this.prisma.numberColor.findMany({
      include: { color: true },
      orderBy: { number: 'asc' },
    });
    return entries.map((e) => ({
      number: e.number,
      color: e.color.name,
      hex: e.color.hex,
    }));
  }

  // Retorna el color de un número específico
  async getColorForNumber(number: number) {
    const entry = await this.prisma.numberColor.findUnique({
      where: { number },
      include: { color: true },
    });
    if (!entry) throw new NotFoundException(`Número ${number} no tiene color asignado`);
    return { number: entry.number, color: entry.color.name, hex: entry.color.hex };
  }

  // Permite reasignar el color de un número sin tocar el código
  async updateNumberColor(number: number, dto: UpdateNumberColorDto) {
    const existing = await this.prisma.numberColor.findUnique({ where: { number } });
    if (!existing) throw new NotFoundException(`Número ${number} no encontrado`);

    const color = await this.prisma.color.findUnique({ where: { name: dto.colorName } });
    if (!color) throw new NotFoundException(`Color ${dto.colorName} no encontrado`);

    return this.prisma.numberColor.update({
      where: { number },
      data: { colorId: color.id },
      include: { color: true },
    });
  }
}

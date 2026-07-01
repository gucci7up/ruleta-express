import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTerminalDto } from './dto/create-terminal.dto';
import { UpdateTerminalDto } from './dto/update-terminal.dto';

@Injectable()
export class TerminalsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(branchId?: number) {
    return this.prisma.terminal.findMany({
      where: { isActive: true, ...(branchId && { branchId }) },
      include: { branch: { select: { id: true, name: true } } },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: number) {
    const t = await this.prisma.terminal.findUnique({
      where: { id },
      include: { branch: true },
    });
    if (!t) throw new NotFoundException('Terminal no encontrada');
    return t;
  }

  create(dto: CreateTerminalDto) {
    return this.prisma.terminal.create({
      data: dto,
      include: { branch: { select: { id: true, name: true } } },
    });
  }

  async update(id: number, dto: UpdateTerminalDto) {
    await this.findOne(id);
    return this.prisma.terminal.update({ where: { id }, data: dto });
  }

  async deactivate(id: number) {
    await this.findOne(id);
    return this.prisma.terminal.update({ where: { id }, data: { isActive: false } });
  }
}

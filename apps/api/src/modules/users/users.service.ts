import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(branchId?: number) {
    return this.prisma.user.findMany({
      where: { ...(branchId && { branchId }), isActive: true },
      select: {
        id: true, name: true, email: true, role: true,
        branchId: true, terminalId: true, isActive: true,
        lastLoginAt: true, createdAt: true,
        branch: { select: { id: true, name: true } },
        terminal: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: number) {
    return this.prisma.user.findUnique({
      where: { id },
      include: {
        branch: { select: { id: true, name: true } },
        terminal: { select: { id: true, name: true } },
      },
    });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async create(dto: CreateUserDto) {
    const exists = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (exists) throw new ConflictException('El email ya está en uso');

    const password = await bcrypt.hash(dto.password, 10);
    const pin = dto.pin ? await bcrypt.hash(dto.pin, 10) : undefined;

    return this.prisma.user.create({
      data: { ...dto, password, pin },
      select: {
        id: true, name: true, email: true, role: true,
        branchId: true, terminalId: true, createdAt: true,
      },
    });
  }

  async update(id: number, dto: UpdateUserDto) {
    const user = await this.findById(id);
    if (!user) throw new NotFoundException('Usuario no encontrado');

    const data: any = { ...dto };
    if (dto.password) data.password = await bcrypt.hash(dto.password, 10);
    if (dto.pin) data.pin = await bcrypt.hash(dto.pin, 10);

    return this.prisma.user.update({
      where: { id },
      data,
      select: {
        id: true, name: true, email: true, role: true,
        branchId: true, terminalId: true, updatedAt: true,
      },
    });
  }

  async deactivate(id: number) {
    return this.prisma.user.update({ where: { id }, data: { isActive: false } });
  }

  async updateLastLogin(id: number) {
    return this.prisma.user.update({ where: { id }, data: { lastLoginAt: new Date() } });
  }

  async findOperatorsByBranch(branchId: number) {
    return this.prisma.user.findMany({
      where: { branchId, isActive: true },
      select: { id: true, name: true, role: true, pin: true },
    });
  }
}

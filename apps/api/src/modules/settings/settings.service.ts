import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.setting.findMany({ orderBy: { key: 'asc' } });
  }

  async get(key: string): Promise<string> {
    const setting = await this.prisma.setting.findUnique({ where: { key } });
    if (!setting) throw new NotFoundException(`Setting '${key}' no encontrado`);
    return setting.value;
  }

  async getNumber(key: string): Promise<number> {
    const value = await this.get(key);
    return parseFloat(value);
  }

  async set(key: string, value: string) {
    return this.prisma.setting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
  }

  async setMany(entries: { key: string; value: string }[]) {
    return Promise.all(entries.map((e) => this.set(e.key, e.value)));
  }

  // Obtener configuración de tiempos de ronda de una vez
  async getRoundConfig() {
    const [duration, closeWarning, drawDuration, finishPause] = await Promise.all([
      this.getNumber('round.duration_minutes'),
      this.getNumber('round.close_warning_seconds'),
      this.getNumber('round.draw_duration_seconds'),
      this.getNumber('round.finish_pause_seconds'),
    ]);
    return { duration, closeWarning, drawDuration, finishPause };
  }

  async getBetConfig() {
    const [minAmount, maxAmount] = await Promise.all([
      this.getNumber('bet.min_amount'),
      this.getNumber('bet.max_amount'),
    ]);
    return { minAmount, maxAmount };
  }
}

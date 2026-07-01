import { Controller, Get, Param, ParseIntPipe, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RoundStatus } from '@prisma/client';
import { RoundsService } from './rounds.service';

@ApiTags('Rounds')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('rounds')
export class RoundsController {
  constructor(private readonly service: RoundsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar rondas (con filtros)' })
  findAll(
    @Query('branchId') branchId?: number,
    @Query('status') status?: RoundStatus,
  ) {
    return this.service.findAll(branchId, status);
  }

  @Get('current/:branchId')
  @ApiOperation({ summary: 'Ronda activa de una sucursal' })
  getCurrent(@Param('branchId', ParseIntPipe) branchId: number) {
    return this.service.findCurrent(branchId);
  }

  @Get('history/:branchId')
  @ApiOperation({ summary: 'Últimas rondas finalizadas' })
  getHistory(
    @Param('branchId', ParseIntPipe) branchId: number,
    @Query('limit') limit?: number,
  ) {
    return this.service.getHistory(branchId, limit);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }
}

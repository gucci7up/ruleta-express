import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dto/create-ticket.dto';

@ApiTags('Tickets')
@Controller('tickets')
export class TicketsController {
  constructor(private readonly service: TicketsService) {}

  // Ruta pública — accesible vía QR sin login
  @Get(':uuid/public')
  @ApiOperation({ summary: 'Consultar ticket por UUID (público para QR)' })
  findPublic(@Param('uuid') uuid: string) {
    return this.service.findByUuid(uuid);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Post()
  @ApiOperation({ summary: 'Crear ticket' })
  create(@Body() dto: CreateTicketDto, @CurrentUser() user: any) {
    return this.service.create(dto, user.id, user.terminalId);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Get('terminal/today')
  @ApiOperation({ summary: 'Tickets del día en la terminal actual' })
  findToday(@CurrentUser() user: any, @Query('date') date?: string) {
    return this.service.findByTerminal(user.terminalId, date);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Patch(':uuid/cancel')
  cancel(@Param('uuid') uuid: string, @CurrentUser() user: any) {
    return this.service.cancel(uuid, user.id);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Patch(':uuid/printed')
  markPrinted(@Param('uuid') uuid: string) {
    return this.service.markPrinted(uuid);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Patch(':uuid/paid')
  @ApiOperation({ summary: 'Marcar ticket ganador como pagado' })
  markPaid(@Param('uuid') uuid: string) {
    return this.service.markPaid(uuid);
  }
}

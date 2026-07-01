import { Controller, Get, Param, ParseIntPipe, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@ruleta/shared';
import { ReportsService } from './reports.service';

@ApiTags('Reports')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.SUPERVISOR)
@Controller('reports')
export class ReportsController {
  constructor(private readonly service: ReportsService) {}

  @Get('dashboard') dashboard(@Query('branchId') branchId?: number) { return this.service.getDashboard(branchId); }
  @Get('daily') daily(@Query('date') date: string, @Query('branchId') branchId?: number) { return this.service.getByDate(date, branchId); }
  @Get('operator/:userId') byOperator(@Param('userId', ParseIntPipe) userId: number, @Query('start') start: string, @Query('end') end: string) { return this.service.getByOperator(userId, start, end); }
  @Get('round/:roundId') byRound(@Param('roundId', ParseIntPipe) roundId: number) { return this.service.getByRound(roundId); }
  @Get('monthly') monthly(@Query('year') year: number, @Query('month') month: number, @Query('branchId') branchId?: number) { return this.service.getMonthly(year, month, branchId); }
}

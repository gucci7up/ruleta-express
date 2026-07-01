import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CashService } from './cash.service';
import { CloseCashDto } from './dto/close-cash.dto';

@ApiTags('Cash')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('cash')
export class CashController {
  constructor(private readonly service: CashService) {}

  @Post('close')
  close(@Body() dto: CloseCashDto, @CurrentUser() user: any) {
    return this.service.close(dto, user.id, user.terminalId);
  }

  @Get('history')
  history(@CurrentUser() user: any) {
    return this.service.getHistory(user.terminalId);
  }
}

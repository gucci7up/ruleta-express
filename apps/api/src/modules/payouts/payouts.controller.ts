import { Controller, Get, Patch, Param, Body, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@ruleta/shared';
import { PayoutsService } from './payouts.service';
import { UpdatePayoutDto } from './dto/update-payout.dto';

@ApiTags('Payouts')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('payouts')
export class PayoutsController {
  constructor(private readonly service: PayoutsService) {}

  @Get() findAll() { return this.service.findAll(); }

  @Patch(':id')
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN)
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePayoutDto) {
    return this.service.update(id, dto);
  }

  @Patch(':id/toggle')
  @Roles(UserRole.SUPERADMIN)
  toggle(@Param('id', ParseIntPipe) id: number) { return this.service.toggleActive(id); }
}

import { Controller, Get, Post, Patch, Delete, Body, Param, ParseIntPipe, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@ruleta/shared';
import { TerminalsService } from './terminals.service';
import { CreateTerminalDto } from './dto/create-terminal.dto';
import { UpdateTerminalDto } from './dto/update-terminal.dto';

@ApiTags('Terminals')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('terminals')
export class TerminalsController {
  constructor(private readonly service: TerminalsService) {}

  @Get() findAll(@Query('branchId') branchId?: number) { return this.service.findAll(branchId); }
  @Get(':id') findOne(@Param('id', ParseIntPipe) id: number) { return this.service.findOne(id); }

  @Post() @Roles(UserRole.SUPERADMIN, UserRole.ADMIN)
  create(@Body() dto: CreateTerminalDto) { return this.service.create(dto); }

  @Patch(':id') @Roles(UserRole.SUPERADMIN, UserRole.ADMIN)
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateTerminalDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id') @Roles(UserRole.SUPERADMIN)
  deactivate(@Param('id', ParseIntPipe) id: number) { return this.service.deactivate(id); }
}

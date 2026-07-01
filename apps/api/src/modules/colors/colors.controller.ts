import { Controller, Get, Patch, Param, Body, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@ruleta/shared';
import { ColorsService } from './colors.service';
import { UpdateNumberColorDto } from './dto/update-number-color.dto';

@ApiTags('Colors')
@Controller('colors')
export class ColorsController {
  constructor(private readonly service: ColorsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar colores disponibles' })
  getColors() { return this.service.getColors(); }

  @Get('numbers')
  @ApiOperation({ summary: 'Obtener mapping número→color completo (0-18)' })
  getMap() { return this.service.getNumberColorMap(); }

  @Get('numbers/:number')
  @ApiOperation({ summary: 'Obtener color de un número específico' })
  getOne(@Param('number', ParseIntPipe) number: number) {
    return this.service.getColorForNumber(number);
  }

  @Patch('numbers/:number')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'Reasignar color a un número' })
  update(@Param('number', ParseIntPipe) number: number, @Body() dto: UpdateNumberColorDto) {
    return this.service.updateNumberColor(number, dto);
  }
}

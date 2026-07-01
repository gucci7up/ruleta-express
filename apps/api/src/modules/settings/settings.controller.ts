import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@ruleta/shared';
import { SettingsService } from './settings.service';
import { IsArray, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class SettingEntryDto {
  @ApiProperty() @IsString() key: string;
  @ApiProperty() @IsString() value: string;
}

class UpdateSettingsDto {
  @ApiProperty({ type: [SettingEntryDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SettingEntryDto)
  settings: SettingEntryDto[];
}

@ApiTags('Settings')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('settings')
export class SettingsController {
  constructor(private readonly service: SettingsService) {}

  @Get()
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN)
  findAll() { return this.service.findAll(); }

  @Put()
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN)
  updateMany(@Body() dto: UpdateSettingsDto) {
    return this.service.setMany(dto.settings);
  }
}

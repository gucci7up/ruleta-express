import { IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdatePayoutDto {
  @ApiPropertyOptional({ example: 18 }) @IsOptional() @IsNumber() @Min(1) multiplier?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
}

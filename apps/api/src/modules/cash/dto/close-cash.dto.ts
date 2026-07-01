import { IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CloseCashDto {
  @ApiProperty({ example: 0 }) @IsNumber() @Min(0) openAmount: number;
  @ApiProperty({ example: 5000 }) @IsNumber() @Min(0) closeAmount: number;
  @ApiPropertyOptional() @IsOptional() @IsString() notes?: string;
}

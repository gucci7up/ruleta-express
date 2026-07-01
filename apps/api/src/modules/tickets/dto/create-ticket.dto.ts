import { IsArray, IsEnum, IsInt, IsNumber, IsString, Max, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { BetType } from '@ruleta/shared';

export class BetItemDto {
  @ApiProperty({ enum: BetType }) @IsEnum(BetType) type: BetType;
  @ApiProperty({ example: '7' }) @IsString() reference: string; // "0"-"18" | "ROJO"|"NEGRO"|"VERDE"
  @ApiProperty({ example: 100 }) @IsNumber() @Min(10) @Max(1000) amount: number;
}

export class CreateTicketDto {
  @ApiProperty() @IsInt() roundId: number;
  @ApiProperty({ type: [BetItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BetItemDto)
  items: BetItemDto[];
}

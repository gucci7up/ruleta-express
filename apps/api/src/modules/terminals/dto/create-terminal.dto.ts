import { IsInt, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTerminalDto {
  @ApiProperty() @IsString() name: string;
  @ApiProperty() @IsInt() branchId: number;
}

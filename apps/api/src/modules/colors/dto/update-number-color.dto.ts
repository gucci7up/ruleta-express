import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ColorName } from '@ruleta/shared';

export class UpdateNumberColorDto {
  @ApiProperty({ enum: ColorName, example: ColorName.ROJO })
  @IsEnum(ColorName)
  colorName: ColorName;
}

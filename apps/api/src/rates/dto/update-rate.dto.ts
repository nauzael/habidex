import { IsNumber, Min, IsEnum, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Season } from '@prisma/client';

export class UpdateRateDto {
  @ApiProperty({ example: 130000 })
  @IsNumber()
  @Min(0)
  price!: number;

  @ApiProperty({ enum: Season, example: 'HIGH' })
  @IsEnum(Season)
  season!: Season;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(0)
  version!: number;
}

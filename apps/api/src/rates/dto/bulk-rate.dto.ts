import { IsString, IsNotEmpty, IsNumber, Min, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Season } from '@prisma/client';

export class BulkRateDto {
  @ApiProperty({ example: '2026-07-01' })
  @IsString()
  @IsNotEmpty()
  from!: string;

  @ApiProperty({ example: '2026-07-15' })
  @IsString()
  @IsNotEmpty()
  to!: string;

  @ApiProperty({ example: 'uuid' })
  @IsString()
  @IsNotEmpty()
  roomTypeId!: string;

  @ApiProperty({ example: 150000 })
  @IsNumber()
  @Min(0)
  price!: number;

  @ApiProperty({ enum: Season, example: 'HIGH' })
  @IsEnum(Season)
  season!: Season;
}

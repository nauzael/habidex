import { IsString, IsNotEmpty, IsNumber, Min, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Season } from '@prisma/client';

export class SeasonBulkDto {
  @ApiProperty({ example: '2026-07-01' })
  @IsString()
  @IsNotEmpty()
  from!: string;

  @ApiProperty({ example: '2026-12-31' })
  @IsString()
  @IsNotEmpty()
  to!: string;

  @ApiPropertyOptional({ example: 'uuid' })
  @IsString()
  @IsOptional()
  roomTypeId?: string;

  @ApiProperty({ example: 180000 })
  @IsNumber()
  @Min(0)
  price!: number;

  @ApiProperty({ enum: Season, example: 'HIGH' })
  @IsEnum(Season)
  season!: Season;
}

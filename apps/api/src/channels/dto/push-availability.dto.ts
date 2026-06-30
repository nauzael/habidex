import {
  IsString,
  IsNotEmpty,
  IsInt,
  IsNumber,
  IsOptional,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PushAvailabilityDto {
  @ApiProperty({ example: 'rt-uuid' })
  @IsString()
  @IsNotEmpty()
  roomTypeId!: string;

  @ApiProperty({ example: '2026-07-15' })
  @IsString()
  @IsNotEmpty()
  date!: string;

  @ApiProperty({ example: 5 })
  @IsInt()
  @Min(0)
  availableRooms!: number;

  @ApiPropertyOptional({ example: 1 })
  @IsInt()
  @IsOptional()
  version?: number;

  @ApiPropertyOptional({ example: 120000 })
  @IsNumber()
  @IsOptional()
  price?: number;
}

export class ExportCsvDto {
  @ApiProperty({ example: '2026-07-01' })
  @IsString()
  @IsNotEmpty()
  from!: string;

  @ApiProperty({ example: '2026-07-31' })
  @IsString()
  @IsNotEmpty()
  to!: string;
}

export class ImportCsvDto {
  @ApiProperty({ example: 'room_type_id,date,available,total,price\n...' })
  @IsString()
  @IsNotEmpty()
  csv!: string;
}

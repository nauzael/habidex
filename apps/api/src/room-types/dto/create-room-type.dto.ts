import { IsString, IsNotEmpty, IsNumber, IsOptional, IsInt, Min, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateRoomTypeDto {
  @ApiProperty({ example: 'Estándar' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiPropertyOptional({ example: 'Habitación estándar con cama doble' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 120000 })
  @IsNumber()
  @Min(0)
  basePrice!: number;

  @ApiPropertyOptional({ example: 2 })
  @IsInt()
  @Min(1)
  @IsOptional()
  maxGuests?: number;

  @ApiPropertyOptional({ example: 10 })
  @IsInt()
  @Min(1)
  @IsOptional()
  totalRooms?: number;

  @ApiPropertyOptional({ example: ['WiFi', 'TV', 'A/A'] })
  @IsArray()
  @IsOptional()
  amenities?: string[];
}

import { IsString, IsOptional, IsNumber, IsInt, Min, IsArray } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateRoomTypeDto {
  @ApiPropertyOptional({ example: 'Estándar' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: 'Habitación estándar con cama doble' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 130000 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  basePrice?: number;

  @ApiPropertyOptional({ example: 3 })
  @IsInt()
  @Min(1)
  @IsOptional()
  maxGuests?: number;

  @ApiPropertyOptional({ example: 15 })
  @IsInt()
  @Min(1)
  @IsOptional()
  totalRooms?: number;

  @ApiPropertyOptional({ example: ['WiFi', 'TV', 'A/A', 'Balcón'] })
  @IsArray()
  @IsOptional()
  amenities?: string[];
}

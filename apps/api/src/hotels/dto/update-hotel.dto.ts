import { IsString, IsOptional, IsEmail } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateHotelDto {
  @ApiPropertyOptional({ example: 'Hotel Paraíso Tolú' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: 'contacto@hotelparaiso.com' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ example: '+573001234567' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ example: 'Calle 10 #20-30, Tolú' })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({ example: 'America/Bogota' })
  @IsString()
  @IsOptional()
  timezone?: string;

  @ApiPropertyOptional({ example: 'COP' })
  @IsString()
  @IsOptional()
  currency?: string;
}

import { IsString, IsEmail, IsOptional, IsUUID, IsDateString, IsNumber, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBookingDto {
  @ApiProperty({ example: 'Juan Pérez' })
  @IsString()
  guestName!: string;

  @ApiPropertyOptional({ example: 'juan@example.com' })
  @IsOptional()
  @IsEmail()
  guestEmail?: string;

  @ApiPropertyOptional({ example: '+573001234567' })
  @IsOptional()
  @IsString()
  guestPhone?: string;

  @ApiProperty({ example: 'uuid-room-type' })
  @IsUUID()
  roomTypeId!: string;

  @ApiProperty({ example: '2026-07-01' })
  @IsDateString()
  checkIn!: string;

  @ApiProperty({ example: '2026-07-03' })
  @IsDateString()
  checkOut!: string;

  @ApiProperty({ example: 250000 })
  @IsNumber()
  @Min(0)
  totalAmount!: number;

  @ApiPropertyOptional({ example: 'Prefiere habitación tranquila' })
  @IsOptional()
  @IsString()
  notes?: string;
}

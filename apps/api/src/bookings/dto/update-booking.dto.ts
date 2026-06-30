import { IsOptional, IsString, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { BookingStatus } from '@prisma/client';

export class UpdateBookingDto {
  @ApiPropertyOptional({ enum: BookingStatus, example: BookingStatus.CONFIRMED })
  @IsOptional()
  @IsEnum(BookingStatus)
  status?: BookingStatus;

  @ApiPropertyOptional({ example: 'Cliente solicitó cambio de habitación' })
  @IsOptional()
  @IsString()
  notes?: string;
}

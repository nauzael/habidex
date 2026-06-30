import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SendMessageDto {
  @ApiProperty({ example: '+573001234567' })
  @IsString()
  @IsNotEmpty()
  to!: string;

  @ApiProperty({ example: 'Hola, su reserva ha sido confirmada.' })
  @IsString()
  @IsNotEmpty()
  message!: string;
}

export class SendTemplateDto {
  @ApiProperty({ example: '+573001234567' })
  @IsString()
  @IsNotEmpty()
  to!: string;

  @ApiProperty({ example: 'booking_confirmation' })
  @IsString()
  @IsNotEmpty()
  templateName!: string;

  @ApiPropertyOptional({ example: { guestName: 'Juan', roomType: 'Estándar' } })
  @IsOptional()
  params?: Record<string, string>;
}

export class WebhookPayloadDto {
  @ApiPropertyOptional({ example: '+573001234567' })
  @IsString()
  @IsOptional()
  from?: string;

  @ApiPropertyOptional({ example: 'Hola' })
  @IsString()
  @IsOptional()
  body?: string;

  @ApiPropertyOptional()
  @IsOptional()
  metadata?: Record<string, any>;
}

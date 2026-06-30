import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { WhatsappService } from './whatsapp.service';
import { SendMessageDto, WebhookPayloadDto } from './dto';

@ApiTags('WhatsApp')
@Controller('whatsapp')
export class WhatsappController {
  constructor(private readonly whatsappService: WhatsappService) {}

  @Post('session')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear sesión WhatsApp para el hotel' })
  async createSession(@Request() req: any) {
    return this.whatsappService.createSession(req.user.hotelId);
  }

  @Get('qr')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener QR para vincular WhatsApp' })
  async getQR(@Request() req: any) {
    return this.whatsappService.getQR(req.user.hotelId);
  }

  @Get('status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Estado de la conexión WhatsApp' })
  async getStatus(@Request() req: any) {
    return this.whatsappService.getStatus(req.user.hotelId);
  }

  @Post('send')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Enviar mensaje de texto por WhatsApp' })
  async sendMessage(@Request() req: any, @Body() dto: SendMessageDto) {
    return this.whatsappService.sendAlert(req.user.hotelId, dto.to, dto.message);
  }

  @Post('webhook')
  @ApiOperation({
    summary: 'Webhook para mensajes entrantes desde OpenWA',
    description: 'Endpoint público que recibe webhooks de OpenWA',
  })
  async webhook(@Body() payload: WebhookPayloadDto) {
    return this.whatsappService.handleWebhook(payload);
  }
}

import {
  Controller,
  Get,
  Patch,
  Body,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { HotelsService } from './hotels.service';
import { UpdateHotelDto } from './dto';

@ApiTags('Hotels')
@Controller('hotels')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class HotelsController {
  constructor(private readonly hotelsService: HotelsService) {}

  @Get('me')
  @ApiOperation({ summary: 'Obtener perfil completo del hotel autenticado' })
  async getProfile(@Request() req: any) {
    return this.hotelsService.findProfile(req.user.hotelId);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Actualizar perfil del hotel' })
  async updateProfile(@Request() req: any, @Body() dto: UpdateHotelDto) {
    return this.hotelsService.updateProfile(req.user.hotelId, dto);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Obtener estadísticas del hotel en rango de fechas' })
  @ApiQuery({ name: 'from', required: true, example: '2026-07-01' })
  @ApiQuery({ name: 'to', required: true, example: '2026-07-31' })
  async getStats(
    @Request() req: any,
    @Query('from') from: string,
    @Query('to') to: string,
  ) {
    return this.hotelsService.getStats(req.user.hotelId, from, to);
  }
}

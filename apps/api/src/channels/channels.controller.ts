import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ChannelsService } from './channels.service';
import { PushAvailabilityDto, ImportCsvDto } from './dto';

@ApiTags('Channels (OTAs)')
@Controller('channels')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ChannelsController {
  constructor(private readonly channelsService: ChannelsService) {}

  @Post('availability')
  @ApiOperation({ summary: 'Push disponibilidad a canales OTA' })
  async pushAvailability(@Request() req: any, @Body() dto: PushAvailabilityDto) {
    return this.channelsService.pushAvailability(req.user.hotelId, dto);
  }

  @Get('bookings')
  @ApiOperation({ summary: 'Pull reservas desde canales OTA en rango de fechas' })
  @ApiQuery({ name: 'from', required: true, example: '2026-07-01' })
  @ApiQuery({ name: 'to', required: true, example: '2026-07-31' })
  async pullBookings(
    @Request() req: any,
    @Query('from') from: string,
    @Query('to') to: string,
  ) {
    return this.channelsService.pullBookings(req.user.hotelId, from, to);
  }

  @Get('export-csv')
  @ApiOperation({ summary: 'Exportar inventario como CSV para carga manual en OTAs' })
  async exportCsv(
    @Request() req: any,
    @Query('from') from: string,
    @Query('to') to: string,
  ) {
    return this.channelsService.exportCsv(req.user.hotelId, from, to);
  }

  @Post('import-csv')
  @ApiOperation({ summary: 'Importar reservas desde CSV (descarga manual OTA)' })
  async importCsv(@Request() req: any, @Body() dto: ImportCsvDto) {
    return this.channelsService.importCsv(req.user.hotelId, dto.csv);
  }

  @Get('status')
  @ApiOperation({ summary: 'Estado de conexión con canales OTA' })
  async getStatus(@Request() req: any) {
    return this.channelsService.getChannelStatus(req.user.hotelId);
  }

  @Get('reminders')
  @ApiOperation({ summary: 'Recordatorios de actualización OTA' })
  async getReminders(@Request() req: any) {
    return this.channelsService.getReminders(req.user.hotelId);
  }
}

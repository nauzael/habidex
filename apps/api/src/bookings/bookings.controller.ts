import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Query,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto';
import { BookingStatus } from '@prisma/client';

@ApiTags('Bookings')
@Controller('bookings')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  @ApiOperation({ summary: 'Crear reserva manual (walk-in, phone)' })
  async create(@Request() req: any, @Body() dto: CreateBookingDto) {
    return this.bookingsService.create(req.user.hotelId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar reservas con paginación y filtros' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  @ApiQuery({ name: 'status', required: false, enum: BookingStatus })
  @ApiQuery({ name: 'from', required: false, example: '2026-07-01' })
  @ApiQuery({ name: 'to', required: false, example: '2026-07-31' })
  async findAll(
    @Request() req: any,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @Query('status') status?: BookingStatus,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    const filters = {
      ...(status && { status }),
      ...(from && { from }),
      ...(to && { to }),
    };
    return this.bookingsService.findAll(req.user.hotelId, page, limit, filters);
  }

  @Get('today')
  @ApiOperation({ summary: 'Reservas de hoy (para dashboard)' })
  async getToday(@Request() req: any) {
    return this.bookingsService.getToday(req.user.hotelId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalle de reserva' })
  async findOne(@Param('id') id: string) {
    return this.bookingsService.findOne(id);
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Cancelar reserva (libera inventario)' })
  async cancel(@Param('id') id: string) {
    return this.bookingsService.cancel(id);
  }
}

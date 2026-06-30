import {
  Controller,
  Get,
  Patch,
  Post,
  Param,
  Query,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RatesService } from './rates.service';
import { UpdateRateDto, BulkRateDto, SeasonBulkDto } from './dto';

@ApiTags('Rates')
@Controller('rates')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class RatesController {
  constructor(private readonly ratesService: RatesService) {}

  @Get(':roomTypeId')
  @ApiOperation({ summary: 'Get rates for a room type in date range' })
  @ApiQuery({ name: 'from', required: true, example: '2026-07-01' })
  @ApiQuery({ name: 'to', required: true, example: '2026-07-15' })
  async findByRange(
    @Request() req: any,
    @Param('roomTypeId') roomTypeId: string,
    @Query('from') from: string,
    @Query('to') to: string,
  ) {
    return this.ratesService.findByRange(req.user.hotelId, roomTypeId, from, to);
  }

  @Patch(':roomTypeId/:date')
  @ApiOperation({ summary: 'Update individual rate with optimistic locking' })
  async update(
    @Request() req: any,
    @Param('roomTypeId') roomTypeId: string,
    @Param('date') date: string,
    @Body() dto: UpdateRateDto,
  ) {
    return this.ratesService.update(req.user.hotelId, roomTypeId, date, dto);
  }

  @Post('bulk')
  @ApiOperation({ summary: 'Bulk update rates for date range' })
  async bulkUpdate(@Request() req: any, @Body() dto: BulkRateDto) {
    return this.ratesService.bulkUpdate(req.user.hotelId, dto);
  }

  @Post('season')
  @ApiOperation({ summary: 'Update rates by season for date range' })
  async seasonBulkUpdate(@Request() req: any, @Body() dto: SeasonBulkDto) {
    return this.ratesService.seasonBulkUpdate(req.user.hotelId, dto);
  }
}

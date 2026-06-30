import {
  Controller,
  Get,
  Patch,
  Param,
  Query,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { InventoryService } from './inventory.service';
import { UpdateInventoryDto } from './dto';

@ApiTags('Inventory')
@Controller('inventory')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get('bulk')
  @ApiOperation({ summary: 'Get availability matrix for date range (roomType x date)' })
  @ApiQuery({ name: 'from', required: true, example: '2026-07-01' })
  @ApiQuery({ name: 'to', required: true, example: '2026-07-15' })
  async findBulk(
    @Request() req: any,
    @Query('from') from: string,
    @Query('to') to: string,
  ) {
    return this.inventoryService.findBulk(req.user.hotelId, from, to);
  }

  @Get(':roomTypeId/:date')
  @ApiOperation({ summary: 'Get availability and current price for a room type on a date' })
  async findOne(
    @Request() req: any,
    @Param('roomTypeId') roomTypeId: string,
    @Param('date') date: string,
  ) {
    return this.inventoryService.findOne(req.user.hotelId, roomTypeId, date);
  }

  @Patch(':roomTypeId/:date')
  @ApiOperation({ summary: 'Update availability with optimistic locking (version)' })
  async update(
    @Request() req: any,
    @Param('roomTypeId') roomTypeId: string,
    @Param('date') date: string,
    @Body() dto: UpdateInventoryDto,
  ) {
    return this.inventoryService.update(req.user.hotelId, roomTypeId, date, dto);
  }
}

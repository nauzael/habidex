import {
  Controller,
  Get,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { DashboardService } from './dashboard.service';

@ApiTags('Dashboard')
@Controller('dashboard')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Get KPI summary for the authenticated hotel' })
  async getSummary(@Request() req: any) {
    return this.dashboardService.getSummary(req.user.hotelId);
  }

  @Get('occupancy')
  @ApiOperation({ summary: 'Get occupancy by day for date range' })
  @ApiQuery({ name: 'from', required: true, example: '2026-06-24' })
  @ApiQuery({ name: 'to', required: true, example: '2026-06-30' })
  async getOccupancy(
    @Request() req: any,
    @Query('from') from: string,
    @Query('to') to: string,
  ) {
    return this.dashboardService.getOccupancy(req.user.hotelId, from, to);
  }
}

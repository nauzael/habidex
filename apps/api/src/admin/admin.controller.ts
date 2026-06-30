import {
  Controller,
  Get,
  Patch,
  Delete,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AdminGuard } from '../common/guards/admin.guard';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Admin')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('setup')
  @ApiOperation({ summary: 'Create initial admin user' })
  async setup(@Body() body: { email: string; password: string }) {
    return this.adminService.setupAdmin(body);
  }

  @Get('hotels')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all hotels with pagination' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  async listHotels(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return this.adminService.listHotels({ page, limit });
  }

  @Get('hotels/:id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get hotel detail with relations' })
  async getHotel(@Param('id') id: string) {
    return this.adminService.getHotelDetail(id);
  }

  @Patch('hotels/:id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update hotel plan, isFounder, features' })
  async updateHotel(
    @Param('id') id: string,
    @Body() body: { plan?: string; isFounder?: boolean; features?: Record<string, any> },
  ) {
    return this.adminService.updateHotel(id, body);
  }

  @Delete('hotels/:id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Deactivate hotel (soft delete)' })
  async deleteHotel(@Param('id') id: string) {
    return this.adminService.deactivateHotel(id);
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get system-wide statistics' })
  async getStats() {
    return this.adminService.getStats();
  }

  @Get('logs')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get system logs' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 50 })
  async getLogs(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 50,
  ) {
    return this.adminService.getLogs({ page, limit });
  }

  @Get('health')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Detailed health check' })
  async getHealth() {
    return this.adminService.getHealth();
  }
}

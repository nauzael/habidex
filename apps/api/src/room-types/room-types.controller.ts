import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RoomTypesService } from './room-types.service';
import { CreateRoomTypeDto, UpdateRoomTypeDto } from './dto';

@ApiTags('Room Types')
@Controller('room-types')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class RoomTypesController {
  constructor(private readonly roomTypesService: RoomTypesService) {}

  @Get()
  @ApiOperation({ summary: 'List all room types for the authenticated hotel' })
  async findAll(@Request() req: any) {
    return this.roomTypesService.findAll(req.user.hotelId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a room type (auto-generates 365d inventory + rates)' })
  async create(@Request() req: any, @Body() dto: CreateRoomTypeDto) {
    return this.roomTypesService.create(req.user.hotelId, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific room type' })
  async findOne(@Request() req: any, @Param('id') id: string) {
    return this.roomTypesService.findOne(req.user.hotelId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a room type' })
  async update(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateRoomTypeDto,
  ) {
    return this.roomTypesService.update(req.user.hotelId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a room type' })
  async remove(@Request() req: any, @Param('id') id: string) {
    return this.roomTypesService.remove(req.user.hotelId, id);
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoomTypeDto, UpdateRoomTypeDto } from './dto';

@Injectable()
export class RoomTypesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(hotelId: string, dto: CreateRoomTypeDto) {
    const data: any = { ...dto, hotelId };
    if (dto.maxGuests === undefined) {
      delete data.maxGuests;
    }
    if (dto.totalRooms === undefined) {
      delete data.totalRooms;
    }

    return this.prisma.$transaction(async (tx: any) => {
      const roomType = await tx.roomType.create({ data });

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const inventoryData = [];
      const rateData = [];
      const totalRooms = dto.totalRooms || 1;

      for (let i = 0; i < 365; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() + i);
        inventoryData.push({
          hotelId,
          roomTypeId: roomType.id,
          date,
          availableRooms: totalRooms,
          totalRooms,
        });
        rateData.push({
          hotelId,
          roomTypeId: roomType.id,
          date,
          price: dto.basePrice,
          season: 'LOW',
        });
      }

      await tx.inventory.createMany({ data: inventoryData });
      await tx.rate.createMany({ data: rateData });

      return roomType;
    });
  }

  async findAll(hotelId: string) {
    return this.prisma.roomType.findMany({
      where: { hotelId },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async findOne(hotelId: string, id: string) {
    const roomType = await this.prisma.roomType.findUnique({
      where: { id },
    });

    if (!roomType || roomType.hotelId !== hotelId) {
      throw new NotFoundException('Room type not found');
    }

    return roomType;
  }

  async update(hotelId: string, id: string, dto: UpdateRoomTypeDto) {
    await this.findOne(hotelId, id);

    return this.prisma.roomType.update({
      where: { id },
      data: dto,
    });
  }

  async remove(hotelId: string, id: string) {
    await this.findOne(hotelId, id);

    return this.prisma.roomType.delete({
      where: { id },
    });
  }
}

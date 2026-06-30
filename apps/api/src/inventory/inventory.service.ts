import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateInventoryDto } from './dto';

@Injectable()
export class InventoryService {
  constructor(private readonly prisma: PrismaService) {}

  async findOne(hotelId: string, roomTypeId: string, date: string) {
    const inventory = await this.prisma.inventory.findUnique({
      where: {
        hotelId_roomTypeId_date: {
          hotelId,
          roomTypeId,
          date: new Date(date),
        },
      },
    });

    if (!inventory) {
      throw new NotFoundException('Inventory record not found');
    }

    const rate = await this.prisma.rate.findUnique({
      where: {
        hotelId_roomTypeId_date: {
          hotelId,
          roomTypeId,
          date: new Date(date),
        },
      },
    });

    return {
      date,
      available: inventory.availableRooms,
      total: inventory.totalRooms,
      price: rate ? Number(rate.price) : 0,
      version: inventory.version,
    };
  }

  async update(hotelId: string, roomTypeId: string, date: string, dto: UpdateInventoryDto) {
    const result = await this.prisma.inventory.updateMany({
      where: {
        hotelId,
        roomTypeId,
        date: new Date(date),
        version: dto.version,
      },
      data: {
        availableRooms: dto.availableRooms,
        version: { increment: 1 },
      },
    });

    if (result.count === 0) {
      throw new ConflictException('Conflicto de inventario. Recarga y reintenta.');
    }

    const updated = await this.prisma.inventory.findUnique({
      where: {
        hotelId_roomTypeId_date: {
          hotelId,
          roomTypeId,
          date: new Date(date),
        },
      },
    });

    if (!updated) {
      throw new NotFoundException('Inventory record not found');
    }

    return {
      date,
      available: updated.availableRooms,
      total: updated.totalRooms,
      version: updated.version,
    };
  }

  async findBulk(hotelId: string, from: string, to: string) {
    const roomTypes = await this.prisma.roomType.findMany({
      where: { hotelId },
      orderBy: { sortOrder: 'asc' },
    });

    const inventoryRecords = await this.prisma.inventory.findMany({
      where: {
        hotelId,
        date: {
          gte: new Date(from),
          lte: new Date(to),
        },
      },
      orderBy: { date: 'asc' },
    });

    const rateRecords = await this.prisma.rate.findMany({
      where: {
        hotelId,
        date: {
          gte: new Date(from),
          lte: new Date(to),
        },
      },
    });

    // Build price lookup: roomTypeId + date string -> price
    const priceMap = new Map<string, number>();
    for (const rate of rateRecords) {
      const dateKey = this.formatDate(rate.date);
      priceMap.set(`${rate.roomTypeId}:${dateKey}`, Number(rate.price));
    }

    // Collect all unique dates
    const dateSet = new Set<string>();
    for (const inv of inventoryRecords) {
      dateSet.add(this.formatDate(inv.date));
    }
    const dates = Array.from(dateSet).sort();

    // Build availability matrix
    const roomTypeMap = new Map<string, any>();
    for (const inv of inventoryRecords) {
      const dateKey = this.formatDate(inv.date);
      if (!roomTypeMap.has(inv.roomTypeId)) {
        roomTypeMap.set(inv.roomTypeId, {});
      }
      roomTypeMap.get(inv.roomTypeId)[dateKey] = {
        available: inv.availableRooms,
        total: inv.totalRooms,
        price: priceMap.get(`${inv.roomTypeId}:${dateKey}`) || 0,
        version: inv.version,
      };
    }

    const resultRoomTypes = roomTypes.map((rt) => ({
      id: rt.id,
      name: rt.name,
      availability: roomTypeMap.get(rt.id) || {},
    }));

    return { dates, roomTypes: resultRoomTypes };
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }
}

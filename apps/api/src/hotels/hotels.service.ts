import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateHotelDto } from './dto';

@Injectable()
export class HotelsService {
  constructor(private readonly prisma: PrismaService) {}

  async findProfile(hotelId: string) {
    const hotel = await this.prisma.hotel.findUnique({
      where: { id: hotelId },
    });

    if (!hotel) {
      throw new NotFoundException('Hotel no encontrado');
    }

    const users = await this.prisma.user.findMany({
      where: { hotelId },
      select: { id: true, name: true, email: true, role: true, active: true },
    });

    const recentBookings = await this.prisma.booking.count({
      where: {
        hotelId,
        createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      },
    });

    return {
      hotel: {
        id: hotel.id,
        name: hotel.name,
        email: hotel.email,
        phone: hotel.phone,
        address: hotel.address,
        timezone: hotel.timezone,
        currency: hotel.currency,
        isFounder: hotel.isFounder,
        features: hotel.features,
        createdAt: hotel.createdAt,
        updatedAt: hotel.updatedAt,
      },
      stats: {
        users: users.length,
        recentBookings,
      },
      users,
    };
  }

  async updateProfile(hotelId: string, dto: UpdateHotelDto) {
    const hotel = await this.prisma.hotel.findUnique({
      where: { id: hotelId },
    });

    if (!hotel) {
      throw new NotFoundException('Hotel no encontrado');
    }

    return this.prisma.hotel.update({
      where: { id: hotelId },
      data: dto,
    });
  }

  async getStats(hotelId: string, from: string, to: string) {
    const hotel = await this.prisma.hotel.findUnique({
      where: { id: hotelId },
    });

    if (!hotel) {
      throw new NotFoundException('Hotel no encontrado');
    }

    const [totalBookings, revenueAgg, roomTypes, inventoryCount] =
      await Promise.all([
        this.prisma.booking.count({
          where: {
            hotelId,
            createdAt: { gte: new Date(from), lte: new Date(to) },
          },
        }),
        this.prisma.booking.aggregate({
          where: {
            hotelId,
            createdAt: { gte: new Date(from), lte: new Date(to) },
          },
          _sum: { totalAmount: true },
        }),
        this.prisma.roomType.count({ where: { hotelId } }),
        this.prisma.inventory.count({
          where: { hotelId, date: { gte: new Date(from), lte: new Date(to) } },
        }),
      ]);

    return {
      totalBookings,
      totalRevenue: revenueAgg._sum.totalAmount
        ? Number(revenueAgg._sum.totalAmount)
        : 0,
      roomTypes,
      inventoryDays: inventoryCount,
    };
  }
}

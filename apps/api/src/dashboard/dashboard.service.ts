import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BookingStatus } from '@prisma/client';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getSummary(hotelId: string) {
    const today = new Date().toISOString().split('T')[0];

    // Total rooms across all room types
    const totalAgg = await this.prisma.roomType.aggregate({
      where: { hotelId },
      _sum: { totalRooms: true },
    });
    const totalRooms = totalAgg._sum.totalRooms || 0;

    // Today's inventory
    const inventory = await this.prisma.inventory.findMany({
      where: { hotelId, date: new Date(today) },
    });

    const occupiedRooms = inventory.reduce(
      (sum, i) => sum + (i.totalRooms - i.availableRooms),
      0,
    );
    const totalInventoryRooms = inventory.reduce(
      (sum, i) => sum + i.totalRooms,
      0,
    );
    const occupancyPercent =
      totalInventoryRooms > 0
        ? Math.round((occupiedRooms / totalInventoryRooms) * 100)
        : 0;

    // ADR - average daily rate for today
    const todayRates = await this.prisma.rate.findMany({
      where: { hotelId, date: new Date(today) },
    });
    const adr =
      todayRates.length > 0
        ? Math.round(
            todayRates.reduce((sum, r) => sum + Number(r.price), 0) /
              todayRates.length,
          )
        : 0;

    // RevPAR = ADR * occupancy / 100
    const revpar = Math.round(adr * (occupancyPercent / 100));

    // Booking counts for today
    const checkinsToday = await this.prisma.booking.count({
      where: {
        hotelId,
        checkIn: new Date(today),
        status: { in: [BookingStatus.CONFIRMED, BookingStatus.CHECKED_IN] },
      },
    });

    const bookingsToday = await this.prisma.booking.count({
      where: {
        hotelId,
        createdAt: {
          gte: new Date(`${today}T00:00:00.000Z`),
          lte: new Date(`${today}T23:59:59.999Z`),
        },
      },
    });

    // Weekly occupancy (last 7 days)
    const weeklyOccupancy = await this.getWeeklyOccupancy(hotelId);

    return {
      occupancyToday: `${occupiedRooms}/${totalInventoryRooms || totalRooms}`,
      occupancyPercent,
      adr,
      revpar,
      totalRooms,
      occupiedRooms,
      checkinsToday,
      bookingsToday,
      weeklyOccupancy,
    };
  }

  async getOccupancy(hotelId: string, from: string, to: string) {
    const inventoryRecords = await this.prisma.inventory.findMany({
      where: {
        hotelId,
        date: {
          gte: new Date(from),
          lte: new Date(to),
        },
      },
    });

    // Group by date
    const dateMap = new Map<
      string,
      { totalRooms: number; occupiedRooms: number }
    >();

    for (const inv of inventoryRecords) {
      const dateKey = this.formatDate(inv.date);
      const existing = dateMap.get(dateKey) || {
        totalRooms: 0,
        occupiedRooms: 0,
      };
      existing.totalRooms += inv.totalRooms;
      existing.occupiedRooms += inv.totalRooms - inv.availableRooms;
      dateMap.set(dateKey, existing);
    }

    const result = Array.from(dateMap.entries())
      .map(([date, data]) => ({
        date,
        percent:
          data.totalRooms > 0
            ? Math.round((data.occupiedRooms / data.totalRooms) * 100)
            : 0,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return result;
  }

  private async getWeeklyOccupancy(hotelId: string) {
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

    const from = this.formatDate(sevenDaysAgo);
    const to = this.formatDate(today);

    return this.getOccupancy(hotelId, from, to);
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }
}

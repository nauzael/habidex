import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CsvService } from './csv/csv.service';

@Injectable()
export class ChannelsService {

  constructor(
    private readonly prisma: PrismaService,
    private readonly csvService: CsvService,
  ) {}

  async pushAvailability(
    hotelId: string,
    dto: { roomTypeId: string; date: string; availableRooms: number; version?: number },
  ) {
    const result = await this.prisma.inventory.updateMany({
      where: {
        hotelId,
        roomTypeId: dto.roomTypeId,
        date: new Date(dto.date),
        ...(dto.version ? { version: dto.version } : {}),
      },
      data: {
        availableRooms: dto.availableRooms,
        version: { increment: 1 },
      },
    });

    if (result.count === 0) {
      // Create if not exists
      await this.prisma.inventory.create({
        data: {
          hotelId,
          roomTypeId: dto.roomTypeId,
          date: new Date(dto.date),
          availableRooms: dto.availableRooms,
          totalRooms: dto.availableRooms,
        },
      });
    }

    return { updated: true };
  }

  async pullBookings(hotelId: string, from: string, to: string) {
    const bookings = await this.prisma.booking.findMany({
      where: {
        hotelId,
        createdAt: { gte: new Date(from), lte: new Date(to) },
        channel: { not: 'DIRECT' },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return bookings.map((b) => ({
      id: b.id,
      channelBookingId: b.channelBookingId,
      guestName: b.guestName,
      guestEmail: b.guestEmail,
      guestPhone: b.guestPhone,
      checkIn: this.formatDate(b.checkIn),
      checkOut: this.formatDate(b.checkOut),
      status: b.status,
      channel: b.channel,
      totalAmount: Number(b.totalAmount),
      createdAt: b.createdAt.toISOString(),
    }));
  }

  async exportCsv(hotelId: string, from: string, to: string) {
    return this.csvService.exportInventory(hotelId, from, to);
  }

  async importCsv(hotelId: string, csv: string) {
    const { bookings, errors } = await this.csvService.parseBookingsCsv(csv);

    if (errors.length > 0) {
      return { imported: 0, errors };
    }

    let imported = 0;
    for (const booking of bookings) {
      // Map room type name to ID
      const roomType = await this.prisma.roomType.findFirst({
        where: { hotelId, name: booking.roomType },
      });

      if (!roomType) {
        errors.push(`Tipo de habitación no encontrado: ${booking.roomType}`);
        continue;
      }

      await this.prisma.booking.create({
        data: {
          hotelId,
          roomTypeId: roomType.id,
          guestName: booking.guestName,
          guestEmail: booking.guestEmail,
          checkIn: new Date(booking.checkIn),
          checkOut: new Date(booking.checkOut),
          totalAmount: booking.totalAmount || 0,
          channel: 'OTRO',
          status: 'PENDING',
        },
      });
      imported++;
    }

    return { imported, errors };
  }

  async getChannelStatus(hotelId: string) {
    const hotel = await this.prisma.hotel.findUnique({
      where: { id: hotelId },
    });

    const features = (hotel?.features as any) || {};

    return {
      booking: {
        connected: features.bookingConnected || false,
        configured: !!process.env.BOOKING_API_KEY,
      },
      despegar: {
        connected: features.despegarConnected || false,
        configured: !!process.env.DESPEGAR_API_KEY,
      },
    };
  }

  async getReminders(hotelId: string): Promise<any[]> {
    // Check inventory for potential OTA overbooking
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const nearFull = await this.prisma.inventory.findMany({
      where: {
        hotelId,
        date: { gte: today, lte: tomorrow },
        availableRooms: { lte: 2 },
      },
      include: { roomType: { select: { name: true } } },
    });

    return nearFull.map((inv) => ({
      roomTypeId: inv.roomTypeId,
      roomTypeName: inv.roomType.name,
      date: this.formatDate(inv.date),
      availableRooms: inv.availableRooms,
      totalRooms: inv.totalRooms,
      message: `Solo ${inv.availableRooms} disponible(s) de ${inv.totalRooms} para ${inv.roomType.name}`,
    }));
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }
}

import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WhatsappService } from '../whatsapp/whatsapp.service';
import { CreateBookingDto } from './dto';
import { BookingStatus, BookingChannel } from '@prisma/client';

interface FindAllFilters {
  status?: BookingStatus;
  from?: string;
  to?: string;
}

@Injectable()
export class BookingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly whatsappService: WhatsappService,
  ) {}

  async create(hotelId: string, dto: CreateBookingDto) {
    // Validate room type belongs to hotel
    const roomType = await this.prisma.roomType.findFirst({
      where: { id: dto.roomTypeId, hotelId },
    });

    if (!roomType) {
      throw new NotFoundException('Room type not found');
    }

    const checkIn = new Date(dto.checkIn);
    const checkOut = new Date(dto.checkOut);
    const nights = this.getNights(checkIn, checkOut);

    // Decrement inventory for each night (optimistic locking)
    for (const date of nights) {
      const inventory = await this.prisma.inventory.findUnique({
        where: {
          hotelId_roomTypeId_date: {
            hotelId,
            roomTypeId: dto.roomTypeId,
            date,
          },
        },
      });

      if (!inventory || inventory.availableRooms < 1) {
        throw new ConflictException(
          `No hay disponibilidad para la fecha ${date.toISOString().split('T')[0]}`,
        );
      }

      const result = await this.prisma.inventory.updateMany({
        where: {
          hotelId,
          roomTypeId: dto.roomTypeId,
          date,
          version: inventory.version,
        },
        data: {
          availableRooms: { decrement: 1 },
          version: { increment: 1 },
        },
      });

      if (result.count === 0) {
        throw new ConflictException(
          `Conflicto de inventario para ${date.toISOString().split('T')[0]}. Recarga y reintenta.`,
        );
      }
    }

    // Create booking
    const booking = await this.prisma.booking.create({
      data: {
        hotelId,
        roomTypeId: dto.roomTypeId,
        guestName: dto.guestName,
        guestEmail: dto.guestEmail,
        guestPhone: dto.guestPhone,
        checkIn,
        checkOut,
        status: BookingStatus.CONFIRMED,
        channel: BookingChannel.DIRECT,
        totalAmount: dto.totalAmount,
        notes: dto.notes,
      },
    });

    // Send WhatsApp confirmation (fire and forget)
    if (dto.guestPhone) {
      this.whatsappService.sendConfirmation(hotelId, dto.guestPhone, {
        guestName: dto.guestName,
        roomType: roomType.name,
        checkIn: dto.checkIn,
        checkOut: dto.checkOut,
        totalAmount: dto.totalAmount,
      }).catch(() => {
        // Log failure but don't block booking creation
      });
    }

    return booking;
  }

  async findAll(hotelId: string, page: number, limit: number, filters?: FindAllFilters) {
    const skip = (page - 1) * limit;

    const where: any = { hotelId };

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.from || filters?.to) {
      where.checkIn = {};
      if (filters.from) {
        where.checkIn.gte = new Date(filters.from);
      }
      if (filters.to) {
        where.checkOut = { lte: new Date(filters.to) };
      }
    }

    const [bookings, total] = await Promise.all([
      this.prisma.booking.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          roomType: { select: { id: true, name: true } },
        },
      }),
      this.prisma.booking.count({ where }),
    ]);

    return { bookings, total, page, limit };
  }

  async findOne(id: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: {
        roomType: { select: { id: true, name: true, basePrice: true } },
        hotel: { select: { id: true, name: true, phone: true, email: true } },
      },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    return booking;
  }

  async cancel(id: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.status === BookingStatus.CANCELLED) {
      throw new ConflictException('Booking is already cancelled');
    }

    const checkIn = new Date(booking.checkIn);
    const checkOut = new Date(booking.checkOut);
    const nights = this.getNights(checkIn, checkOut);

    // Release inventory for each night
    for (const date of nights) {
      const inventory = await this.prisma.inventory.findUnique({
        where: {
          hotelId_roomTypeId_date: {
            hotelId: booking.hotelId,
            roomTypeId: booking.roomTypeId,
            date,
          },
        },
      });

      if (inventory) {
        await this.prisma.inventory.updateMany({
          where: {
            hotelId: booking.hotelId,
            roomTypeId: booking.roomTypeId,
            date,
            version: inventory.version,
          },
          data: {
            availableRooms: { increment: 1 },
            version: { increment: 1 },
          },
        });
      }
    }

    return this.prisma.booking.update({
      where: { id },
      data: { status: BookingStatus.CANCELLED },
    });
  }

  async getToday(hotelId: string) {
    const today = new Date(new Date().toISOString().split('T')[0]);

    const where = {
      hotelId,
      checkIn: today,
    };

    const [bookings, total] = await Promise.all([
      this.prisma.booking.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: {
          roomType: { select: { id: true, name: true } },
        },
      }),
      this.prisma.booking.count({ where }),
    ]);

    return { bookings, total };
  }

  private getNights(checkIn: Date, checkOut: Date): Date[] {
    const nights: Date[] = [];
    const current = new Date(checkIn);
    const end = new Date(checkOut);

    while (current < end) {
      nights.push(new Date(current));
      current.setUTCDate(current.getUTCDate() + 1);
    }

    return nights;
  }
}

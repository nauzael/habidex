import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { PrismaService } from '../prisma/prisma.service';
import { WhatsappService } from '../whatsapp/whatsapp.service';
import { BookingStatus, BookingChannel } from '@prisma/client';

describe('BookingsService', () => {
  let service: BookingsService;

  // Match service date parsing (local midnight from date string)
  const mockDate = new Date('2026-07-01');
  const mockDate2 = new Date('2026-07-02');

  const mockPrisma = {
    roomType: {
      findFirst: jest.fn(),
    },
    inventory: {
      findUnique: jest.fn(),
      updateMany: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
    },
    booking: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  const mockWhatsappService = {
    sendConfirmation: jest.fn().mockResolvedValue({}),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookingsService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: WhatsappService, useValue: mockWhatsappService },
      ],
    }).compile();

    service = module.get<BookingsService>(BookingsService);
  });

  describe('create', () => {
    const hotelId = 'hotel-1';
    const dto = {
      guestName: 'Juan Pérez',
      guestEmail: 'juan@example.com',
      guestPhone: '+573001234567',
      roomTypeId: 'rt-1',
      checkIn: '2026-07-01',
      checkOut: '2026-07-03',
      totalAmount: 250000,
      notes: 'Prefiere habitación tranquila',
    };

    it('should create booking and decrement inventory', async () => {
      mockPrisma.roomType.findFirst.mockResolvedValue({
        id: 'rt-1',
        hotelId: 'hotel-1',
        name: 'Suite',
      });

      // Inventory for 2 nights (July 1 and July 2)
      const invNight1 = { id: 'inv-1', roomTypeId: 'rt-1', hotelId, date: mockDate, availableRooms: 5, totalRooms: 10, version: 2 };
      const invNight2 = { id: 'inv-2', roomTypeId: 'rt-1', hotelId, date: mockDate2, availableRooms: 3, totalRooms: 10, version: 1 };

      mockPrisma.inventory.findUnique
        .mockResolvedValueOnce(invNight1)
        .mockResolvedValueOnce(invNight2);

      mockPrisma.inventory.updateMany
        .mockResolvedValueOnce({ count: 1 })
        .mockResolvedValueOnce({ count: 1 });

      const createdBooking = {
        id: 'booking-1',
        hotelId,
        roomTypeId: 'rt-1',
        guestName: 'Juan Pérez',
        guestEmail: 'juan@example.com',
        guestPhone: '+573001234567',
        checkIn: mockDate,
        checkOut: new Date('2026-07-03'),
        status: BookingStatus.CONFIRMED,
        channel: BookingChannel.DIRECT,
        totalAmount: 250000,
        notes: 'Prefiere habitación tranquila',
        createdAt: new Date(),
      };

      mockPrisma.booking.create.mockResolvedValue(createdBooking);

      const result = await service.create(hotelId, dto);

      expect(result).toEqual(createdBooking);
      expect(mockPrisma.roomType.findFirst).toHaveBeenCalledWith({
        where: { id: 'rt-1', hotelId: 'hotel-1' },
      });

      // Should check inventory for both nights
      expect(mockPrisma.inventory.findUnique).toHaveBeenCalledTimes(2);
      expect(mockPrisma.inventory.updateMany).toHaveBeenCalledTimes(2);

      // Should update inventory with optimistic locking
      expect(mockPrisma.inventory.updateMany).toHaveBeenCalledWith({
        where: { hotelId, roomTypeId: 'rt-1', date: mockDate, version: 2 },
        data: { availableRooms: { decrement: 1 }, version: { increment: 1 } },
      });

      // Should create booking
      expect(mockPrisma.booking.create).toHaveBeenCalledWith({
        data: {
          hotelId,
          roomTypeId: 'rt-1',
          guestName: 'Juan Pérez',
          guestEmail: 'juan@example.com',
          guestPhone: '+573001234567',
          checkIn: mockDate,
          checkOut: new Date('2026-07-03'),
          status: BookingStatus.CONFIRMED,
          channel: BookingChannel.DIRECT,
          totalAmount: 250000,
          notes: 'Prefiere habitación tranquila',
        },
      });

      // Should send WhatsApp confirmation
      expect(mockWhatsappService.sendConfirmation).toHaveBeenCalledWith(
        hotelId,
        '+573001234567',
        expect.objectContaining({ guestName: 'Juan Pérez' }),
      );
    });

    it('should throw NotFoundException when room type does not belong to hotel', async () => {
      mockPrisma.roomType.findFirst.mockResolvedValue(null);

      await expect(service.create(hotelId, dto)).rejects.toThrow(NotFoundException);
      expect(mockPrisma.booking.create).not.toHaveBeenCalled();
    });

    it('should throw ConflictException when no inventory available', async () => {
      mockPrisma.roomType.findFirst.mockResolvedValue({ id: 'rt-1', hotelId: 'hotel-1' });
      mockPrisma.inventory.findUnique.mockResolvedValue(null);

      await expect(service.create(hotelId, dto)).rejects.toThrow(ConflictException);
    });

    it('should throw ConflictException on inventory version mismatch', async () => {
      mockPrisma.roomType.findFirst.mockResolvedValue({ id: 'rt-1', hotelId: 'hotel-1' });
      mockPrisma.inventory.findUnique.mockResolvedValue({ id: 'inv-1', availableRooms: 5, version: 2 });
      mockPrisma.inventory.updateMany.mockResolvedValue({ count: 0 });

      await expect(service.create(hotelId, dto)).rejects.toThrow(ConflictException);
    });
  });

  describe('findAll', () => {
    const hotelId = 'hotel-1';

    it('should return paginated bookings', async () => {
      const bookings = [
        { id: 'b-1', guestName: 'Juan Pérez', checkIn: mockDate, status: BookingStatus.CONFIRMED },
        { id: 'b-2', guestName: 'María Gómez', checkIn: mockDate, status: BookingStatus.PENDING },
      ];
      mockPrisma.booking.findMany.mockResolvedValue(bookings);
      mockPrisma.booking.count.mockResolvedValue(10);

      const result = await service.findAll(hotelId, 1, 20);

      expect(result.bookings).toHaveLength(2);
      expect(result.total).toBe(10);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
      expect(mockPrisma.booking.findMany).toHaveBeenCalledWith({
        where: { hotelId },
        skip: 0,
        take: 20,
        orderBy: { createdAt: 'desc' },
        include: { roomType: { select: { id: true, name: true } } },
      });
    });

    it('should filter by status when provided', async () => {
      mockPrisma.booking.findMany.mockResolvedValue([]);
      mockPrisma.booking.count.mockResolvedValue(0);

      await service.findAll(hotelId, 1, 20, { status: BookingStatus.CONFIRMED });

      expect(mockPrisma.booking.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { hotelId, status: BookingStatus.CONFIRMED },
        }),
      );
    });

    it('should filter by date range when provided', async () => {
      mockPrisma.booking.findMany.mockResolvedValue([]);
      mockPrisma.booking.count.mockResolvedValue(0);

      await service.findAll(hotelId, 1, 20, {
        from: '2026-07-01',
        to: '2026-07-31',
      });

      expect(mockPrisma.booking.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            hotelId,
            checkIn: { gte: new Date('2026-07-01') },
            checkOut: { lte: new Date('2026-07-31') },
          }),
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return booking detail with relations', async () => {
      const booking = {
        id: 'b-1',
        hotelId: 'hotel-1',
        guestName: 'Juan Pérez',
        roomType: { id: 'rt-1', name: 'Suite' },
        hotel: { id: 'hotel-1', name: 'Hotel Paraíso' },
      };
      mockPrisma.booking.findUnique.mockResolvedValue(booking);

      const result = await service.findOne('b-1');

      expect(result).toEqual(booking);
      expect(mockPrisma.booking.findUnique).toHaveBeenCalledWith({
        where: { id: 'b-1' },
        include: {
          roomType: { select: { id: true, name: true, basePrice: true } },
          hotel: { select: { id: true, name: true, phone: true, email: true } },
        },
      });
    });

    it('should throw NotFoundException when booking does not exist', async () => {
      mockPrisma.booking.findUnique.mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('cancel', () => {
    const hotelId = 'hotel-1';
    const bookingId = 'b-1';
    const mockBooking = {
      id: bookingId,
      hotelId,
      roomTypeId: 'rt-1',
      guestName: 'Juan Pérez',
      checkIn: new Date('2026-07-01'),
      checkOut: new Date('2026-07-03'),
      status: BookingStatus.CONFIRMED,
    };

    it('should cancel booking and release inventory', async () => {
      mockPrisma.booking.findUnique.mockResolvedValue(mockBooking);

      const invNight1 = { id: 'inv-1', version: 2 };
      const invNight2 = { id: 'inv-2', version: 1 };
      mockPrisma.inventory.findUnique
        .mockResolvedValueOnce(invNight1)
        .mockResolvedValueOnce(invNight2);

      mockPrisma.inventory.updateMany
        .mockResolvedValueOnce({ count: 1 })
        .mockResolvedValueOnce({ count: 1 });

      mockPrisma.booking.update.mockResolvedValue({
        ...mockBooking,
        status: BookingStatus.CANCELLED,
      });

      const result = await service.cancel(bookingId);

      expect(result.status).toBe(BookingStatus.CANCELLED);
      expect(mockPrisma.inventory.updateMany).toHaveBeenCalledTimes(2);

      // Should increment available rooms
      expect(mockPrisma.inventory.updateMany).toHaveBeenCalledWith({
        where: { hotelId, roomTypeId: 'rt-1', date: mockDate, version: 2 },
        data: { availableRooms: { increment: 1 }, version: { increment: 1 } },
      });

      expect(mockPrisma.booking.update).toHaveBeenCalledWith({
        where: { id: bookingId },
        data: { status: BookingStatus.CANCELLED },
      });
    });

    it('should throw NotFoundException when booking does not exist', async () => {
      mockPrisma.booking.findUnique.mockResolvedValue(null);

      await expect(service.cancel('non-existent')).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException when booking already cancelled', async () => {
      mockPrisma.booking.findUnique.mockResolvedValue({
        ...mockBooking,
        status: BookingStatus.CANCELLED,
      });

      await expect(service.cancel(bookingId)).rejects.toThrow(ConflictException);
    });
  });

  describe('getToday', () => {
    const hotelId = 'hotel-1';

    it('should return today bookings', async () => {
      const today = new Date().toISOString().split('T')[0];
      const bookings = [
        { id: 'b-1', guestName: 'Juan Pérez', checkIn: new Date(today), status: BookingStatus.CONFIRMED },
      ];
      mockPrisma.booking.findMany.mockResolvedValue(bookings);
      mockPrisma.booking.count.mockResolvedValue(1);

      const result = await service.getToday(hotelId);

      expect(result.bookings).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(mockPrisma.booking.findMany).toHaveBeenCalledWith({
        where: {
          hotelId,
          checkIn: new Date(today),
        },
        orderBy: { createdAt: 'desc' },
        include: { roomType: { select: { id: true, name: true } } },
      });
    });

    it('should return empty array when no bookings today', async () => {
      mockPrisma.booking.findMany.mockResolvedValue([]);
      mockPrisma.booking.count.mockResolvedValue(0);

      const result = await service.getToday(hotelId);

      expect(result.bookings).toEqual([]);
      expect(result.total).toBe(0);
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { ChannelsService } from './channels.service';
import { PrismaService } from '../prisma/prisma.service';
import { CsvService } from './csv/csv.service';

describe('ChannelsService', () => {
  let service: ChannelsService;
  let prisma: PrismaService;

  const mockPrisma = {
    hotel: { findUnique: jest.fn() },
    inventory: { findMany: jest.fn(), updateMany: jest.fn() },
    booking: { findMany: jest.fn() },
  };

  const mockCsvService = {
    exportInventory: jest.fn(),
    importBookings: jest.fn(),
    generateCsv: jest.fn(),
    parseCsv: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChannelsService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: CsvService, useValue: mockCsvService },
      ],
    }).compile();

    service = module.get<ChannelsService>(ChannelsService);
    prisma = module.get<PrismaService>(PrismaService);
    void prisma;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('pushAvailability', () => {
    it('should update inventory for OTA sync', async () => {
      mockPrisma.inventory.updateMany.mockResolvedValue({ count: 1 });

      const result = await service.pushAvailability('hotel-1', {
        roomTypeId: 'rt-1',
        date: '2026-07-15',
        availableRooms: 5,
        version: 1,
      });

      expect(result).toBeDefined();
      expect(result.updated).toBe(true);
    });
  });

  describe('pullBookings', () => {
    it('should return pending bookings for sync', async () => {
      const bookings = [
        {
          id: 'b-1',
          guestName: 'Juan',
          channel: 'BOOKING_COM',
          channelBookingId: null,
          guestEmail: null,
          guestPhone: null,
          checkIn: new Date('2026-07-01'),
          checkOut: new Date('2026-07-03'),
          status: 'CONFIRMED',
          totalAmount: 240000,
          createdAt: new Date('2026-06-30'),
        },
      ];
      mockPrisma.booking.findMany.mockResolvedValue(bookings);

      const result = await service.pullBookings('hotel-1', '2026-07-01', '2026-07-31');

      expect(result).toHaveLength(1);
      expect(result[0].guestName).toBe('Juan');
    });
  });

  describe('exportCsv', () => {
    it('should return CSV export URL/data', async () => {
      mockCsvService.exportInventory.mockResolvedValue({ csv: 'room_type,date,available\n...' });

      const result = await service.exportCsv('hotel-1', '2026-07-01', '2026-07-31');

      expect(result).toBeDefined();
      expect(mockCsvService.exportInventory).toHaveBeenCalled();
    });
  });

  describe('getChannelStatus', () => {
    it('should return connection status for all channels', async () => {
      mockPrisma.hotel.findUnique.mockResolvedValue({
        features: { bookingConnected: true, despegarConnected: false },
      });

      const result = await service.getChannelStatus('hotel-1');

      expect(result).toBeDefined();
      expect(result.booking).toBeDefined();
      expect(result.despegar).toBeDefined();
    });
  });
});

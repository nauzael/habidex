import { Test, TestingModule } from '@nestjs/testing';
import { DashboardService } from './dashboard.service';
import { PrismaService } from '../prisma/prisma.service';

describe('DashboardService', () => {
  let service: DashboardService;

  const mockPrisma = {
    roomType: {
      aggregate: jest.fn(),
      findMany: jest.fn(),
    },
    inventory: {
      findMany: jest.fn(),
    },
    rate: {
      findMany: jest.fn(),
    },
    booking: {
      count: jest.fn(),
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<DashboardService>(DashboardService);
  });

  describe('getSummary', () => {
    const hotelId = 'hotel-1';

    it('should return correct KPIs for a hotel', async () => {
      mockPrisma.roomType.aggregate.mockResolvedValue({
        _sum: { totalRooms: 14 },
      });

      // First inventory call: today's data (2 room types)
      mockPrisma.inventory.findMany.mockResolvedValueOnce([
        { totalRooms: 10, availableRooms: 8 },
        { totalRooms: 4, availableRooms: 2 },
      ]);

      // Rates for ADR calculation (today)
      mockPrisma.rate.findMany.mockResolvedValue([
        { price: 120000 },
        { price: 200000 },
      ]);

      // Booking counts
      mockPrisma.booking.count
        .mockResolvedValueOnce(3)  // checkinsToday
        .mockResolvedValueOnce(5); // bookingsToday

      // Weekly occupancy data: 7 days, 2 room types each
      const weekInventory: any[] = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        weekInventory.push(
          { totalRooms: 10, availableRooms: 8, date: d },
          { totalRooms: 4, availableRooms: 2, date: d },
        );
      }

      // Second inventory call: weekly data
      mockPrisma.inventory.findMany.mockResolvedValueOnce(weekInventory);

      const result = await service.getSummary(hotelId);

      // ADR = (120000 + 200000) / 2 = 160000
      // occupancy: total 14, occupied: (10-8)+(4-2) = 4, percent: 4/14*100 = 29
      // RevPAR = 160000 * 29 / 100 = 46400

      expect(result).toMatchObject({
        totalRooms: 14,
        occupiedRooms: 4,
        occupancyPercent: 29,
        checkinsToday: 3,
        bookingsToday: 5,
      });
      expect(result.weeklyOccupancy).toHaveLength(7);
      expect(typeof result.adr).toBe('number');
      expect(typeof result.revpar).toBe('number');
    });

    it('should handle zero rooms gracefully', async () => {
      mockPrisma.roomType.aggregate.mockResolvedValue({
        _sum: { totalRooms: null },
      });
      mockPrisma.inventory.findMany.mockResolvedValueOnce([]);
      mockPrisma.inventory.findMany.mockResolvedValueOnce([]);
      mockPrisma.rate.findMany.mockResolvedValue([]);
      mockPrisma.booking.count
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0);

      const result = await service.getSummary(hotelId);

      expect(result).toMatchObject({
        totalRooms: 0,
        occupiedRooms: 0,
        occupancyPercent: 0,
        adr: 0,
        revpar: 0,
        checkinsToday: 0,
        bookingsToday: 0,
      });
    });
  });

  describe('getOccupancy', () => {
    const hotelId = 'hotel-1';
    const from = '2026-06-24';
    const to = '2026-06-30';

    it('should return weekly occupancy data', async () => {
      const inventoryRecords = [
        { date: new Date('2026-06-24'), totalRooms: 10, availableRooms: 8 },
        { date: new Date('2026-06-24'), totalRooms: 5, availableRooms: 3 },
        { date: new Date('2026-06-25'), totalRooms: 10, availableRooms: 7 },
        { date: new Date('2026-06-25'), totalRooms: 5, availableRooms: 2 },
        { date: new Date('2026-06-30'), totalRooms: 10, availableRooms: 5 },
        { date: new Date('2026-06-30'), totalRooms: 5, availableRooms: 1 },
      ];

      mockPrisma.inventory.findMany.mockResolvedValue(inventoryRecords);

      const result = await service.getOccupancy(hotelId, from, to);

      expect(result).toHaveLength(3); // 3 unique dates
      expect(result[0]).toMatchObject({
        date: '2026-06-24',
        percent: Math.round(((10 - 8) + (5 - 3)) / (10 + 5) * 100),
      });
    });

    it('should return empty array when no data', async () => {
      mockPrisma.inventory.findMany.mockResolvedValue([]);

      const result = await service.getOccupancy(hotelId, from, to);

      expect(result).toEqual([]);
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import { RatesService } from './rates.service';
import { PrismaService } from '../prisma/prisma.service';
import { Season } from '@prisma/client';

describe('RatesService', () => {
  let service: RatesService;

  const mockPrisma = {
    rate: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      updateMany: jest.fn(),
      upsert: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RatesService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<RatesService>(RatesService);
  });

  describe('findByRange', () => {
    const hotelId = 'hotel-1';
    const roomTypeId = 'rt-1';
    const from = '2026-07-01';
    const to = '2026-07-05';

    it('should return rates for a room type in date range', async () => {
      const rates = [
        { id: 'r-1', hotelId, roomTypeId, date: new Date('2026-07-01'), price: 120000, season: Season.HIGH, version: 1 },
        { id: 'r-2', hotelId, roomTypeId, date: new Date('2026-07-02'), price: 120000, season: Season.HIGH, version: 1 },
      ];
      mockPrisma.rate.findMany.mockResolvedValue(rates);

      const result = await service.findByRange(hotelId, roomTypeId, from, to);

      expect(mockPrisma.rate.findMany).toHaveBeenCalledWith({
        where: {
          hotelId,
          roomTypeId,
          date: {
            gte: new Date(from),
            lte: new Date(to),
          },
        },
        orderBy: { date: 'asc' },
      });
      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject({
        id: 'r-1',
        price: 120000,
        season: Season.HIGH,
        date: '2026-07-01',
      });
    });

    it('should return empty array when no rates found', async () => {
      mockPrisma.rate.findMany.mockResolvedValue([]);

      const result = await service.findByRange(hotelId, roomTypeId, from, to);

      expect(result).toEqual([]);
    });
  });

  describe('update', () => {
    const hotelId = 'hotel-1';
    const roomTypeId = 'rt-1';
    const date = '2026-07-01';

    it('should update individual rate with optimistic locking', async () => {
      const dto = { price: 150000, season: Season.HIGH, version: 1 };
      mockPrisma.rate.updateMany.mockResolvedValue({ count: 1 });
      const updatedRate = {
        id: 'r-1',
        hotelId,
        roomTypeId,
        date: new Date(date),
        price: 150000,
        season: Season.HIGH,
        version: 2,
      };
      mockPrisma.rate.findUnique.mockResolvedValue(updatedRate);

      const result = await service.update(hotelId, roomTypeId, date, dto);

      expect(mockPrisma.rate.updateMany).toHaveBeenCalledWith({
        where: {
          hotelId,
          roomTypeId,
          date: new Date(date),
          version: 1,
        },
        data: {
          price: 150000,
          season: Season.HIGH,
          version: { increment: 1 },
        },
      });
      expect(result).toMatchObject({
        price: 150000,
        season: Season.HIGH,
        version: 2,
      });
    });

    it('should throw ConflictException on version mismatch', async () => {
      mockPrisma.rate.updateMany.mockResolvedValue({ count: 0 });

      await expect(
        service.update(hotelId, roomTypeId, date, { price: 150000, season: Season.HIGH, version: 1 }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('bulkUpdate', () => {
    const hotelId = 'hotel-1';

    it('should update rates for all dates in range', async () => {
      const dto = {
        from: '2026-07-01',
        to: '2026-07-03',
        roomTypeId: 'rt-1',
        price: 150000,
        season: Season.HIGH,
      };

      mockPrisma.rate.findMany.mockResolvedValue([]);
      mockPrisma.$transaction.mockImplementation(async (cb: any) => cb(mockPrisma));
      mockPrisma.rate.upsert.mockResolvedValue({});

      const result = await service.bulkUpdate(hotelId, dto);

      // Should upsert for each day from 2026-07-01 to 2026-07-03 (3 days)
      expect(mockPrisma.rate.upsert).toHaveBeenCalledTimes(3);
      expect(mockPrisma.$transaction).toHaveBeenCalled();
      expect(result.count).toBe(3);
    });

    it('should skip dates with existing rates when skipExisting is true', async () => {
      const dto = {
        from: '2026-07-01',
        to: '2026-07-03',
        roomTypeId: 'rt-1',
        price: 150000,
        season: Season.HIGH,
      };

      const existingRates = [
        { roomTypeId: 'rt-1', date: new Date('2026-07-01') },
      ];

      mockPrisma.rate.findMany.mockResolvedValue(existingRates);
      mockPrisma.$transaction.mockImplementation(async (cb: any) => cb(mockPrisma));
      mockPrisma.rate.upsert.mockResolvedValue({});

      const result = await service.bulkUpdate(hotelId, dto, true);

      // Only 2 upserts since July 1 already exists
      expect(mockPrisma.rate.upsert).toHaveBeenCalledTimes(2);
      expect(result.count).toBe(2);
    });
  });

  describe('seasonBulkUpdate', () => {
    const hotelId = 'hotel-1';

    it('should update rates by season for specific room type', async () => {
      const dto = {
        from: '2026-07-01',
        to: '2026-12-31',
        roomTypeId: 'rt-1',
        price: 180000,
        season: Season.HIGH,
      };

      mockPrisma.rate.updateMany.mockResolvedValue({ count: 30 });

      const result = await service.seasonBulkUpdate(hotelId, dto);

      expect(mockPrisma.rate.updateMany).toHaveBeenCalledWith({
        where: {
          hotelId,
          roomTypeId: 'rt-1',
          date: {
            gte: new Date('2026-07-01'),
            lte: new Date('2026-12-31'),
          },
        },
        data: {
          price: 180000,
          season: Season.HIGH,
          version: { increment: 1 },
        },
      });
      expect(result.count).toBe(30);
    });

    it('should update rates for all room types when roomTypeId is not provided', async () => {
      const dto = {
        from: '2026-07-01',
        to: '2026-12-31',
        price: 180000,
        season: Season.HIGH,
      };

      mockPrisma.rate.updateMany.mockResolvedValue({ count: 100 });

      const result = await service.seasonBulkUpdate(hotelId, dto);

      expect(mockPrisma.rate.updateMany).toHaveBeenCalledWith({
        where: {
          hotelId,
          date: {
            gte: new Date('2026-07-01'),
            lte: new Date('2026-12-31'),
          },
        },
        data: {
          price: 180000,
          season: Season.HIGH,
          version: { increment: 1 },
        },
      });
      expect(result.count).toBe(100);
    });
  });
});

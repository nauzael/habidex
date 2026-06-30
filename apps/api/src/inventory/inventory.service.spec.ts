import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { PrismaService } from '../prisma/prisma.service';

describe('InventoryService', () => {
  let service: InventoryService;

  const mockPrisma = {
    roomType: {
      findMany: jest.fn(),
    },
    inventory: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      updateMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    rate: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InventoryService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<InventoryService>(InventoryService);
  });

  describe('findOne', () => {
    const hotelId = 'hotel-1';
    const roomTypeId = 'rt-1';
    const date = '2026-07-01';

    it('should return availability with current price', async () => {
      const inventoryRecord = {
        id: 'inv-1',
        hotelId,
        roomTypeId,
        date: new Date(date),
        availableRooms: 8,
        totalRooms: 10,
        version: 3,
      };
      const rateRecord = {
        id: 'rate-1',
        hotelId,
        roomTypeId,
        date: new Date(date),
        price: 120000,
        season: 'HIGH',
        version: 1,
      };

      mockPrisma.inventory.findUnique.mockResolvedValue(inventoryRecord);
      mockPrisma.rate.findUnique.mockResolvedValue(rateRecord);

      const result = await service.findOne(hotelId, roomTypeId, date);

      expect(mockPrisma.inventory.findUnique).toHaveBeenCalledWith({
        where: {
          hotelId_roomTypeId_date: {
            hotelId,
            roomTypeId,
            date: new Date(date),
          },
        },
      });
      expect(result).toEqual({
        date: '2026-07-01',
        available: 8,
        total: 10,
        price: 120000,
        version: 3,
      });
    });

    it('should throw NotFoundException when inventory does not exist', async () => {
      mockPrisma.inventory.findUnique.mockResolvedValue(null);

      await expect(service.findOne(hotelId, roomTypeId, date)).rejects.toThrow(NotFoundException);
    });

    it('should return price 0 when rate does not exist', async () => {
      const inventoryRecord = {
        id: 'inv-1',
        hotelId,
        roomTypeId,
        date: new Date(date),
        availableRooms: 8,
        totalRooms: 10,
        version: 3,
      };
      mockPrisma.inventory.findUnique.mockResolvedValue(inventoryRecord);
      mockPrisma.rate.findUnique.mockResolvedValue(null);

      const result = await service.findOne(hotelId, roomTypeId, date);

      expect(result.price).toBe(0);
    });
  });

  describe('update', () => {
    const hotelId = 'hotel-1';
    const roomTypeId = 'rt-1';
    const date = '2026-07-01';

    it('should update available rooms with optimistic locking', async () => {
      const dto = { availableRooms: 5, version: 3 };
      const updatedRecord = {
        id: 'inv-1',
        hotelId,
        roomTypeId,
        date: new Date(date),
        availableRooms: 5,
        totalRooms: 10,
        version: 4,
      };

      mockPrisma.inventory.updateMany.mockResolvedValue({ count: 1 });
      mockPrisma.inventory.findUnique.mockResolvedValue(updatedRecord);

      const result = await service.update(hotelId, roomTypeId, date, dto);

      expect(mockPrisma.inventory.updateMany).toHaveBeenCalledWith({
        where: {
          hotelId,
          roomTypeId,
          date: new Date(date),
          version: 3,
        },
        data: {
          availableRooms: 5,
          version: { increment: 1 },
        },
      });
      expect(result).toEqual({
        date: '2026-07-01',
        available: 5,
        total: 10,
        version: 4,
      });
    });

    it('should throw ConflictException on version mismatch', async () => {
      mockPrisma.inventory.updateMany.mockResolvedValue({ count: 0 });

      await expect(
        service.update(hotelId, roomTypeId, date, { availableRooms: 5, version: 1 }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('findBulk', () => {
    const hotelId = 'hotel-1';
    const from = '2026-07-01';
    const to = '2026-07-03';

    it('should return matrix of availability with prices', async () => {
      const roomTypes = [
        { id: 'rt-1', name: 'Estándar' },
        { id: 'rt-2', name: 'Suite' },
      ];
      const inventoryRecords = [
        { roomTypeId: 'rt-1', date: new Date('2026-07-01'), availableRooms: 8, totalRooms: 10, version: 1 },
        { roomTypeId: 'rt-1', date: new Date('2026-07-02'), availableRooms: 5, totalRooms: 10, version: 2 },
        { roomTypeId: 'rt-2', date: new Date('2026-07-01'), availableRooms: 3, totalRooms: 5, version: 1 },
        { roomTypeId: 'rt-2', date: new Date('2026-07-02'), availableRooms: 2, totalRooms: 5, version: 1 },
      ];
      const rateRecords = [
        { roomTypeId: 'rt-1', date: new Date('2026-07-01'), price: 120000 },
        { roomTypeId: 'rt-1', date: new Date('2026-07-02'), price: 150000 },
        { roomTypeId: 'rt-2', date: new Date('2026-07-01'), price: 200000 },
        { roomTypeId: 'rt-2', date: new Date('2026-07-02'), price: 250000 },
      ];

      mockPrisma.roomType.findMany.mockResolvedValue(roomTypes);
      mockPrisma.inventory.findMany.mockResolvedValue(inventoryRecords);
      mockPrisma.rate.findMany.mockResolvedValue(rateRecords);

      const result = await service.findBulk(hotelId, from, to);

      expect(mockPrisma.roomType.findMany).toHaveBeenCalledWith({
        where: { hotelId },
        orderBy: { sortOrder: 'asc' },
      });
      expect(mockPrisma.inventory.findMany).toHaveBeenCalledWith({
        where: {
          hotelId,
          date: {
            gte: new Date(from),
            lte: new Date(to),
          },
        },
        orderBy: { date: 'asc' },
      });
      expect(mockPrisma.rate.findMany).toHaveBeenCalledWith({
        where: {
          hotelId,
          date: {
            gte: new Date(from),
            lte: new Date(to),
          },
        },
      });
      expect(result.dates).toEqual(['2026-07-01', '2026-07-02']);
      expect(result.roomTypes).toHaveLength(2);
      expect(result.roomTypes[0].name).toBe('Estándar');
      expect(result.roomTypes[0].availability['2026-07-01']).toMatchObject({
        available: 8,
        total: 10,
        price: 120000,
        version: 1,
      });
    });

    it('should return empty arrays when no inventory', async () => {
      mockPrisma.roomType.findMany.mockResolvedValue([]);
      mockPrisma.inventory.findMany.mockResolvedValue([]);
      mockPrisma.rate.findMany.mockResolvedValue([]);

      const result = await service.findBulk(hotelId, from, to);

      expect(result.dates).toEqual([]);
      expect(result.roomTypes).toEqual([]);
    });
  });
});

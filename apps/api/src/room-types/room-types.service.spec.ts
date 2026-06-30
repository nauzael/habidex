import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { RoomTypesService } from './room-types.service';
import { PrismaService } from '../prisma/prisma.service';

describe('RoomTypesService', () => {
  let service: RoomTypesService;

  const mockPrisma = {
    roomType: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    inventory: {
      createMany: jest.fn(),
    },
    rate: {
      createMany: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoomTypesService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<RoomTypesService>(RoomTypesService);
  });

  describe('create', () => {
    const hotelId = 'hotel-1';
    const dto = {
      name: 'Estándar',
      description: 'Habitación estándar',
      basePrice: 120000,
      maxGuests: 2,
      totalRooms: 10,
      amenities: ['WiFi', 'TV'],
    };

    it('should create a room type and generate 365 days of inventory and rates', async () => {
      const createdRoomType = { id: 'rt-1', ...dto, hotelId };
      mockPrisma.roomType.create.mockResolvedValue(createdRoomType);
      mockPrisma.$transaction.mockImplementation(async (cb: any) => cb(mockPrisma));

      const result = await service.create(hotelId, dto);

      expect(mockPrisma.roomType.create).toHaveBeenCalledWith({
        data: { ...dto, hotelId },
      });
      expect(mockPrisma.inventory.createMany).toHaveBeenCalled();
      expect(mockPrisma.rate.createMany).toHaveBeenCalled();
      // Should generate 365 records
      const inventoryData = mockPrisma.inventory.createMany.mock.calls[0][0].data;
      expect(inventoryData).toHaveLength(365);
      expect(inventoryData[0]).toMatchObject({
        hotelId,
        roomTypeId: 'rt-1',
        availableRooms: 10,
        totalRooms: 10,
      });
      const rateData = mockPrisma.rate.createMany.mock.calls[0][0].data;
      expect(rateData).toHaveLength(365);
      expect(rateData[0]).toMatchObject({
        hotelId,
        roomTypeId: 'rt-1',
        price: 120000,
      });
      expect(result).toEqual(createdRoomType);
    });

    it('should generate inventory with availableRooms equal to totalRooms', async () => {
      const createdRoomType = { id: 'rt-1', ...dto, hotelId };
      mockPrisma.roomType.create.mockResolvedValue(createdRoomType);
      mockPrisma.$transaction.mockImplementation(async (cb: any) => cb(mockPrisma));

      await service.create(hotelId, dto);

      const inventoryData = mockPrisma.inventory.createMany.mock.calls[0][0].data;
      for (const record of inventoryData) {
        expect(record.availableRooms).toBe(record.totalRooms);
      }
    });

    it('should set default maxGuests to 2 when not provided', async () => {
      const dtoWithoutMaxGuests = { ...dto, maxGuests: undefined };
      const createdRoomType = { id: 'rt-1', name: dto.name, basePrice: dto.basePrice, maxGuests: 2, totalRooms: 10, hotelId };
      mockPrisma.roomType.create.mockResolvedValue(createdRoomType);
      mockPrisma.$transaction.mockImplementation(async (cb: any) => cb(mockPrisma));

      await service.create(hotelId, dtoWithoutMaxGuests);

      expect(mockPrisma.roomType.create).toHaveBeenCalledWith({
        data: { ...dtoWithoutMaxGuests, hotelId },
      });
    });
  });

  describe('findAll', () => {
    it('should return all room types for a hotel', async () => {
      const hotelId = 'hotel-1';
      const roomTypes = [
        { id: 'rt-1', name: 'Estándar', hotelId },
        { id: 'rt-2', name: 'Suite', hotelId },
      ];
      mockPrisma.roomType.findMany.mockResolvedValue(roomTypes);

      const result = await service.findAll(hotelId);

      expect(mockPrisma.roomType.findMany).toHaveBeenCalledWith({
        where: { hotelId },
        orderBy: { sortOrder: 'asc' },
      });
      expect(result).toEqual(roomTypes);
    });
  });

  describe('findOne', () => {
    it('should return a specific room type', async () => {
      const roomType = { id: 'rt-1', name: 'Estándar', hotelId: 'hotel-1' };
      mockPrisma.roomType.findUnique.mockResolvedValue(roomType);

      const result = await service.findOne('hotel-1', 'rt-1');

      expect(mockPrisma.roomType.findUnique).toHaveBeenCalledWith({
        where: { id: 'rt-1' },
      });
      expect(result).toEqual(roomType);
    });

    it('should throw NotFoundException when room type belongs to another hotel', async () => {
      mockPrisma.roomType.findUnique.mockResolvedValue({
        id: 'rt-1',
        hotelId: 'hotel-2',
      });

      await expect(service.findOne('hotel-1', 'rt-1')).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when room type does not exist', async () => {
      mockPrisma.roomType.findUnique.mockResolvedValue(null);

      await expect(service.findOne('hotel-1', 'rt-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a room type', async () => {
      const dto = { name: 'Suite Premium', basePrice: 200000 };
      const existing = { id: 'rt-1', name: 'Suite', hotelId: 'hotel-1' };
      const updated = { id: 'rt-1', name: 'Suite Premium', basePrice: 200000, hotelId: 'hotel-1' };

      mockPrisma.roomType.findUnique.mockResolvedValue(existing);
      mockPrisma.roomType.update.mockResolvedValue(updated);

      const result = await service.update('hotel-1', 'rt-1', dto);

      expect(mockPrisma.roomType.update).toHaveBeenCalledWith({
        where: { id: 'rt-1' },
        data: dto,
      });
      expect(result).toEqual(updated);
    });

    it('should throw NotFoundException when room type does not exist', async () => {
      mockPrisma.roomType.findUnique.mockResolvedValue(null);

      await expect(service.update('hotel-1', 'rt-1', { name: 'New' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove a room type', async () => {
      const existing = { id: 'rt-1', hotelId: 'hotel-1' };
      mockPrisma.roomType.findUnique.mockResolvedValue(existing);
      mockPrisma.roomType.delete.mockResolvedValue(existing);

      const result = await service.remove('hotel-1', 'rt-1');

      expect(mockPrisma.roomType.delete).toHaveBeenCalledWith({
        where: { id: 'rt-1' },
      });
      expect(result).toEqual(existing);
    });

    it('should throw NotFoundException when room type does not exist', async () => {
      mockPrisma.roomType.findUnique.mockResolvedValue(null);

      await expect(service.remove('hotel-1', 'rt-1')).rejects.toThrow(NotFoundException);
    });
  });
});

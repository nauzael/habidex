import { Test, TestingModule } from '@nestjs/testing';
import { AdminService } from './admin.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConflictException, NotFoundException } from '@nestjs/common';

// Mock bcrypt for setupAdmin test
jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('mocked-hashed-password'),
  compare: jest.fn(),
}));

import * as bcrypt from 'bcrypt';

describe('AdminService', () => {
  let service: AdminService;

  const mockDate = new Date('2026-06-30T17:27:35Z');

  const mockHotels = [
    {
      id: 'hotel-1',
      name: 'Hotel Paraíso',
      email: 'paraiso@test.com',
      phone: '+573001234567',
      address: 'Calle 1',
      timezone: 'America/Bogota',
      currency: 'COP',
      isFounder: false,
      features: { plan: 'free', active: true },
      createdAt: mockDate,
      updatedAt: mockDate,
      _count: { roomTypes: 14, users: 1, bookings: 10 },
    },
    {
      id: 'hotel-2',
      name: 'Hotel Sol',
      email: 'sol@test.com',
      phone: '+573001234568',
      address: 'Calle 2',
      timezone: 'America/Bogota',
      currency: 'COP',
      isFounder: true,
      features: { plan: 'premium', active: true },
      createdAt: mockDate,
      updatedAt: mockDate,
      _count: { roomTypes: 5, users: 3, bookings: 20 },
    },
  ];

  const mockHotelDetail = {
    id: 'hotel-1',
    name: 'Hotel Paraíso',
    email: 'paraiso@test.com',
    phone: '+573001234567',
    address: 'Calle 1',
    timezone: 'America/Bogota',
    currency: 'COP',
    isFounder: false,
    features: { plan: 'free', active: true },
    createdAt: mockDate,
    updatedAt: mockDate,
    users: [
      { id: 'user-1', name: 'Admin', email: 'admin@test.com', role: 'OWNER', active: true },
    ],
    roomTypes: [
      { id: 'rt-1', name: 'Suite', basePrice: 200000, totalRooms: 5, maxGuests: 2 },
    ],
    _count: { bookings: 10, roomTypes: 1, users: 1 },
  };

  const mockPrisma = {
    hotel: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    user: {
      count: jest.fn().mockResolvedValue(0),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
    },
    booking: {
      count: jest.fn(),
      aggregate: jest.fn(),
    },
    roomType: {
      count: jest.fn(),
      aggregate: jest.fn(),
    },
    inventory: {
      aggregate: jest.fn(),
    },
    $queryRaw: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

    it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('setupAdmin', () => {
    it('should create admin user and return success message', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue({
        id: 'admin-uuid',
        email: 'admin@habidex.com',
        role: 'ADMIN',
        name: 'Admin',
        password: 'mocked-hashed-password',
        hotelId: '00000000-0000-0000-0000-000000000000',
      });

      const result = await service.setupAdmin({ email: 'admin@habidex.com', password: 'admin123' });

      expect(result.message).toBe('Admin user created successfully');
      expect(result.user.email).toBe('admin@habidex.com');
      expect(result.user.role).toBe('ADMIN');
      expect(bcrypt.hash).toHaveBeenCalledWith('admin123', 10);
      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: {
          hotelId: '00000000-0000-0000-0000-000000000000',
          name: 'Admin',
          email: 'admin@habidex.com',
          password: 'mocked-hashed-password',
          role: 'ADMIN',
        },
      });
    });

    it('should throw ConflictException when admin already exists', async () => {
      mockPrisma.user.findFirst.mockResolvedValue({ id: 'existing-admin', email: 'admin@habidex.com' });

      await expect(
        service.setupAdmin({ email: 'admin@habidex.com', password: 'admin123' }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('listHotels', () => {
    it('should return paginated hotels with metrics', async () => {
      mockPrisma.hotel.findMany.mockResolvedValue(mockHotels);
      mockPrisma.hotel.count.mockResolvedValue(2);

      const result = await service.listHotels({ page: 1, limit: 20 });

      expect(result.hotels).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);

      expect(result.hotels[0].name).toBe('Hotel Paraíso');
      expect(result.hotels[0].plan).toBe('free');
      expect(result.hotels[0].rooms).toBe(14);
      expect(result.hotels[0].users).toBe(1);

      expect(mockPrisma.hotel.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 20,
        include: {
          _count: { select: { roomTypes: true, users: true, bookings: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should return empty list when no hotels', async () => {
      mockPrisma.hotel.findMany.mockResolvedValue([]);
      mockPrisma.hotel.count.mockResolvedValue(0);

      const result = await service.listHotels({ page: 1, limit: 20 });

      expect(result.hotels).toHaveLength(0);
      expect(result.total).toBe(0);
    });

    it('should apply correct pagination for page 2', async () => {
      mockPrisma.hotel.findMany.mockResolvedValue([]);
      mockPrisma.hotel.count.mockResolvedValue(25);

      await service.listHotels({ page: 2, limit: 10 });

      expect(mockPrisma.hotel.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 10, take: 10 }),
      );
    });
  });

  describe('getHotelDetail', () => {
    it('should return hotel detail with relations', async () => {
      mockPrisma.hotel.findUnique.mockResolvedValue(mockHotelDetail);

      const result = await service.getHotelDetail('hotel-1');

      expect(result.id).toBe('hotel-1');
      expect(result.name).toBe('Hotel Paraíso');
      expect(result.users).toHaveLength(1);
      expect(result.roomTypes).toHaveLength(1);
      expect(mockPrisma.hotel.findUnique).toHaveBeenCalledWith({
        where: { id: 'hotel-1' },
        include: {
          users: { select: { id: true, name: true, email: true, role: true, active: true } },
          roomTypes: true,
          _count: { select: { bookings: true } },
        },
      });
    });

    it('should throw NotFoundException when hotel does not exist', async () => {
      mockPrisma.hotel.findUnique.mockResolvedValue(null);

      await expect(service.getHotelDetail('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateHotel', () => {
    it('should update hotel fields', async () => {
      const existingHotel = {
        id: 'hotel-1',
        name: 'Hotel Paraíso',
        email: 'paraiso@test.com',
        features: { plan: 'free', active: true },
      };
      mockPrisma.hotel.findUnique.mockResolvedValue(existingHotel);
      mockPrisma.hotel.update.mockResolvedValue({
        ...existingHotel,
        features: { plan: 'premium', isFounder: true, active: true },
        isFounder: true,
      });

      const result = await service.updateHotel('hotel-1', {
        plan: 'premium',
        isFounder: true,
      });

      expect(result).toBeDefined();
      expect(mockPrisma.hotel.update).toHaveBeenCalledWith({
        where: { id: 'hotel-1' },
        data: {
          isFounder: true,
          features: { plan: 'premium', active: true },
        },
      });
    });

    it('should update features when provided', async () => {
      const existingHotel = {
        id: 'hotel-1',
        features: { plan: 'free', active: true },
      };
      mockPrisma.hotel.findUnique.mockResolvedValue(existingHotel);
      mockPrisma.hotel.update.mockResolvedValue({ ...existingHotel, features: { plan: 'free', active: true, extraFeature: true } });

      await service.updateHotel('hotel-1', { features: { extraFeature: true } });

      expect(mockPrisma.hotel.update).toHaveBeenCalledWith({
        where: { id: 'hotel-1' },
        data: {
          features: { plan: 'free', active: true, extraFeature: true },
        },
      });
    });

    it('should throw NotFoundException when hotel does not exist', async () => {
      mockPrisma.hotel.findUnique.mockResolvedValue(null);

      await expect(service.updateHotel('non-existent', {})).rejects.toThrow(NotFoundException);
    });
  });

  describe('deactivateHotel', () => {
    it('should soft-delete hotel by setting active=false in features', async () => {
      const existingHotel = {
        id: 'hotel-1',
        features: { plan: 'free', active: true },
      };
      mockPrisma.hotel.findUnique.mockResolvedValue(existingHotel);
      mockPrisma.hotel.update.mockResolvedValue({
        ...existingHotel,
        features: { plan: 'free', active: false },
      });

      const result = await service.deactivateHotel('hotel-1');

      expect(result).toBeDefined();
      expect(mockPrisma.hotel.update).toHaveBeenCalledWith({
        where: { id: 'hotel-1' },
        data: {
          features: { plan: 'free', active: false },
        },
      });
    });

    it('should throw NotFoundException when hotel does not exist', async () => {
      mockPrisma.hotel.findUnique.mockResolvedValue(null);

      await expect(service.deactivateHotel('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getStats', () => {
    it('should return system-wide statistics', async () => {
      mockPrisma.hotel.count.mockResolvedValue(5);
      mockPrisma.user.count.mockResolvedValue(50);
      mockPrisma.booking.count.mockResolvedValue(200);
      mockPrisma.roomType.aggregate.mockResolvedValue({ _sum: { totalRooms: 100 } });
      mockPrisma.inventory.aggregate.mockResolvedValue({ _sum: { availableRooms: 800, totalRooms: 1000 } });
      mockPrisma.$queryRaw.mockResolvedValue([{ total_size: 15728640 }]);

      const result = await service.getStats();

      expect(result.totalHotels).toBe(5);
      expect(result.totalUsers).toBe(50);
      expect(result.totalBookings).toBe(200);
      expect(result.totalRooms).toBe(100);
      expect(result.avgOccupancy).toBe(20);
      expect(typeof result.systemUptime).toBe('string');
      expect(typeof result.databaseSize).toBe('string');
    });
  });

  describe('getLogs', () => {
    it('should return paginated logs', async () => {
      const result = await service.getLogs({ page: 1, limit: 50 });

      expect(result.logs).toBeDefined();
      expect(Array.isArray(result.logs)).toBe(true);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(50);
    });
  });

  describe('getHealth', () => {
    it('should return detailed health info', async () => {
      mockPrisma.$queryRaw.mockResolvedValue([{ 1: 1 }]);

      const result = await service.getHealth();

      expect(result.database).toBe('connected');
      expect(result.server).toBe('ok');
      expect(typeof result.uptime).toBe('string');
      expect(typeof result.timestamp).toBe('string');
    });
  });
});

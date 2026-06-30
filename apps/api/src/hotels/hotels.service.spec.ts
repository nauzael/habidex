import { Test, TestingModule } from '@nestjs/testing';
import { HotelsService } from './hotels.service';
import { PrismaService } from '../prisma/prisma.service';

describe('HotelsService', () => {
  let service: HotelsService;
  let prisma: PrismaService;

  const mockHotel = {
    id: 'hotel-1',
    name: 'Hotel Test',
    email: 'test@hotel.com',
    phone: '+573001234567',
    address: 'Calle 1',
    timezone: 'America/Bogota',
    currency: 'COP',
    isFounder: false,
    features: {},
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUser = {
    id: 'user-1',
    hotelId: 'hotel-1',
    name: 'Admin',
    email: 'admin@test.com',
    role: 'OWNER',
    active: true,
  };

  const mockPrisma = {
    hotel: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    user: {
      findMany: jest.fn(),
    },
    booking: {
      aggregate: jest.fn(),
      count: jest.fn(),
    },
    roomType: {
      count: jest.fn(),
    },
    inventory: {
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HotelsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<HotelsService>(HotelsService);
    prisma = module.get<PrismaService>(PrismaService);
    void prisma; // used for mock access in tests
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findProfile', () => {
    it('should return hotel profile with user count', async () => {
      mockPrisma.hotel.findUnique.mockResolvedValue(mockHotel);
      mockPrisma.user.findMany.mockResolvedValue([mockUser]);
      mockPrisma.booking.count.mockResolvedValue(5);

      const result = await service.findProfile('hotel-1');

      expect(result).toBeDefined();
      expect(result.hotel.name).toBe('Hotel Test');
      expect(result.stats.users).toBe(1);
      expect(mockPrisma.hotel.findUnique).toHaveBeenCalledWith({
        where: { id: 'hotel-1' },
      });
    });

    it('should throw NotFoundException when hotel does not exist', async () => {
      mockPrisma.hotel.findUnique.mockResolvedValue(null);

      await expect(service.findProfile('non-existent')).rejects.toThrow(
        'Hotel no encontrado',
      );
    });
  });

  describe('updateProfile', () => {
    it('should update hotel profile fields', async () => {
      mockPrisma.hotel.findUnique.mockResolvedValue(mockHotel);
      const updatedHotel = { ...mockHotel, name: 'Hotel Updated' };
      mockPrisma.hotel.update.mockResolvedValue(updatedHotel);

      const result = await service.updateProfile('hotel-1', {
        name: 'Hotel Updated',
        phone: '+573001234567',
      });

      expect(result.name).toBe('Hotel Updated');
      expect(mockPrisma.hotel.update).toHaveBeenCalledWith({
        where: { id: 'hotel-1' },
        data: { name: 'Hotel Updated', phone: '+573001234567' },
      });
    });

    it('should throw NotFoundException when updating non-existent hotel', async () => {
      mockPrisma.hotel.findUnique.mockResolvedValue(null);

      await expect(
        service.updateProfile('non-existent', { name: 'New' }),
      ).rejects.toThrow('Hotel no encontrado');
    });
  });

  describe('getStats', () => {
    it('should return booking stats for date range', async () => {
      mockPrisma.hotel.findUnique.mockResolvedValue(mockHotel);
      mockPrisma.booking.aggregate.mockResolvedValue({
        _count: { id: 10 },
        _sum: { totalAmount: 1500000 },
      });
      mockPrisma.booking.count.mockResolvedValue(10);
      mockPrisma.roomType.count.mockResolvedValue(5);
      mockPrisma.inventory.count.mockResolvedValue(150);

      const result = await service.getStats('hotel-1', '2026-07-01', '2026-07-31');

      expect(result).toBeDefined();
      expect(result.totalBookings).toBe(10);
      expect(result.totalRevenue).toBe(1500000);
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';

// Mock bcrypt at module level (native module workaround)
jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('mocked-hashed-password'),
  compare: jest.fn(),
}));

import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;

  const mockPrisma = {
    $transaction: jest.fn(),
    user: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
    },
    hotel: {
      create: jest.fn(),
      findUnique: jest.fn(),
    },
  };

  const mockJwtService = {
    sign: jest.fn().mockReturnValue('test-jwt-token'),
    verify: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    const registerDto = {
      name: 'Don José',
      email: 'jose@hotel.com',
      password: 'secure123',
      hotelName: 'Hotel Paraíso',
    };

    it('should create a hotel and user, returning a JWT', async () => {
      const mockHotel = {
        id: 'hotel-uuid',
        name: 'Hotel Paraíso',
        email: 'jose@hotel.com',
      };
      const mockUser = {
        id: 'user-uuid',
        hotelId: 'hotel-uuid',
        name: 'Don José',
        email: 'jose@hotel.com',
        password: 'mocked-hashed-password',
        role: 'OWNER',
        active: true,
        createdAt: new Date(),
      };

      mockPrisma.$transaction.mockImplementation(async (cb: any) => {
        return cb({
          hotel: { create: mockPrisma.hotel.create },
          user: { create: mockPrisma.user.create },
        });
      });
      mockPrisma.hotel.create.mockResolvedValue(mockHotel);
      mockPrisma.user.create.mockResolvedValue(mockUser);

      const result = await service.register(registerDto);

      expect(result.token).toBe('test-jwt-token');
      expect(result.user).not.toHaveProperty('password');
      expect(result.user.email).toBe('jose@hotel.com');
      expect(result.user.name).toBe('Don José');
      expect(result.user.role).toBe('OWNER');
      expect(result.hotel.name).toBe('Hotel Paraíso');
      expect(result.hotel.id).toBe('hotel-uuid');

      expect(mockPrisma.hotel.create).toHaveBeenCalledWith({
        data: {
          name: registerDto.hotelName,
          email: registerDto.email,
          phone: null,
        },
      });
      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: {
          hotelId: 'hotel-uuid',
          name: registerDto.name,
          email: registerDto.email,
          password: 'mocked-hashed-password',
          role: 'OWNER',
        },
      });
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        sub: 'user-uuid',
        email: 'jose@hotel.com',
        hotelId: 'hotel-uuid',
      });
    });

    it('should throw ConflictException when email already exists', async () => {
      mockPrisma.user.findFirst.mockResolvedValue({ id: 'existing-user' });

      await expect(service.register(registerDto)).rejects.toThrow(ConflictException);
      expect(mockPrisma.user.findFirst).toHaveBeenCalledWith({
        where: { email: registerDto.email },
      });
    });
  });

  describe('login', () => {
    const loginDto = { email: 'jose@hotel.com', password: 'secure123' };

    it('should return a JWT when credentials are valid', async () => {
      const mockUser = {
        id: 'user-uuid',
        hotelId: 'hotel-uuid',
        name: 'Don José',
        email: 'jose@hotel.com',
        password: 'mocked-hashed-password',
        role: 'OWNER',
        active: true,
        createdAt: new Date(),
        hotel: { id: 'hotel-uuid', name: 'Hotel Paraíso' },
      };

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockPrisma.user.findFirst.mockResolvedValue(mockUser);

      const result = await service.login(loginDto);

      expect(result.token).toBe('test-jwt-token');
      expect(result.user.email).toBe('jose@hotel.com');
      expect(result.user).not.toHaveProperty('password');
      expect(result.hotel.name).toBe('Hotel Paraíso');
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        sub: 'user-uuid',
        email: 'jose@hotel.com',
        hotelId: 'hotel-uuid',
      });
    });

    it('should throw UnauthorizedException when email is not found', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when password is wrong', async () => {
      const user = {
        id: 'user-uuid',
        email: 'jose@hotel.com',
        password: 'mocked-hashed-password',
        hotel: { id: 'hotel-uuid', name: 'Hotel' },
      };
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      mockPrisma.user.findFirst.mockResolvedValue(user);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('validateUser', () => {
    it('should return user without password', async () => {
      const mockUser = {
        id: 'user-uuid',
        hotelId: 'hotel-uuid',
        name: 'Don José',
        email: 'jose@hotel.com',
        password: 'hashed-stuff',
        role: 'OWNER',
        active: true,
        createdAt: new Date(),
      };
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.validateUser('user-uuid');

      expect(result).not.toHaveProperty('password');
      expect(result.id).toBe('user-uuid');
      expect(result.email).toBe('jose@hotel.com');
    });

    it('should throw UnauthorizedException when user is not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(service.validateUser('non-existent')).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('getProfile', () => {
    it('should return hotel and users without passwords', async () => {
      const mockHotel = {
        id: 'hotel-uuid',
        name: 'Hotel Paraíso',
        users: [
          {
            id: 'user-uuid',
            hotelId: 'hotel-uuid',
            name: 'Don José',
            email: 'jose@hotel.com',
            password: 'hash',
            role: 'OWNER',
            active: true,
            createdAt: new Date(),
          },
        ],
      };
      mockPrisma.hotel.findUnique.mockResolvedValue(mockHotel);

      const result = await service.getProfile('hotel-uuid');

      expect(result.hotel.id).toBe('hotel-uuid');
      expect(result.hotel.name).toBe('Hotel Paraíso');
      expect(result.users).toHaveLength(1);
      expect(result.users[0]).not.toHaveProperty('password');
      expect(result.users[0].email).toBe('jose@hotel.com');
    });

    it('should throw UnauthorizedException when hotel is not found', async () => {
      mockPrisma.hotel.findUnique.mockResolvedValue(null);

      await expect(service.getProfile('non-existent')).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('refreshToken', () => {
    it('should return a new JWT token', async () => {
      const result = await service.refreshToken('user-uuid', 'jose@hotel.com', 'hotel-uuid');

      expect(result.token).toBe('test-jwt-token');
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        sub: 'user-uuid',
        email: 'jose@hotel.com',
        hotelId: 'hotel-uuid',
      });
    });
  });
});

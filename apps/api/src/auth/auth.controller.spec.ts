import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
    getProfile: jest.fn(),
    refreshToken: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('POST /auth/register', () => {
    it('should call authService.register and return the result', async () => {
      const dto = {
        name: 'Don José',
        email: 'jose@hotel.com',
        password: 'secure123',
        hotelName: 'Hotel Paraíso',
      };
      const expectedResult = {
        token: 'jwt-token',
        user: { id: 'user-1', name: 'Don José', email: 'jose@hotel.com', role: 'OWNER' },
        hotel: { id: 'hotel-1', name: 'Hotel Paraíso' },
      };
      mockAuthService.register.mockResolvedValue(expectedResult);

      const result = await controller.register(dto);

      expect(result).toEqual(expectedResult);
      expect(mockAuthService.register).toHaveBeenCalledWith(dto);
    });
  });

  describe('POST /auth/login', () => {
    it('should call authService.login and return the result', async () => {
      const dto = { email: 'jose@hotel.com', password: 'secure123' };
      const expectedResult = {
        token: 'jwt-token',
        user: { id: 'user-1', email: 'jose@hotel.com', role: 'OWNER' },
        hotel: { id: 'hotel-1', name: 'Hotel Paraíso' },
      };
      mockAuthService.login.mockResolvedValue(expectedResult);

      const result = await controller.login(dto);

      expect(result).toEqual(expectedResult);
      expect(mockAuthService.login).toHaveBeenCalledWith(dto);
    });
  });

  describe('GET /auth/profile', () => {
    it('should call authService.getProfile with hotelId from request', async () => {
      const req = { user: { id: 'user-1', hotelId: 'hotel-1' } };
      const expectedResult = {
        hotel: { id: 'hotel-1', name: 'Hotel Paraíso' },
        users: [{ id: 'user-1', name: 'Don José', email: 'jose@hotel.com', role: 'OWNER' }],
      };
      mockAuthService.getProfile.mockResolvedValue(expectedResult);

      const result = await controller.getProfile(req);

      expect(result).toEqual(expectedResult);
      expect(mockAuthService.getProfile).toHaveBeenCalledWith('hotel-1');
    });
  });

  describe('POST /auth/refresh', () => {
    it('should call authService.refreshToken with user info from request', async () => {
      const req = { user: { id: 'user-1', email: 'jose@hotel.com', hotelId: 'hotel-1' } };
      mockAuthService.refreshToken.mockResolvedValue({ token: 'new-jwt-token' });

      const result = await controller.refresh(req);

      expect(result).toEqual({ token: 'new-jwt-token' });
      expect(mockAuthService.refreshToken).toHaveBeenCalledWith('user-1', 'jose@hotel.com', 'hotel-1');
    });
  });
});

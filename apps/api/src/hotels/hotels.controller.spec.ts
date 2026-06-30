import { Test, TestingModule } from '@nestjs/testing';
import { HotelsController } from './hotels.controller';
import { HotelsService } from './hotels.service';

describe('HotelsController', () => {
  let controller: HotelsController;

  const mockService = {
    findProfile: jest.fn(),
    updateProfile: jest.fn(),
    getStats: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HotelsController],
      providers: [{ provide: HotelsService, useValue: mockService }],
    }).compile();

    controller = module.get<HotelsController>(HotelsController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getProfile', () => {
    it('should return hotel profile from service', async () => {
      const mockProfile = {
        hotel: { id: 'hotel-1', name: 'Test Hotel' },
        stats: { users: 2 },
      };
      mockService.findProfile.mockResolvedValue(mockProfile);

      const result = await controller.getProfile({ user: { hotelId: 'hotel-1' } });

      expect(result).toEqual(mockProfile);
      expect(mockService.findProfile).toHaveBeenCalledWith('hotel-1');
    });
  });

  describe('updateProfile', () => {
    it('should update and return hotel profile', async () => {
      const dto = { name: 'Updated Hotel' };
      const updated = { id: 'hotel-1', name: 'Updated Hotel' };
      mockService.updateProfile.mockResolvedValue(updated);

      const result = await controller.updateProfile(
        { user: { hotelId: 'hotel-1' } },
        dto,
      );

      expect(result).toEqual(updated);
      expect(mockService.updateProfile).toHaveBeenCalledWith('hotel-1', dto);
    });
  });

  describe('getStats', () => {
    it('should return booking stats', async () => {
      const stats = { totalBookings: 10, totalRevenue: 1500000 };
      mockService.getStats.mockResolvedValue(stats);

      const result = await controller.getStats(
        { user: { hotelId: 'hotel-1' } },
        '2026-07-01',
        '2026-07-31',
      );

      expect(result).toEqual(stats);
      expect(mockService.getStats).toHaveBeenCalledWith(
        'hotel-1',
        '2026-07-01',
        '2026-07-31',
      );
    });
  });
});

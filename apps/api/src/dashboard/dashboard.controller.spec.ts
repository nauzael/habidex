import { Test, TestingModule } from '@nestjs/testing';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

describe('DashboardController', () => {
  let controller: DashboardController;
  let service: any;

  const mockService = {
    getSummary: jest.fn(),
    getOccupancy: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [DashboardController],
      providers: [{ provide: DashboardService, useValue: mockService }],
    }).compile();

    controller = module.get<DashboardController>(DashboardController);
    service = module.get(DashboardService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getSummary', () => {
    it('should call service.getSummary with hotelId', async () => {
      const expected = {
        occupancyToday: '12/14',
        occupancyPercent: 86,
        adr: 120000,
        revpar: 103200,
        totalRooms: 14,
        occupiedRooms: 12,
        checkinsToday: 3,
        bookingsToday: 5,
        weeklyOccupancy: [],
      };
      mockService.getSummary.mockResolvedValue(expected);

      const result = await controller.getSummary({ user: { hotelId: 'hotel-1' } });

      expect(service.getSummary).toHaveBeenCalledWith('hotel-1');
      expect(result).toEqual(expected);
    });
  });

  describe('getOccupancy', () => {
    it('should call service.getOccupancy with hotelId and date range', async () => {
      mockService.getOccupancy.mockResolvedValue([
        { date: '2026-06-30', percent: 86 },
      ]);

      const result = await controller.getOccupancy(
        { user: { hotelId: 'hotel-1' } },
        '2026-06-24',
        '2026-06-30',
      );

      expect(service.getOccupancy).toHaveBeenCalledWith('hotel-1', '2026-06-24', '2026-06-30');
      expect(result).toEqual([{ date: '2026-06-30', percent: 86 }]);
    });
  });
});

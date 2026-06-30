import { Test, TestingModule } from '@nestjs/testing';
import { RatesController } from './rates.controller';
import { RatesService } from './rates.service';
import { Season } from '@prisma/client';

describe('RatesController', () => {
  let controller: RatesController;
  let service: any;

  const mockService = {
    findByRange: jest.fn(),
    update: jest.fn(),
    bulkUpdate: jest.fn(),
    seasonBulkUpdate: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [RatesController],
      providers: [{ provide: RatesService, useValue: mockService }],
    }).compile();

    controller = module.get<RatesController>(RatesController);
    service = module.get(RatesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findByRange', () => {
    it('should call service.findByRange with query params', async () => {
      mockService.findByRange.mockResolvedValue([{ id: 'r-1', price: 120000 }]);

      const result = await controller.findByRange(
        { user: { hotelId: 'hotel-1' } },
        'rt-1',
        '2026-07-01',
        '2026-07-05',
      );

      expect(service.findByRange).toHaveBeenCalledWith('hotel-1', 'rt-1', '2026-07-01', '2026-07-05');
      expect(result).toEqual([{ id: 'r-1', price: 120000 }]);
    });
  });

  describe('update', () => {
    it('should call service.update with params and dto', async () => {
      const dto = { price: 150000, season: Season.HIGH, version: 1 };
      mockService.update.mockResolvedValue({ price: 150000, version: 2 });

      const result = await controller.update(
        { user: { hotelId: 'hotel-1' } },
        'rt-1',
        '2026-07-01',
        dto,
      );

      expect(service.update).toHaveBeenCalledWith('hotel-1', 'rt-1', '2026-07-01', dto);
      expect(result).toEqual({ price: 150000, version: 2 });
    });
  });

  describe('bulkUpdate', () => {
    it('should call service.bulkUpdate with dto', async () => {
      const dto = { from: '2026-07-01', to: '2026-07-15', roomTypeId: 'rt-1', price: 150000, season: Season.HIGH };
      mockService.bulkUpdate.mockResolvedValue({ count: 15 });

      const result = await controller.bulkUpdate(
        { user: { hotelId: 'hotel-1' } },
        dto,
      );

      expect(service.bulkUpdate).toHaveBeenCalledWith('hotel-1', dto);
      expect(result).toEqual({ count: 15 });
    });
  });

  describe('seasonBulkUpdate', () => {
    it('should call service.seasonBulkUpdate with dto', async () => {
      const dto = { from: '2026-07-01', to: '2026-12-31', price: 180000, season: Season.HIGH };
      mockService.seasonBulkUpdate.mockResolvedValue({ count: 100 });

      const result = await controller.seasonBulkUpdate(
        { user: { hotelId: 'hotel-1' } },
        dto,
      );

      expect(service.seasonBulkUpdate).toHaveBeenCalledWith('hotel-1', dto);
      expect(result).toEqual({ count: 100 });
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';

describe('InventoryController', () => {
  let controller: InventoryController;
  let service: any;

  const mockService = {
    findOne: jest.fn(),
    update: jest.fn(),
    findBulk: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [InventoryController],
      providers: [{ provide: InventoryService, useValue: mockService }],
    }).compile();

    controller = module.get<InventoryController>(InventoryController);
    service = module.get(InventoryService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findOne', () => {
    it('should call service.findOne with params', async () => {
      mockService.findOne.mockResolvedValue({ available: 8, total: 10 });

      const result = await controller.findOne(
        { user: { hotelId: 'hotel-1' } },
        'rt-1',
        '2026-07-01',
      );

      expect(service.findOne).toHaveBeenCalledWith('hotel-1', 'rt-1', '2026-07-01');
      expect(result).toEqual({ available: 8, total: 10 });
    });
  });

  describe('update', () => {
    it('should call service.update with params and dto', async () => {
      const dto = { availableRooms: 5, version: 3 };
      mockService.update.mockResolvedValue({ available: 5, total: 10, version: 4 });

      const result = await controller.update(
        { user: { hotelId: 'hotel-1' } },
        'rt-1',
        '2026-07-01',
        dto,
      );

      expect(service.update).toHaveBeenCalledWith('hotel-1', 'rt-1', '2026-07-01', dto);
      expect(result).toEqual({ available: 5, total: 10, version: 4 });
    });
  });

  describe('findBulk', () => {
    it('should call service.findBulk with hotelId and query params', async () => {
      mockService.findBulk.mockResolvedValue({ dates: ['2026-07-01'], roomTypes: [] });

      const result = await controller.findBulk(
        { user: { hotelId: 'hotel-1' } },
        '2026-07-01',
        '2026-07-03',
      );

      expect(service.findBulk).toHaveBeenCalledWith('hotel-1', '2026-07-01', '2026-07-03');
      expect(result).toEqual({ dates: ['2026-07-01'], roomTypes: [] });
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { RoomTypesController } from './room-types.controller';
import { RoomTypesService } from './room-types.service';

describe('RoomTypesController', () => {
  let controller: RoomTypesController;
  let service: any;

  const mockService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [RoomTypesController],
      providers: [{ provide: RoomTypesService, useValue: mockService }],
    }).compile();

    controller = module.get<RoomTypesController>(RoomTypesController);
    service = module.get(RoomTypesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call service.create with hotelId and dto', async () => {
      const dto = { name: 'Estándar', basePrice: 120000, totalRooms: 10 };
      const expected = { id: 'rt-1', ...dto };
      mockService.create.mockResolvedValue(expected);

      const result = await controller.create({ user: { hotelId: 'hotel-1' } }, dto as any);

      expect(service.create).toHaveBeenCalledWith('hotel-1', dto);
      expect(result).toEqual(expected);
    });
  });

  describe('findAll', () => {
    it('should call service.findAll with hotelId', async () => {
      const expected = [{ id: 'rt-1', name: 'Estándar' }];
      mockService.findAll.mockResolvedValue(expected);

      const result = await controller.findAll({ user: { hotelId: 'hotel-1' } });

      expect(service.findAll).toHaveBeenCalledWith('hotel-1');
      expect(result).toEqual(expected);
    });
  });

  describe('findOne', () => {
    it('should call service.findOne with hotelId and id', async () => {
      const expected = { id: 'rt-1', name: 'Estándar' };
      mockService.findOne.mockResolvedValue(expected);

      const result = await controller.findOne({ user: { hotelId: 'hotel-1' } }, 'rt-1');

      expect(service.findOne).toHaveBeenCalledWith('hotel-1', 'rt-1');
      expect(result).toEqual(expected);
    });
  });

  describe('update', () => {
    it('should call service.update with hotelId, id, and dto', async () => {
      const dto = { name: 'Suite Premium' };
      const expected = { id: 'rt-1', name: 'Suite Premium' };
      mockService.update.mockResolvedValue(expected);

      const result = await controller.update({ user: { hotelId: 'hotel-1' } }, 'rt-1', dto as any);

      expect(service.update).toHaveBeenCalledWith('hotel-1', 'rt-1', dto);
      expect(result).toEqual(expected);
    });
  });

  describe('remove', () => {
    it('should call service.remove with hotelId and id', async () => {
      mockService.remove.mockResolvedValue({ id: 'rt-1' });

      const result = await controller.remove({ user: { hotelId: 'hotel-1' } }, 'rt-1');

      expect(service.remove).toHaveBeenCalledWith('hotel-1', 'rt-1');
      expect(result).toEqual({ id: 'rt-1' });
    });
  });
});

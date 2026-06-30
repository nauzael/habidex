import { Test, TestingModule } from '@nestjs/testing';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

describe('AdminController', () => {
  let controller: AdminController;

  const mockAdminService = {
    listHotels: jest.fn(),
    getHotelDetail: jest.fn(),
    updateHotel: jest.fn(),
    deactivateHotel: jest.fn(),
    getStats: jest.fn(),
    getLogs: jest.fn(),
    getHealth: jest.fn(),
    setupAdmin: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminController],
      providers: [
        { provide: AdminService, useValue: mockAdminService },
      ],
    }).compile();

    controller = module.get<AdminController>(AdminController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('GET /admin/hotels', () => {
    it('should call listHotels with pagination', async () => {
      const result = {
        hotels: [{ id: 'hotel-1', name: 'Test' }],
        total: 1,
        page: 1,
        limit: 20,
      };
      mockAdminService.listHotels.mockResolvedValue(result);

      const response = await controller.listHotels(1, 20);

      expect(response).toEqual(result);
      expect(mockAdminService.listHotels).toHaveBeenCalledWith({ page: 1, limit: 20 });
    });

    it('should use default pagination values', async () => {
      mockAdminService.listHotels.mockResolvedValue({ hotels: [], total: 0, page: 1, limit: 20 });

      await controller.listHotels(undefined, undefined);

      expect(mockAdminService.listHotels).toHaveBeenCalledWith({ page: 1, limit: 20 });
    });
  });

  describe('GET /admin/hotels/:id', () => {
    it('should call getHotelDetail with id', async () => {
      const detail = { id: 'hotel-1', name: 'Test' };
      mockAdminService.getHotelDetail.mockResolvedValue(detail);

      const result = await controller.getHotel('hotel-1');

      expect(result).toEqual(detail);
      expect(mockAdminService.getHotelDetail).toHaveBeenCalledWith('hotel-1');
    });
  });

  describe('PATCH /admin/hotels/:id', () => {
    it('should call updateHotel with id and dto', async () => {
      const dto = { plan: 'premium', isFounder: true };
      const updated = { id: 'hotel-1', plan: 'premium' };
      mockAdminService.updateHotel.mockResolvedValue(updated);

      const result = await controller.updateHotel('hotel-1', dto);

      expect(result).toEqual(updated);
      expect(mockAdminService.updateHotel).toHaveBeenCalledWith('hotel-1', dto);
    });
  });

  describe('DELETE /admin/hotels/:id', () => {
    it('should call deactivateHotel with id', async () => {
      const deactivated = { id: 'hotel-1', features: { active: false } };
      mockAdminService.deactivateHotel.mockResolvedValue(deactivated);

      const result = await controller.deleteHotel('hotel-1');

      expect(result).toEqual(deactivated);
      expect(mockAdminService.deactivateHotel).toHaveBeenCalledWith('hotel-1');
    });
  });

  describe('GET /admin/stats', () => {
    it('should call getStats', async () => {
      const stats = { totalHotels: 5, totalUsers: 50 };
      mockAdminService.getStats.mockResolvedValue(stats);

      const result = await controller.getStats();

      expect(result).toEqual(stats);
      expect(mockAdminService.getStats).toHaveBeenCalled();
    });
  });

  describe('GET /admin/logs', () => {
    it('should call getLogs with pagination', async () => {
      const logs = { logs: [], total: 0, page: 1, limit: 50 };
      mockAdminService.getLogs.mockResolvedValue(logs);

      const result = await controller.getLogs(1, 50);

      expect(result).toEqual(logs);
      expect(mockAdminService.getLogs).toHaveBeenCalledWith({ page: 1, limit: 50 });
    });
  });

  describe('GET /admin/health', () => {
    it('should call getHealth', async () => {
      const health = { server: 'ok', database: 'connected' };
      mockAdminService.getHealth.mockResolvedValue(health);

      const result = await controller.getHealth();

      expect(result).toEqual(health);
      expect(mockAdminService.getHealth).toHaveBeenCalled();
    });
  });

  describe('POST /admin/setup', () => {
    it('should call setupAdmin with email and password', async () => {
      const setupResult = { message: 'Admin created' };
      mockAdminService.setupAdmin.mockResolvedValue(setupResult);

      const result = await controller.setup({ email: 'admin@habidex.com', password: 'admin123' });

      expect(result).toEqual(setupResult);
      expect(mockAdminService.setupAdmin).toHaveBeenCalledWith({
        email: 'admin@habidex.com',
        password: 'admin123',
      });
    });
  });
});

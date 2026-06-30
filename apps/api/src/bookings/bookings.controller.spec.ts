import { Test, TestingModule } from '@nestjs/testing';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';

describe('BookingsController', () => {
  let controller: BookingsController;

  const mockBookingsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    cancel: jest.fn(),
    getToday: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [BookingsController],
      providers: [
        { provide: BookingsService, useValue: mockBookingsService },
      ],
    }).compile();

    controller = module.get<BookingsController>(BookingsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('POST /bookings', () => {
    it('should create a booking', async () => {
      const dto = {
        guestName: 'Juan Pérez',
        guestEmail: 'juan@example.com',
        roomTypeId: 'rt-1',
        checkIn: '2026-07-01',
        checkOut: '2026-07-03',
        totalAmount: 250000,
      };
      const created = { id: 'b-1', ...dto };
      mockBookingsService.create.mockResolvedValue(created);

      const req = { user: { hotelId: 'hotel-1' } };
      const result = await controller.create(req, dto);

      expect(result).toEqual(created);
      expect(mockBookingsService.create).toHaveBeenCalledWith('hotel-1', dto);
    });
  });

  describe('GET /bookings', () => {
    it('should list bookings with pagination and filters', async () => {
      const result = { bookings: [], total: 0, page: 1, limit: 20 };
      mockBookingsService.findAll.mockResolvedValue(result);

      const req = { user: { hotelId: 'hotel-1' } };
      const response = await controller.findAll(req, 1, 20, 'CONFIRMED', '2026-07-01', '2026-07-31');

      expect(response).toEqual(result);
      expect(mockBookingsService.findAll).toHaveBeenCalledWith(
        'hotel-1', 1, 20,
        { status: 'CONFIRMED', from: '2026-07-01', to: '2026-07-31' },
      );
    });

    it('should use default pagination values', async () => {
      mockBookingsService.findAll.mockResolvedValue({ bookings: [], total: 0, page: 1, limit: 20 });

      const req = { user: { hotelId: 'hotel-1' } };
      await controller.findAll(req, undefined, undefined, undefined, undefined, undefined);

      expect(mockBookingsService.findAll).toHaveBeenCalledWith(
        'hotel-1', 1, 20, {},
      );
    });
  });

  describe('GET /bookings/today', () => {
    it('should return today bookings', async () => {
      const result = { bookings: [{ id: 'b-1' }], total: 1 };
      mockBookingsService.getToday.mockResolvedValue(result);

      const req = { user: { hotelId: 'hotel-1' } };
      const response = await controller.getToday(req);

      expect(response).toEqual(result);
      expect(mockBookingsService.getToday).toHaveBeenCalledWith('hotel-1');
    });
  });

  describe('GET /bookings/:id', () => {
    it('should return booking detail', async () => {
      const detail = { id: 'b-1', guestName: 'Juan Pérez' };
      mockBookingsService.findOne.mockResolvedValue(detail);

      const result = await controller.findOne('b-1');

      expect(result).toEqual(detail);
      expect(mockBookingsService.findOne).toHaveBeenCalledWith('b-1');
    });
  });

  describe('PATCH /bookings/:id/cancel', () => {
    it('should cancel a booking', async () => {
      const cancelled = { id: 'b-1', status: 'CANCELLED' };
      mockBookingsService.cancel.mockResolvedValue(cancelled);

      const result = await controller.cancel('b-1');

      expect(result).toEqual(cancelled);
      expect(mockBookingsService.cancel).toHaveBeenCalledWith('b-1');
    });
  });
});

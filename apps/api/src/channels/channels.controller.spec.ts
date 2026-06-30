import { Test, TestingModule } from '@nestjs/testing';
import { ChannelsController } from './channels.controller';
import { ChannelsService } from './channels.service';

describe('ChannelsController', () => {
  let controller: ChannelsController;

  const mockService = {
    pushAvailability: jest.fn(),
    pullBookings: jest.fn(),
    exportCsv: jest.fn(),
    getChannelStatus: jest.fn(),
    processWebhook: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChannelsController],
      providers: [{ provide: ChannelsService, useValue: mockService }],
    }).compile();

    controller = module.get<ChannelsController>(ChannelsController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('pushAvailability', () => {
    it('should push availability to OTA channels', async () => {
      mockService.pushAvailability.mockResolvedValue({ updated: true });

      const result = await controller.pushAvailability(
        { user: { hotelId: 'hotel-1' } },
        { roomTypeId: 'rt-1', date: '2026-07-15', availableRooms: 5, version: 1 },
      );

      expect(result).toEqual({ updated: true });
    });
  });

  describe('pullBookings', () => {
    it('should pull bookings from OTA channels', async () => {
      mockService.pullBookings.mockResolvedValue([{ id: 'b-1' }]);

      const result = await controller.pullBookings(
        { user: { hotelId: 'hotel-1' } },
        '2026-07-01',
        '2026-07-31',
      );

      expect(result).toHaveLength(1);
    });
  });

  describe('exportCsv', () => {
    it('should export inventory as CSV', async () => {
      mockService.exportCsv.mockResolvedValue({ csv: 'room_type,date,available\n...' });

      const result = await controller.exportCsv(
        { user: { hotelId: 'hotel-1' } },
        '2026-07-01',
        '2026-07-31',
      );

      expect(result).toBeDefined();
    });
  });

  describe('getStatus', () => {
    it('should return channel connection status', async () => {
      mockService.getChannelStatus.mockResolvedValue({ booking: { connected: true }, despegar: { connected: false } });

      const result = await controller.getStatus({ user: { hotelId: 'hotel-1' } });

      expect(result.booking).toBeDefined();
    });
  });
});

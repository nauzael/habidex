import { Test, TestingModule } from '@nestjs/testing';
import { WhatsappController } from './whatsapp.controller';
import { WhatsappService } from './whatsapp.service';

describe('WhatsappController', () => {
  let controller: WhatsappController;

  const mockService = {
    createSession: jest.fn(),
    getQR: jest.fn(),
    getStatus: jest.fn(),
    sendConfirmation: jest.fn(),
    sendAlert: jest.fn(),
    sendReminder: jest.fn(),
    handleWebhook: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WhatsappController],
      providers: [{ provide: WhatsappService, useValue: mockService }],
    }).compile();

    controller = module.get<WhatsappController>(WhatsappController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createSession', () => {
    it('should create a session for the hotel', async () => {
      mockService.createSession.mockResolvedValue({ sessionId: 'sess-1' });

      const result = await controller.createSession({ user: { hotelId: 'hotel-1' } });

      expect(result).toEqual({ sessionId: 'sess-1' });
    });
  });

  describe('getQR', () => {
    it('should return QR code', async () => {
      mockService.getQR.mockResolvedValue({ qrCode: 'data:...' });

      const result = await controller.getQR({ user: { hotelId: 'hotel-1' } });

      expect(result).toEqual({ qrCode: 'data:...' });
    });
  });

  describe('getStatus', () => {
    it('should return connection status', async () => {
      mockService.getStatus.mockResolvedValue({ connected: true });

      const result = await controller.getStatus({ user: { hotelId: 'hotel-1' } });

      expect(result).toEqual({ connected: true });
    });
  });

  describe('webhook', () => {
    it('should handle incoming messages', async () => {
      mockService.handleWebhook.mockResolvedValue({ received: true });
      const payload = { from: '+573001234567', body: 'Hola' };
      const result = await controller.webhook(payload);

      expect(result).toEqual({ received: true });
    });
  });
});

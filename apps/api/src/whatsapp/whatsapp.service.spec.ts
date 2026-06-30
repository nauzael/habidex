import { Test, TestingModule } from '@nestjs/testing';
import { WhatsappService } from './whatsapp.service';
import { OpenwaProvider } from './openwa.provider';

describe('WhatsappService', () => {
  let service: WhatsappService;
  let provider: OpenwaProvider;

  const mockProvider = {
    sendText: jest.fn(),
    sendTemplate: jest.fn(),
    createSession: jest.fn(),
    getSessionStatus: jest.fn(),
    getQR: jest.fn(),
    logoutSession: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WhatsappService,
        { provide: OpenwaProvider, useValue: mockProvider },
      ],
    }).compile();

    service = module.get<WhatsappService>(WhatsappService);
    provider = module.get<OpenwaProvider>(OpenwaProvider);
    void provider;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendConfirmation', () => {
    it('should send a booking confirmation via OpenWA', async () => {
      mockProvider.sendTemplate.mockResolvedValue({ success: true });

      const result = await service.sendConfirmation(
        'hotel-1',
        '+573001234567',
        { guestName: 'Juan Pérez', roomType: 'Estándar', checkIn: '2026-07-15', checkOut: '2026-07-17', totalAmount: 240000 },
      );

      expect(result).toEqual({ success: true });
      expect(mockProvider.sendTemplate).toHaveBeenCalledWith(
        'hotel-1',
        '+573001234567',
        'booking_confirmation',
        expect.any(Object),
      );
    });
  });

  describe('sendAlert', () => {
    it('should send an overbooking alert', async () => {
      mockProvider.sendText.mockResolvedValue({ success: true });

      const result = await service.sendAlert(
        'hotel-1',
        '+573001234567',
        'Alerta: Posible overbooking en habitación Estándar para el 15/07',
      );

      expect(result).toEqual({ success: true });
      expect(mockProvider.sendText).toHaveBeenCalledWith(
        'hotel-1',
        '+573001234567',
        expect.stringContaining('Alerta'),
      );
    });
  });

  describe('sendReminder', () => {
    it('should send a pre-check-in reminder', async () => {
      mockProvider.sendTemplate.mockResolvedValue({ success: true });

      const result = await service.sendReminder(
        'hotel-1',
        '+573001234567',
        { guestName: 'María López', checkIn: '2026-07-20', roomType: 'Suite' },
      );

      expect(result).toEqual({ success: true });
      expect(mockProvider.sendTemplate).toHaveBeenCalledWith(
        'hotel-1',
        '+573001234567',
        'checkin_reminder',
        expect.any(Object),
      );
    });
  });

  describe('createSession', () => {
    it('should create a new WhatsApp session for the hotel', async () => {
      mockProvider.createSession.mockResolvedValue({ sessionId: 'sess-hotel-1' });

      const result = await service.createSession('hotel-1');

      expect(result).toEqual({ sessionId: 'sess-hotel-1' });
      expect(mockProvider.createSession).toHaveBeenCalledWith('hotel-1');
    });
  });

  describe('getQR', () => {
    it('should return the QR code for scanning', async () => {
      mockProvider.getQR.mockResolvedValue({ qrCode: 'data:image/png;base64,...' });

      const result = await service.getQR('hotel-1');

      expect(result).toEqual({ qrCode: 'data:image/png;base64,...' });
      expect(mockProvider.getQR).toHaveBeenCalledWith('hotel-1');
    });
  });

  describe('getStatus', () => {
    it('should return session connection status', async () => {
      mockProvider.getSessionStatus.mockResolvedValue({ connected: true, phone: '+573001234567' });

      const result = await service.getStatus('hotel-1');

      expect(result).toEqual({ connected: true, phone: '+573001234567' });
    });
  });
});

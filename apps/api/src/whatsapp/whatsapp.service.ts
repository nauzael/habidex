import { Injectable, Logger } from '@nestjs/common';
import { OpenwaProvider } from './openwa.provider';

export interface BookingNotification {
  guestName: string;
  roomType: string;
  checkIn: string;
  checkOut: string;
  totalAmount: number;
}

export interface ReminderNotification {
  guestName: string;
  checkIn: string;
  roomType: string;
}

@Injectable()
export class WhatsappService {
  private readonly logger = new Logger(WhatsappService.name);

  constructor(private readonly openwa: OpenwaProvider) {}

  async createSession(hotelId: string) {
    return this.openwa.createSession(hotelId);
  }

  async getQR(hotelId: string) {
    return this.openwa.getQR(hotelId);
  }

  async getStatus(hotelId: string) {
    return this.openwa.getSessionStatus(hotelId);
  }

  async sendConfirmation(
    hotelId: string,
    phone: string,
    booking: BookingNotification,
  ) {
    const params = {
      guestName: booking.guestName,
      roomType: booking.roomType,
      checkIn: booking.checkIn,
      checkOut: booking.checkOut,
      totalAmount: booking.totalAmount.toLocaleString('es-CO'),
    };

    return this.openwa.sendTemplate(hotelId, phone, 'booking_confirmation', params);
  }

  async sendAlert(hotelId: string, phone: string, message: string) {
    const text = `⚠️ *Habidex — Alerta*\n\n${message}\n\nPor favor revisa el dashboard para más detalles.`;
    return this.openwa.sendText(hotelId, phone, text);
  }

  async sendReminder(
    hotelId: string,
    phone: string,
    reminder: ReminderNotification,
  ) {
    const params = {
      guestName: reminder.guestName,
      checkIn: reminder.checkIn,
      roomType: reminder.roomType,
    };

    return this.openwa.sendTemplate(hotelId, phone, 'checkin_reminder', params);
  }

  async handleWebhook(payload: any): Promise<{ received: boolean }> {
    this.logger.log(`WhatsApp webhook received: ${JSON.stringify(payload)}`);

    // Process incoming message — in production, route to support ticket system
    const from = payload.from || payload.From;
    const body = payload.body || payload.Body || '';

    if (from && body) {
      this.logger.log(`Message from ${from}: ${body.substring(0, 100)}`);
    }

    return { received: true };
  }
}

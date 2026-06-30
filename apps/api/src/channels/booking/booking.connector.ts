import { Injectable, Logger } from '@nestjs/common';
import type {
  OTAConnector,
  AvailabilityPush,
  RatePush,
  OtaBooking,
  ChannelStatus,
} from '../connector.interface';

@Injectable()
export class BookingConnector implements OTAConnector {
  readonly channelName = 'BOOKING_COM';
  private readonly logger = new Logger(BookingConnector.name);
  private readonly baseUrl: string;

  constructor() {
    this.baseUrl =
      process.env.BOOKING_API_URL || 'https://mock-ota:3001/mock/booking';
  }

  async pushAvailability(
    hotelId: string,
    availability: AvailabilityPush[],
  ): Promise<{ success: boolean; errors?: string[] }> {
    try {
      const res = await fetch(`${this.baseUrl}/ari`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.BOOKING_API_KEY || ''}`,
        },
        body: JSON.stringify({ hotelId, availability }),
      });

      if (!res.ok) {
        throw new Error(`Booking.com API error: ${res.statusText}`);
      }

      return { success: true };
    } catch (err: any) {
      this.logger.error(`Booking pushAvailability failed: ${err.message}`);
      return { success: false, errors: [err.message] };
    }
  }

  async pushRates(
    hotelId: string,
    rates: RatePush[],
  ): Promise<{ success: boolean; errors?: string[] }> {
    try {
      const res = await fetch(`${this.baseUrl}/rates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.BOOKING_API_KEY || ''}`,
        },
        body: JSON.stringify({ hotelId, rates }),
      });

      if (!res.ok) {
        throw new Error(`Booking.com rates API error: ${res.statusText}`);
      }

      return { success: true };
    } catch (err: any) {
      this.logger.error(`Booking pushRates failed: ${err.message}`);
      return { success: false, errors: [err.message] };
    }
  }

  async pullBookings(
    _hotelId: string,
    from: string,
    to: string,
  ): Promise<OtaBooking[]> {
    try {
      const res = await fetch(
        `${this.baseUrl}/bookings?hotelId=${_hotelId}&from=${from}&to=${to}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.BOOKING_API_KEY || ''}`,
          },
        },
      );

      if (!res.ok) {
        throw new Error(`Booking pullBookings failed: ${res.statusText}`);
      }

      return res.json() as Promise<OtaBooking[]>;
    } catch (err: any) {
      this.logger.error(`Booking pullBookings failed: ${err.message}`);
      return [];
    }
  }

  async checkStatus(_hotelId: string): Promise<ChannelStatus> {
    try {
      const res = await fetch(`${this.baseUrl}/status`, {
        headers: {
          Authorization: `Bearer ${process.env.BOOKING_API_KEY || ''}`,
        },
      });

      if (res.ok) {
        return { connected: true, lastSyncAt: new Date().toISOString() };
      }
      return { connected: false, lastError: `HTTP ${res.status}` };
    } catch (err: any) {
      return { connected: false, lastError: err.message };
    }
  }
}

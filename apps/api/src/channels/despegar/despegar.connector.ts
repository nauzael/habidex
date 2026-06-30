import { Injectable, Logger } from '@nestjs/common';
import type {
  OTAConnector,
  AvailabilityPush,
  RatePush,
  OtaBooking,
  ChannelStatus,
} from '../connector.interface';

@Injectable()
export class DespegarConnector implements OTAConnector {
  readonly channelName = 'DESPEGAR';
  private readonly logger = new Logger(DespegarConnector.name);
  private readonly baseUrl: string;

  constructor() {
    this.baseUrl =
      process.env.DESPEGAR_API_URL || 'https://mock-ota:3001/mock/despegar';
  }

  async pushAvailability(
    hotelId: string,
    availability: AvailabilityPush[],
  ): Promise<{ success: boolean; errors?: string[] }> {
    try {
      const res = await fetch(`${this.baseUrl}/availability`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Despegar-Api-Key': process.env.DESPEGAR_API_KEY || '',
          'X-Despegar-Secret': process.env.DESPEGAR_API_SECRET || '',
        },
        body: JSON.stringify({ hotelId, availability }),
      });

      if (!res.ok) {
        throw new Error(`Despegar API error: ${res.statusText}`);
      }

      return { success: true };
    } catch (err: any) {
      this.logger.error(`Despegar pushAvailability failed: ${err.message}`);
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
          'X-Despegar-Api-Key': process.env.DESPEGAR_API_KEY || '',
          'X-Despegar-Secret': process.env.DESPEGAR_API_SECRET || '',
        },
        body: JSON.stringify({ hotelId, rates }),
      });

      if (!res.ok) {
        throw new Error(`Despegar rates API error: ${res.statusText}`);
      }

      return { success: true };
    } catch (err: any) {
      this.logger.error(`Despegar pushRates failed: ${err.message}`);
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
            'X-Despegar-Api-Key': process.env.DESPEGAR_API_KEY || '',
            'X-Despegar-Secret': process.env.DESPEGAR_API_SECRET || '',
          },
        },
      );

      if (!res.ok) {
        throw new Error(`Despegar pullBookings failed: ${res.statusText}`);
      }

      return res.json() as Promise<OtaBooking[]>;
    } catch (err: any) {
      this.logger.error(`Despegar pullBookings failed: ${err.message}`);
      return [];
    }
  }

  async checkStatus(_hotelId: string): Promise<ChannelStatus> {
    try {
      const res = await fetch(`${this.baseUrl}/status`, {
        headers: {
          'X-Despegar-Api-Key': process.env.DESPEGAR_API_KEY || '',
          'X-Despegar-Secret': process.env.DESPEGAR_API_SECRET || '',
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

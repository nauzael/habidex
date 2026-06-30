import { Injectable, Logger } from '@nestjs/common';

export interface SessionStatus {
  connected: boolean;
  phone?: string;
  sessionId: string;
}

export interface SendResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

@Injectable()
export class OpenwaProvider {
  private readonly logger = new Logger(OpenwaProvider.name);
  private readonly baseUrl: string;

  // In-memory session store (in production, use Redis/DB)
  private sessions = new Map<string, SessionStatus>();

  constructor() {
    this.baseUrl = process.env.OPENWA_URL || 'http://localhost:2785';
  }

  async createSession(hotelId: string): Promise<{ sessionId: string }> {
    const sessionId = `sess-${hotelId}`;

    try {
      const res = await fetch(`${this.baseUrl}/api/sessions/${sessionId}/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      });

      if (!res.ok) {
        throw new Error(`OpenWA session creation failed: ${res.statusText}`);
      }
    } catch (err: any) {
      // If OpenWA is unreachable, store locally (dev/offline mode)
      this.logger.warn(`OpenWA unreachable, using local session: ${err.message}`);
    }

    this.sessions.set(sessionId, { connected: false, sessionId });
    return { sessionId };
  }

  async getQR(hotelId: string): Promise<{ qrCode: string }> {
    const sessionId = `sess-${hotelId}`;

    try {
      const res = await fetch(`${this.baseUrl}/api/sessions/${sessionId}/qr`);
      if (res.ok) {
        const data: any = await res.json();
        return { qrCode: data.qrCode || data.qr || '' };
      }
    } catch {
      this.logger.warn('OpenWA unreachable for QR');
    }

    // Return mock QR for development
    return { qrCode: 'data:image/png;base64,mock-qr-for-development' };
  }

  async getSessionStatus(hotelId: string): Promise<SessionStatus> {
    const sessionId = `sess-${hotelId}`;
    const cached = this.sessions.get(sessionId);

    try {
      const res = await fetch(`${this.baseUrl}/api/sessions/${sessionId}/status`);
      if (res.ok) {
        const data: any = await res.json();
        const status: SessionStatus = {
          connected: data.status === 'connected',
          phone: data.phone,
          sessionId,
        };
        this.sessions.set(sessionId, status);
        return status;
      }
    } catch {
      this.logger.warn('OpenWA unreachable for status');
    }

    return cached || { connected: false, sessionId };
  }

  async sendText(hotelId: string, to: string, text: string): Promise<SendResult> {
    const sessionId = `sess-${hotelId}`;

    try {
      const res = await fetch(
        `${this.baseUrl}/api/sessions/${sessionId}/messages/send-text`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ to, text }),
        },
      );

      if (res.ok) {
        const data: any = await res.json();
        return { success: true, messageId: data.messageId };
      }
      throw new Error(`OpenWA send failed: ${res.statusText}`);
    } catch (err: any) {
      this.logger.error(`Failed to send WhatsApp message: ${err.message}`);
      return { success: false, error: err.message };
    }
  }

  async sendTemplate(
    hotelId: string,
    to: string,
    templateName: string,
    params?: Record<string, string>,
  ): Promise<SendResult> {
    const sessionId = `sess-${hotelId}`;

    try {
      const res = await fetch(
        `${this.baseUrl}/api/sessions/${sessionId}/messages/send-template`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ to, templateName, params }),
        },
      );

      if (res.ok) {
        const data: any = await res.json();
        return { success: true, messageId: data.messageId };
      }
      throw new Error(`OpenWA template send failed: ${res.statusText}`);
    } catch (err: any) {
      this.logger.error(`Failed to send WhatsApp template: ${err.message}`);
      return { success: false, error: err.message };
    }
  }

  async logoutSession(hotelId: string): Promise<{ success: boolean }> {
    const sessionId = `sess-${hotelId}`;
    this.sessions.delete(sessionId);

    try {
      await fetch(`${this.baseUrl}/api/sessions/${sessionId}/logout`, {
        method: 'POST',
      });
    } catch {
      this.logger.warn('OpenWA unreachable for logout');
    }

    return { success: true };
  }
}

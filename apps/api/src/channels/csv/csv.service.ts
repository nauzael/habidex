import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CsvService {

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Export inventory for a date range as CSV string
   */
  async exportInventory(
    hotelId: string,
    from: string,
    to: string,
  ): Promise<{ csv: string; filename: string }> {
    const roomTypes = await this.prisma.roomType.findMany({
      where: { hotelId },
      orderBy: { sortOrder: 'asc' },
    });

    const inventory = await this.prisma.inventory.findMany({
      where: {
        hotelId,
        date: { gte: new Date(from), lte: new Date(to) },
      },
      orderBy: [{ roomTypeId: 'asc' }, { date: 'asc' }],
    });

    const rates = await this.prisma.rate.findMany({
      where: {
        hotelId,
        date: { gte: new Date(from), lte: new Date(to) },
      },
    });

    const rateMap = new Map<string, number>();
    for (const r of rates) {
      rateMap.set(`${r.roomTypeId}:${this.formatDate(r.date)}`, Number(r.price));
    }

    // Build CSV
    const header = 'room_type_id,room_type_name,date,available,total,price\n';
    const rows: string[] = [];

    for (const rt of roomTypes) {
      for (const inv of inventory) {
        if (inv.roomTypeId !== rt.id) continue;
        const price = rateMap.get(`${rt.id}:${this.formatDate(inv.date)}`) || 0;
        rows.push(
          [
            rt.id,
            `"${rt.name}"`,
            this.formatDate(inv.date),
            inv.availableRooms,
            inv.totalRooms,
            price,
          ].join(','),
        );
      }
    }

    const csv = header + rows.join('\n');
    const filename = `inventory-export-${from}-to-${to}.csv`;

    return { csv, filename };
  }

  /**
   * Parse CSV booking data from OTA portal upload
   */
  async parseBookingsCsv(
    csvContent: string,
  ): Promise<{ bookings: any[]; errors: string[] }> {
    const lines = csvContent.trim().split('\n');
    if (lines.length < 2) {
      return { bookings: [], errors: ['CSV vacío o sin datos'] };
    }

    const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
    const bookings: any[] = [];
    const errors: string[] = [];

    for (let i = 1; i < lines.length; i++) {
      try {
        const values = lines[i].split(',').map((v) => v.trim());
        const row: Record<string, string> = {};
        headers.forEach((h, idx) => {
          row[h] = values[idx] || '';
        });

        bookings.push({
          guestName: row['guest_name'] || row['guest'] || '',
          guestEmail: row['guest_email'] || row['email'] || '',
          checkIn: row['check_in'] || row['checkin'] || '',
          checkOut: row['check_out'] || row['checkout'] || '',
          roomType: row['room_type'] || row['room'] || '',
          totalAmount: parseFloat(row['total_amount'] || row['amount'] || '0'),
          channel: row['channel'] || 'CSV_IMPORT',
        });
      } catch (err: any) {
        errors.push(`Error en línea ${i + 1}: ${err.message}`);
      }
    }

    return { bookings, errors };
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }
}

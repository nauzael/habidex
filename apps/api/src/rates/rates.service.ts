import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateRateDto, BulkRateDto, SeasonBulkDto } from './dto';

@Injectable()
export class RatesService {
  constructor(private readonly prisma: PrismaService) {}

  async findByRange(hotelId: string, roomTypeId: string, from: string, to: string) {
    const rates = await this.prisma.rate.findMany({
      where: {
        hotelId,
        roomTypeId,
        date: {
          gte: new Date(from),
          lte: new Date(to),
        },
      },
      orderBy: { date: 'asc' },
    });

    return rates.map((r) => ({
      ...r,
      price: Number(r.price),
      date: this.formatDate(r.date),
    }));
  }

  async update(hotelId: string, roomTypeId: string, date: string, dto: UpdateRateDto) {
    const result = await this.prisma.rate.updateMany({
      where: {
        hotelId,
        roomTypeId,
        date: new Date(date),
        version: dto.version,
      },
      data: {
        price: dto.price,
        season: dto.season,
        version: { increment: 1 },
      },
    });

    if (result.count === 0) {
      throw new ConflictException('Conflicto de tarifa. Recarga y reintenta.');
    }

    const updated = await this.prisma.rate.findUnique({
      where: {
        hotelId_roomTypeId_date: {
          hotelId,
          roomTypeId,
          date: new Date(date),
        },
      },
    });

    return {
      ...updated,
      price: Number(updated!.price),
      date: this.formatDate(updated!.date),
    };
  }

  async bulkUpdate(hotelId: string, dto: BulkRateDto, skipExisting = false) {
    const from = new Date(dto.from);
    const to = new Date(dto.to);

    // Get all dates that already have rates if skipExisting
    let existingDates = new Set<string>();
    if (skipExisting) {
      const existing = await this.prisma.rate.findMany({
        where: {
          hotelId,
          roomTypeId: dto.roomTypeId,
          date: { gte: from, lte: to },
        },
        select: { date: true },
      });
      for (const e of existing) {
        existingDates.add(this.formatDate(e.date));
      }
    }

    // Generate dates in range
    const dates: Date[] = [];
    const current = new Date(from);
    while (current <= to) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    // Upsert within transaction
    await this.prisma.$transaction(async (tx: any) => {
      for (const date of dates) {
        if (skipExisting && existingDates.has(this.formatDate(date))) {
          continue;
        }
        await tx.rate.upsert({
          where: {
            hotelId_roomTypeId_date: {
              hotelId,
              roomTypeId: dto.roomTypeId,
              date,
            },
          },
          create: {
            hotelId,
            roomTypeId: dto.roomTypeId,
            date,
            price: dto.price,
            season: dto.season,
          },
          update: {
            price: dto.price,
            season: dto.season,
            version: { increment: 1 },
          },
        });
      }
    });

    return { count: dates.length - existingDates.size };
  }

  async seasonBulkUpdate(hotelId: string, dto: SeasonBulkDto) {
    const where: any = {
      hotelId,
      date: {
        gte: new Date(dto.from),
        lte: new Date(dto.to),
      },
    };

    if (dto.roomTypeId) {
      where.roomTypeId = dto.roomTypeId;
    }

    const result = await this.prisma.rate.updateMany({
      where,
      data: {
        price: dto.price,
        season: dto.season,
        version: { increment: 1 },
      },
    });

    return { count: result.count };
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }
}

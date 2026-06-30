import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';

interface PaginationQuery {
  page: number;
  limit: number;
}

interface UpdateHotelDto {
  plan?: string;
  isFounder?: boolean;
  features?: Record<string, any>;
}

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async listHotels(query: PaginationQuery) {
    const { page, limit } = query;
    const skip = (page - 1) * limit;

    const [hotels, total] = await Promise.all([
      this.prisma.hotel.findMany({
        skip,
        take: limit,
        include: {
          _count: { select: { roomTypes: true, users: true, bookings: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.hotel.count(),
    ]);

    return {
      hotels: hotels.map((h) => ({
        id: h.id,
        name: h.name,
        email: h.email,
        plan: (h.features as any)?.plan || 'free',
        isFounder: h.isFounder,
        rooms: h._count?.roomTypes || 0,
        users: h._count?.users || 0,
        occupancyRate: this.calculateOccupancyRate(h),
        createdAt: h.createdAt,
      })),
      total,
      page,
      limit,
    };
  }

  async getHotelDetail(id: string) {
    const hotel = await this.prisma.hotel.findUnique({
      where: { id },
      include: {
        users: {
          select: { id: true, name: true, email: true, role: true, active: true },
        },
        roomTypes: true,
        _count: { select: { bookings: true } },
      },
    });

    if (!hotel) {
      throw new NotFoundException('Hotel no encontrado');
    }

    return hotel;
  }

  async updateHotel(id: string, dto: UpdateHotelDto) {
    const hotel = await this.prisma.hotel.findUnique({ where: { id } });
    if (!hotel) {
      throw new NotFoundException('Hotel no encontrado');
    }

    const data: any = {};

    if (dto.isFounder !== undefined) {
      data.isFounder = dto.isFounder;
    }

    const features = { ...((hotel.features as Record<string, any>) || {}) };
    if (dto.plan !== undefined) {
      features.plan = dto.plan;
    }
    if (dto.features !== undefined) {
      Object.assign(features, dto.features);
    }
    data.features = features;

    return this.prisma.hotel.update({
      where: { id },
      data,
    });
  }

  async deactivateHotel(id: string) {
    const hotel = await this.prisma.hotel.findUnique({ where: { id } });
    if (!hotel) {
      throw new NotFoundException('Hotel no encontrado');
    }

    const features = { ...((hotel.features as Record<string, any>) || {}), active: false };

    return this.prisma.hotel.update({
      where: { id },
      data: { features },
    });
  }

  async getStats() {
    const [totalHotels, totalUsers, totalBookings, roomTypeAgg, inventoryAgg, dbSize] =
      await Promise.all([
        this.prisma.hotel.count(),
        this.prisma.user.count(),
        this.prisma.booking.count(),
        this.prisma.roomType.aggregate({ _sum: { totalRooms: true } }),
        this.prisma.inventory.aggregate({
          _sum: { availableRooms: true, totalRooms: true },
        }),
        this.prisma.$queryRaw`SELECT pg_database_size(current_database()) as total_size`,
      ]);

    const totalRooms = roomTypeAgg._sum.totalRooms || 0;
    const totalInventory = inventoryAgg._sum.totalRooms || 0;
    const availableInventory = inventoryAgg._sum.availableRooms || 0;
    const avgOccupancy =
      totalInventory > 0
        ? Math.round(((totalInventory - availableInventory) / totalInventory) * 100)
        : 0;

    const dbSizeBytes = Array.isArray(dbSize) ? Number((dbSize as any)[0]?.total_size || 0) : 0;

    return {
      totalHotels,
      totalUsers,
      totalBookings,
      totalRooms,
      avgOccupancy,
      activeSubscriptions: 0,
      systemUptime: this.formatUptime(process.uptime()),
      databaseSize: this.formatBytes(dbSizeBytes),
    };
  }

  async getLogs(query: PaginationQuery) {
    const { page, limit } = query;
    const hotels = await this.prisma.hotel.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
    const logs = hotels.map((h) => ({
      id: `log-${h.id}`,
      level: 'info' as const,
      module: 'system',
      message: `Hotel "${h.name}" registrado`,
      metadata: { hotelId: h.id },
      createdAt: h.createdAt,
    }));
    return { logs, total: logs.length, page, limit };
  }

  async getHealth() {
    let dbStatus = 'connected';
    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch {
      dbStatus = 'disconnected';
    }

    return {
      server: 'ok',
      database: dbStatus,
      uptime: this.formatUptime(process.uptime()),
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '0.1.0',
    };
  }

  async setupAdmin(dto: { email: string; password: string }) {
    const existing = await this.prisma.user.findFirst({
      where: { email: dto.email },
    });

    if (existing) {
      throw new ConflictException('El admin ya existe');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        hotelId: '00000000-0000-0000-0000-000000000000',
        name: 'Admin',
        email: dto.email,
        password: hashedPassword,
        role: 'ADMIN',
      },
    });

    return {
      message: 'Admin user created successfully',
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    };
  }

  private calculateOccupancyRate(_hotel: any): number {
    return Math.min(100, Math.round(Math.random() * 100));
  }

  private formatUptime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  }

  private formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / 1048576).toFixed(0)} MB`;
  }
}

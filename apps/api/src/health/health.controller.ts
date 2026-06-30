import { Controller, Get, Optional } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(@Optional() private readonly prisma?: PrismaService) {}

  @Get()
  @ApiOperation({ summary: 'Check API health status' })
  async check() {
    let dbStatus = 'disconnected';
    let redisStatus = 'disconnected';

    if (this.prisma) {
      try {
        await this.prisma.$queryRaw`SELECT 1`;
        dbStatus = 'connected';
      } catch {
        dbStatus = 'disconnected';
      }
    }

    // Redis check via Upstash REST API
    try {
      const redisUrl = process.env.UPSTASH_REDIS_URL;
      const redisToken = process.env.UPSTASH_REDIS_TOKEN;
      if (redisUrl && redisToken) {
        const res = await fetch(`${redisUrl}/ping`, {
          headers: { Authorization: `Bearer ${redisToken}` },
        });
        if (res.ok) {
          redisStatus = 'connected';
        }
      }
    } catch {
      redisStatus = 'disconnected';
    }

    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: dbStatus,
      redis: redisStatus,
      uptime: process.uptime(),
    };
  }
}

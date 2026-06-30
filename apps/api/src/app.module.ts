import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { HealthModule } from './health/health.module';
import { AuthModule } from './auth/auth.module';
import { RoomTypesModule } from './room-types/room-types.module';
import { InventoryModule } from './inventory/inventory.module';
import { RatesModule } from './rates/rates.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { HotelsModule } from './hotels/hotels.module';
import { WhatsappModule } from './whatsapp/whatsapp.module';
import { ChannelsModule } from './channels/channels.module';

@Module({
  imports: [
    PrismaModule,
    HealthModule,
    AuthModule,
    RoomTypesModule,
    InventoryModule,
    RatesModule,
    DashboardModule,
    HotelsModule,
    WhatsappModule,
    ChannelsModule,
  ],
})
export class AppModule {} /* HABIDEX DEPLOY 20260630133003 */

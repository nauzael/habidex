import { Module } from '@nestjs/common';
import { ChannelsController } from './channels.controller';
import { ChannelsService } from './channels.service';
import { CsvService } from './csv/csv.service';
import { BookingConnector } from './booking/booking.connector';
import { DespegarConnector } from './despegar/despegar.connector';

@Module({
  controllers: [ChannelsController],
  providers: [ChannelsService, CsvService, BookingConnector, DespegarConnector],
  exports: [ChannelsService, BookingConnector, DespegarConnector, CsvService],
})
export class ChannelsModule {}

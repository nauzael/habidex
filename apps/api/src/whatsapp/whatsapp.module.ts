import { Module } from '@nestjs/common';
import { WhatsappController } from './whatsapp.controller';
import { WhatsappService } from './whatsapp.service';
import { OpenwaProvider } from './openwa.provider';

@Module({
  controllers: [WhatsappController],
  providers: [WhatsappService, OpenwaProvider],
  exports: [WhatsappService, OpenwaProvider],
})
export class WhatsappModule {}

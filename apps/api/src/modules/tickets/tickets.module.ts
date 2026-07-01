import { Module } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { TicketsController } from './tickets.controller';
import { SettingsModule } from '../settings/settings.module';
import { PayoutsModule } from '../payouts/payouts.module';
import { WebsocketsModule } from '../websockets/websockets.module';

@Module({
  imports: [SettingsModule, PayoutsModule, WebsocketsModule],
  providers: [TicketsService],
  controllers: [TicketsController],
  exports: [TicketsService],
})
export class TicketsModule {}

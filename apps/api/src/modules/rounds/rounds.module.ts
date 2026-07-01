import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { RoundsService } from './rounds.service';
import { RoundsController } from './rounds.controller';
import { RoundSchedulerJob } from './round-scheduler.job';
import { DrawModule } from '../draw/draw.module';
import { WebsocketsModule } from '../websockets/websockets.module';
import { ColorsModule } from '../colors/colors.module';
import { SettingsModule } from '../settings/settings.module';

@Module({
  imports: [
    BullModule.registerQueue({ name: 'rounds' }),
    DrawModule,
    WebsocketsModule,
    ColorsModule,
    SettingsModule,
  ],
  providers: [RoundsService, RoundSchedulerJob],
  controllers: [RoundsController],
  exports: [RoundsService],
})
export class RoundsModule {}

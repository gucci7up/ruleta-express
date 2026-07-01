import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { BullModule } from '@nestjs/bull';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { BranchesModule } from './modules/branches/branches.module';
import { TerminalsModule } from './modules/terminals/terminals.module';
import { ColorsModule } from './modules/colors/colors.module';
import { PayoutsModule } from './modules/payouts/payouts.module';
import { SettingsModule } from './modules/settings/settings.module';
import { RoundsModule } from './modules/rounds/rounds.module';
import { TicketsModule } from './modules/tickets/tickets.module';
import { ReportsModule } from './modules/reports/reports.module';
import { CashModule } from './modules/cash/cash.module';
import { WebsocketsModule } from './modules/websockets/websockets.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        redis: {
          host: config.get('REDIS_HOST', 'localhost'),
          port: config.get<number>('REDIS_PORT', 6379),
          password: config.get('REDIS_PASSWORD'),
        },
      }),
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    BranchesModule,
    TerminalsModule,
    ColorsModule,
    PayoutsModule,
    SettingsModule,
    RoundsModule,
    TicketsModule,
    ReportsModule,
    CashModule,
    WebsocketsModule,
  ],
})
export class AppModule {}

import { Module } from '@nestjs/common';
import { RuletaGateway } from './ruleta.gateway';

@Module({
  providers: [RuletaGateway],
  exports: [RuletaGateway],
})
export class WebsocketsModule {}

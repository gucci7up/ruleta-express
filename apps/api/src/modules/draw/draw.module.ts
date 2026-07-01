import { Module } from '@nestjs/common';
import { CryptoDrawProvider } from './providers/crypto-draw.provider';
import { DRAW_PROVIDER } from './draw.interface';

@Module({
  providers: [
    {
      provide: DRAW_PROVIDER,
      useClass: CryptoDrawProvider,
      // Para cambiar el motor: reemplaza CryptoDrawProvider por
      // PhysicalRouletteProvider o ExternalApiProvider aquí.
    },
  ],
  exports: [DRAW_PROVIDER],
})
export class DrawModule {}

import { Injectable } from '@nestjs/common';
import { randomInt } from 'crypto';
import { DrawProvider } from '../draw.interface';

@Injectable()
export class CryptoDrawProvider implements DrawProvider {
  async draw(_roundId: number): Promise<number> {
    // crypto.randomInt es criptográficamente seguro
    // Retorna entero en [0, 19) → es decir 0-18 inclusive
    return randomInt(0, 19);
  }
}

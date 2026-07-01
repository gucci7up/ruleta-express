import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { JwtPayload } from '@ruleta/shared';
import { LoginDto } from './dto/login.dto';
import { PinLoginDto } from './dto/pin-login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user || !user.isActive) throw new UnauthorizedException('Credenciales inválidas');

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) throw new UnauthorizedException('Credenciales inválidas');

    await this.usersService.updateLastLogin(user.id);
    return this.generateTokens(user);
  }

  async loginByPin(dto: PinLoginDto) {
    const user = await this.usersService.findById(dto.userId);
    if (!user || !user.isActive || !user.pin) throw new UnauthorizedException('PIN inválido');

    const valid = await bcrypt.compare(dto.pin, user.pin);
    if (!valid) throw new UnauthorizedException('PIN inválido');

    await this.usersService.updateLastLogin(user.id);
    return this.generateTokens(user);
  }

  async refreshToken(token: string) {
    try {
      const payload = this.jwtService.verify(token, {
        secret: this.config.get('JWT_REFRESH_SECRET'),
      });
      const user = await this.usersService.findById(payload.sub);
      if (!user || !user.isActive) throw new UnauthorizedException();
      return this.generateTokens(user);
    } catch {
      throw new UnauthorizedException('Token inválido');
    }
  }

  private generateTokens(user: { id: number; email: string; role: string; branchId: number | null; terminalId: number | null }) {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role as any,
      branchId: user.branchId,
      terminalId: user.terminalId,
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.config.get('JWT_REFRESH_SECRET'),
      expiresIn: this.config.get('JWT_REFRESH_EXPIRES_IN', '7d'),
    });

    return { accessToken, refreshToken, user: { id: user.id, email: user.email, role: user.role } };
  }
}

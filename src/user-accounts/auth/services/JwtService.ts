import { Injectable, UnauthorizedException } from '@nestjs/common';
import { sign, verify } from 'jsonwebtoken';
import { TokenService, TokenPayload } from '../dto/token-service.dto';

@Injectable()
export class JwtService implements TokenService {
  private readonly accessSecret: string;
  private readonly refreshSecret: string;

  constructor() {
    this.accessSecret = process.env.JWT_ACCESS_SECRET ?? 'access-secret';
    this.refreshSecret = process.env.JWT_REFRESH_SECRET ?? 'refresh-secret';
  }

  createAccessToken(userId: string): string {
    return sign({ userId, type: 'access' }, this.accessSecret, {
      expiresIn: '5m',
    });
  }

  createRefreshToken(userId: string): string {
    return sign({ userId, type: 'refresh' }, this.refreshSecret, {
      expiresIn: '30d',
    });
  }

  verifyAccessToken(token: string): TokenPayload {
    const payload = verify(token, this.accessSecret) as TokenPayload;

    if (payload.type !== 'access') {
      throw new UnauthorizedException();
    }

    return payload;
  }

  verifyRefreshToken(token: string): TokenPayload {
    const payload = verify(token, this.refreshSecret) as TokenPayload;

    if (payload.type !== 'refresh') {
      throw new UnauthorizedException();
    }

    return payload;
  }
}

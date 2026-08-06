import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable, } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class RateLimitGuard implements CanActivate {
  private readonly attemptsByIp = new Map<string, number[]>();
  private readonly windowMs = 10_000;
  private readonly maxAttempts = 5;

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const ip =
      (request.ip ||
        (typeof request.headers['x-forwarded-for'] === 'string'
          ? (request.headers['x-forwarded-for'] as string).split(',')[0]
          : null)) ||
      'unknown';

    const now = Date.now();
    const attempts = this.attemptsByIp.get(ip) ?? [];
    const recentAttempts = attempts.filter((time) => now - time < this.windowMs);

    if (recentAttempts.length >= this.maxAttempts) {
      throw new HttpException('Too Many Requests', HttpStatus.TOO_MANY_REQUESTS);
    }

    recentAttempts.push(now);
    this.attemptsByIp.set(ip, recentAttempts);

    return true;
  }
}

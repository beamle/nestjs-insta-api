import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable, } from '@nestjs/common';
import { Request } from 'express';
import { RateLimitService } from './rate-limit.service';

@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(private readonly rateLimitService: RateLimitService) {
  }

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const ip =
      (request.ip ||
        (typeof request.headers['x-forwarded-for'] === 'string'
          ? (request.headers['x-forwarded-for'] as string).split(',')[0]
          : null)) ||
      'unknown';

    const routeKey = `${request.method}:${request.route?.path ?? request.path}:${ip}`;

    if (!this.rateLimitService.registerAttempt(routeKey, Date.now())) {
      throw new HttpException('Too Many Requests', HttpStatus.TOO_MANY_REQUESTS);
    }

    return true;
  }
}

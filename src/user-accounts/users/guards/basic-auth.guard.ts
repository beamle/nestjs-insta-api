import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class BasicAuthGuard implements CanActivate {
  private readonly expectedCredentials = Buffer.from('admin:qwerty').toString(
    'base64',
  );

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const authorization = request.headers.authorization;

    if (!authorization || !authorization.startsWith('Basic ')) {
      throw new UnauthorizedException();
    }

    const credentials = authorization.slice('Basic '.length).trim();

    if (credentials !== this.expectedCredentials) {
      throw new UnauthorizedException();
    }

    return true;
  }
}

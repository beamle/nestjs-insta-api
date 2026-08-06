import { ExecutionContext } from '@nestjs/common';
import { RateLimitGuard } from './rate-limit.guard';

describe('RateLimitGuard', () => {
  let guard: RateLimitGuard;

  beforeEach(() => {
    guard = new RateLimitGuard();
  });

  it('allows requests when under limit', () => {
    const context = {
      switchToHttp: () => ({
        getRequest: () => ({
          ip: '127.0.0.1',
          headers: {},
        }),
      }),
    } as unknown as ExecutionContext;

    expect(guard.canActivate(context)).toBe(true);
  });

  it('blocks requests after 5 attempts', () => {
    const context = {
      switchToHttp: () => ({
        getRequest: () => ({
          ip: '127.0.0.1',
          headers: {},
        }),
      }),
    } as unknown as ExecutionContext;

    for (let i = 0; i < 5; i++) {
      guard.canActivate(context);
    }

    expect(() => guard.canActivate(context)).toThrow();
  });

  it('extracts IP from x-forwarded-for header', () => {
    const context = {
      switchToHttp: () => ({
        getRequest: () => ({
          ip: undefined,
          headers: { 'x-forwarded-for': '192.168.1.1, 10.0.0.1' },
        }),
      }),
    } as unknown as ExecutionContext;

    expect(guard.canActivate(context)).toBe(true);
  });
});


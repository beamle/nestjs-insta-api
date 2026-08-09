import { Injectable } from '@nestjs/common';

@Injectable()
export class RateLimitService {
  private readonly attemptsByKey = new Map<string, number[]>();
  private readonly windowMs = 10_000;
  private readonly maxAttempts = 5;

  registerAttempt(key: string, now: number): boolean {
    const attempts = this.attemptsByKey.get(key) ?? [];
    const recentAttempts = attempts.filter((time) => now - time < this.windowMs);

    if (recentAttempts.length >= this.maxAttempts) {
      this.attemptsByKey.set(key, recentAttempts);
      return false;
    }

    recentAttempts.push(now);
    this.attemptsByKey.set(key, recentAttempts);
    return true;
  }

  clear(): void {
    this.attemptsByKey.clear();
  }
}

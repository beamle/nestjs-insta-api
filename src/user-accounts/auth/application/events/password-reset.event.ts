import { IEvent } from '@nestjs/cqrs';

export class PasswordResetEvent implements IEvent {
  constructor(
    public readonly userId: string,
    public readonly email: string,
  ) {
  }
}

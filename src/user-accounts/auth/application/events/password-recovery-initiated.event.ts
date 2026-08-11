import { IEvent } from '@nestjs/cqrs';

export class PasswordRecoveryInitiatedEvent implements IEvent {
  constructor(
    public readonly userId: string,
    public readonly email: string,
    public readonly recoveryCode: string,
  ) {
  }
}

import { IEvent } from '@nestjs/cqrs';

export class ConfirmationEmailResentEvent implements IEvent {
  constructor(
    public readonly userId: string,
    public readonly email: string,
    public readonly confirmationCode: string,
  ) {
  }
}

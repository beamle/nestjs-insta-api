import { IEvent } from '@nestjs/cqrs';

export class EmailConfirmedEvent implements IEvent {
  constructor(
    public readonly userId: string,
    public readonly email: string,
  ) {
  }
}

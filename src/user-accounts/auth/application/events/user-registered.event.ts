import { DomainEvent } from '../../../../common/cqrs';

export class UserRegisteredEvent extends DomainEvent {
  readonly type = 'UserRegisteredEvent';

  constructor(
    public readonly userId: string,
    public readonly email: string,
    public readonly confirmationCode: string,
  ) {
    super();
  }
}

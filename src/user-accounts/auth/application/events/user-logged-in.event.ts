import { DomainEvent } from '../../../../common/cqrs';

export class UserLoggedInEvent extends DomainEvent {
  readonly type = 'UserLoggedInEvent';

  constructor(
    public readonly userId: string,
    public readonly email: string,
  ) {
    super();
  }
}

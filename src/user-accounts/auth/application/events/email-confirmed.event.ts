import { DomainEvent } from '../../../../common/cqrs';

export class EmailConfirmedEvent extends DomainEvent {
  readonly type = 'EmailConfirmedEvent';

  constructor(public readonly userId: string, public readonly email: string) {
    super();
  }
}

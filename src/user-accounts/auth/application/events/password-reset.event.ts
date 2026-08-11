import { DomainEvent } from '../../../../common/cqrs';

export class PasswordResetEvent extends DomainEvent {
  readonly type = 'PasswordResetEvent';

  constructor(public readonly userId: string, public readonly email: string) {
    super();
  }
}

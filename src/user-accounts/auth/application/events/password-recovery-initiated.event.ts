import { DomainEvent } from '../../../../common/cqrs';

export class PasswordRecoveryInitiatedEvent extends DomainEvent {
  readonly type = 'PasswordRecoveryInitiatedEvent';

  constructor(
    public readonly email: string,
    public readonly recoveryCode: string,
  ) {
    super();
  }
}

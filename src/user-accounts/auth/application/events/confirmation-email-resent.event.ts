import { DomainEvent } from '../../../../common/cqrs';

export class ConfirmationEmailResentEvent extends DomainEvent {
  readonly type = 'ConfirmationEmailResentEvent';

  constructor(
    public readonly email: string,
    public readonly confirmationCode: string,
  ) {
    super();
  }
}

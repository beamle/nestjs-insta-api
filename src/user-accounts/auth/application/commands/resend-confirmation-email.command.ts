import { RegistrationEmailResendingDto } from '../../dto/registration-email-resending.dto';
import { Command } from '../../../../common/cqrs';

export class ResendConfirmationEmailCommand extends Command {
  readonly type = 'ResendConfirmationEmailCommand';

  constructor(public readonly dto: RegistrationEmailResendingDto) {
    super();
  }
}

import { RegistrationEmailResendingDto } from '../../dto/registration-email-resending.dto';
import { Command } from '../../../../common/cqrs';

export class PasswordRecoveryCommand extends Command {
  readonly type = 'PasswordRecoveryCommand';

  constructor(public readonly dto: RegistrationEmailResendingDto) {
    super();
  }
}

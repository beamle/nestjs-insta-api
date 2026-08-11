import { RegistrationConfirmationDto } from '../../dto/registration-confirmation.dto';
import { Command } from '../../../../common/cqrs';

export class ConfirmEmailCommand extends Command {
  readonly type = 'ConfirmEmailCommand';

  constructor(public readonly dto: RegistrationConfirmationDto) {
    super();
  }
}

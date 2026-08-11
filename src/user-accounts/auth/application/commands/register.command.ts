import { RegistrationUserDto } from '../../dto/registration-user.dto';
import { Command } from '../../../../common/cqrs';

export class RegisterCommand extends Command {
  readonly type = 'RegisterCommand';

  constructor(public readonly dto: RegistrationUserDto) {
    super();
  }
}

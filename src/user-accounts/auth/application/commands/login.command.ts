import { LoginDto } from '../../dto/login.dto';
import { Command } from '../../../../common/cqrs';

export class LoginCommand extends Command {
  readonly type = 'LoginCommand';

  constructor(public readonly dto: LoginDto) {
    super();
  }
}

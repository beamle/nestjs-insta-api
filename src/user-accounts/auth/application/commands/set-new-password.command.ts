import { NewPasswordDto } from '../../dto/new-password.dto';
import { Command } from '../../../../common/cqrs';

export class SetNewPasswordCommand extends Command {
  readonly type = 'SetNewPasswordCommand';

  constructor(public readonly dto: NewPasswordDto) {
    super();
  }
}

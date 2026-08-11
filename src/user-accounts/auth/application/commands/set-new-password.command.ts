import { NewPasswordDto } from '../../dto/new-password.dto';

export class SetNewPasswordCommand {
  constructor(public readonly dto: NewPasswordDto) {
  }
}

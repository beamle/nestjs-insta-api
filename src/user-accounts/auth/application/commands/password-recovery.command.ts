import { RegistrationEmailResendingDto } from '../../dto/registration-email-resending.dto';

export class PasswordRecoveryCommand {
  constructor(public readonly dto: RegistrationEmailResendingDto) {
  }
}

import { RegistrationEmailResendingDto } from '../../dto/registration-email-resending.dto';

export class ResendConfirmationEmailCommand {
  constructor(public readonly dto: RegistrationEmailResendingDto) {
  }
}

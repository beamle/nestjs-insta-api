import { RegistrationConfirmationDto } from '../../dto/registration-confirmation.dto';

export class ConfirmEmailCommand {
  constructor(public readonly dto: RegistrationConfirmationDto) {
  }
}

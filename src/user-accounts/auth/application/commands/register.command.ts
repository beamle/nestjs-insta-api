import { RegistrationUserDto } from '../../dto/registration-user.dto';

export class RegisterCommand {
  constructor(public readonly dto: RegistrationUserDto) {
  }
}

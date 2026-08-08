import { BadRequestException, Injectable } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { UsersRepository } from '../users/users.repository';
import { RegistrationUserDto } from './dto/registration-user.dto';
import { RegistrationEmailService } from './email/registration-email.service';

type ValidationError = { message: string; field: string };

@Injectable()
export class AuthService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly registrationEmailService: RegistrationEmailService,
  ) {
  }

  async register(dto: RegistrationUserDto) {
    const [loginUser, emailUser] = await Promise.all([
      this.usersRepository.findByLogin(dto.login),
      this.usersRepository.findByEmail(dto.email),
    ]);

    const errors: ValidationError[] = [];
    if (loginUser) {
      errors.push({ field: 'login', message: 'login already exists' });
    }
    if (emailUser) {
      errors.push({ field: 'email', message: 'email already exists' });
    }

    if (errors.length > 0) {
      throw new BadRequestException({ errorsMessages: errors });
    }

    const confirmationCode = this.generateConfirmationCode();
    const confirmationCodeExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await this.usersRepository.create({
      ...dto,
      isEmailConfirmed: false,
      confirmationCode,
      confirmationCodeExpiresAt,
    });

    await this.registrationEmailService.sendConfirmationCode(
      dto.email,
      confirmationCode,
    );
  }

  private generateConfirmationCode() {
    return randomBytes(6).toString('hex').toUpperCase();
  }
}

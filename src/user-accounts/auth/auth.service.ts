import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { sign } from 'jsonwebtoken';
import { UsersRepository } from '../users/users.repository';
import { RegistrationUserDto } from './dto/registration-user.dto';
import { RegistrationEmailService } from './email/registration-email.service';
import { RegistrationConfirmationDto } from './dto/registration-confirmation.dto';
import { RegistrationEmailResendingDto } from './dto/registration-email-resending.dto';
import { LoginDto } from './dto/login.dto';

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

  async confirmRegistration(dto: RegistrationConfirmationDto) {
    const user = await this.usersRepository.findByConfirmationCode(
      dto.confirmationCode,
    );

    if (
      !user ||
      user.isEmailConfirmed ||
      !user.confirmationCodeExpiresAt ||
      user.confirmationCodeExpiresAt.getTime() < Date.now()
    ) {
      throw new BadRequestException({
        errorsMessages: [
          {
            field: 'confirmationCode',
            message: 'confirmation code is invalid, expired, or already used',
          },
        ],
      });
    }

    await this.usersRepository.confirmEmail(user._id.toString());
  }

  async resendConfirmationEmail(dto: RegistrationEmailResendingDto) {
    const user = await this.usersRepository.findByEmail(dto.email);

    if (!user || user.isEmailConfirmed) {
      throw new BadRequestException({
        errorsMessages: [
          {
            field: 'email',
            message: 'email is invalid or already confirmed',
          },
        ],
      });
    }

    const confirmationCode = this.generateConfirmationCode();
    const confirmationCodeExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await this.usersRepository.updateConfirmationCode(
      dto.email,
      confirmationCode,
      confirmationCodeExpiresAt,
    );

    await this.registrationEmailService.sendConfirmationCode(
      dto.email,
      confirmationCode,
    );
  }

  async login(dto: LoginDto) {
    const user = await this.usersRepository.findByLoginOrEmail(dto.loginOrEmail);

    if (!user || user.password !== dto.password) {
      throw new UnauthorizedException();
    }

    const accessToken = sign(
      { userId: user._id.toString() },
      process.env.JWT_SECRET ?? 'secret',
      { expiresIn: '5m' },
    );

    return { accessToken };
  }

  async passwordRecovery(dto: RegistrationEmailResendingDto) {
    const user = await this.usersRepository.findByEmail(dto.email);

    if (!user) {
      return;
    }

    const passwordRecoveryCode = this.generateConfirmationCode();
    const passwordRecoveryCodeExpiresAt = new Date(
      Date.now() + 24 * 60 * 60 * 1000,
    );

    await this.usersRepository.updatePasswordRecoveryCode(
      dto.email,
      passwordRecoveryCode,
      passwordRecoveryCodeExpiresAt,
    );

    await this.registrationEmailService.sendPasswordRecoveryCode(
      dto.email,
      passwordRecoveryCode,
    );
  }

  private generateConfirmationCode() {
    return randomBytes(6).toString('hex').toUpperCase();
  }
}

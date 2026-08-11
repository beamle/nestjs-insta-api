import { BadRequestException } from '@nestjs/common';
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { RegisterCommand } from '../commands/register.command';
import { UsersRepository } from '../../../users/users.repository';
import { RegistrationEmailService } from '../../email/registration-email.service';
import { UserRegisteredEvent } from '../events';
import { randomBytes } from 'crypto';

type ValidationError = { message: string; field: string };

@CommandHandler(RegisterCommand)
export class RegisterCommandHandler implements ICommandHandler<RegisterCommand> {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly registrationEmailService: RegistrationEmailService,
    private readonly eventBus: EventBus,
  ) {
  }

  async execute(command: RegisterCommand): Promise<void> {
    const dto = command.dto;
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

    const user = await this.usersRepository.create({
      ...dto,
      isEmailConfirmed: false,
      confirmationCode,
      confirmationCodeExpiresAt,
    });

    await this.registrationEmailService.sendConfirmationCode(
      dto.email,
      confirmationCode,
    );

    await this.eventBus.publish(
      new UserRegisteredEvent(
        user._id.toString(),
        dto.email,
        confirmationCode,
      ),
    );
  }

  private generateConfirmationCode() {
    return randomBytes(6).toString('hex').toUpperCase();
  }
}

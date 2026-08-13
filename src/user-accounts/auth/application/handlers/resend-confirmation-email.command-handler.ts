import { BadRequestException } from '@nestjs/common';
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { ResendConfirmationEmailCommand } from '../commands/resend-confirmation-email.command';
import { UsersRepository } from '../../../users/users.repository';
import { RegistrationEmailService } from '../../email/registration-email.service';
import { randomBytes } from 'crypto';

@CommandHandler(ResendConfirmationEmailCommand)
export class ResendConfirmationEmailCommandHandler implements ICommandHandler<ResendConfirmationEmailCommand> {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly registrationEmailService: RegistrationEmailService,
    private readonly eventBus: EventBus,
  ) {
  }

  async execute(command: ResendConfirmationEmailCommand): Promise<void> {
    const user = await this.usersRepository.findByEmail(command.dto.email);

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
      command.dto.email,
      confirmationCode,
      confirmationCodeExpiresAt,
    );

    await this.registrationEmailService.sendConfirmationCode(
      command.dto.email,
      confirmationCode,
    );
  }

  private generateConfirmationCode() {
    return randomBytes(6).toString('hex').toUpperCase();
  }
}

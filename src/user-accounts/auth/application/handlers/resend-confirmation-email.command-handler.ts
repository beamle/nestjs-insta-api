import { BadRequestException, Injectable } from '@nestjs/common';
import { CommandHandler, EventBus } from '../../../../common/cqrs';
import { ResendConfirmationEmailCommand } from '../commands/resend-confirmation-email.command';
import { UsersRepository } from '../../../users/users.repository';
import { RegistrationEmailService } from '../../email/registration-email.service';
import { ConfirmationEmailResentEvent } from '../events';
import { randomBytes } from 'crypto';

@Injectable()
export class ResendConfirmationEmailCommandHandler implements CommandHandler<ResendConfirmationEmailCommand, void> {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly registrationEmailService: RegistrationEmailService,
    private readonly eventBus: EventBus,
  ) {
  }

  async handle(command: ResendConfirmationEmailCommand): Promise<void> {
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

    await this.eventBus.publish(
      new ConfirmationEmailResentEvent(command.dto.email, confirmationCode),
    );
  }

  private generateConfirmationCode() {
    return randomBytes(6).toString('hex').toUpperCase();
  }
}

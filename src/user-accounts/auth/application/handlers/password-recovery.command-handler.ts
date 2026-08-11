import { Injectable } from '@nestjs/common';
import { CommandHandler, EventBus } from '../../../../common/cqrs';
import { PasswordRecoveryCommand } from '../commands/password-recovery.command';
import { UsersRepository } from '../../../users/users.repository';
import { RegistrationEmailService } from '../../email/registration-email.service';
import { PasswordRecoveryInitiatedEvent } from '../events';
import { randomBytes } from 'crypto';

@Injectable()
export class PasswordRecoveryCommandHandler implements CommandHandler<PasswordRecoveryCommand, void> {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly registrationEmailService: RegistrationEmailService,
    private readonly eventBus: EventBus,
  ) {
  }

  async handle(command: PasswordRecoveryCommand): Promise<void> {
    const user = await this.usersRepository.findByEmail(command.dto.email);

    if (!user) {
      return;
    }

    const passwordRecoveryCode = this.generateConfirmationCode();
    const passwordRecoveryCodeExpiresAt = new Date(
      Date.now() + 24 * 60 * 60 * 1000,
    );

    await this.usersRepository.updatePasswordRecoveryCode(
      command.dto.email,
      passwordRecoveryCode,
      passwordRecoveryCodeExpiresAt,
    );

    await this.registrationEmailService.sendPasswordRecoveryCode(
      command.dto.email,
      passwordRecoveryCode,
    );

    await this.eventBus.publish(
      new PasswordRecoveryInitiatedEvent(command.dto.email, passwordRecoveryCode),
    );
  }

  private generateConfirmationCode() {
    return randomBytes(6).toString('hex').toUpperCase();
  }
}

import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { PasswordRecoveryCommand } from '../commands/password-recovery.command';
import { UsersRepository } from '../../../users/users.repository';
import { RegistrationEmailService } from '../../email/registration-email.service';
import { PasswordRecoveryInitiatedEvent } from '../events';
import { randomBytes } from 'crypto';

@CommandHandler(PasswordRecoveryCommand)
export class PasswordRecoveryCommandHandler implements ICommandHandler<PasswordRecoveryCommand> {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly registrationEmailService: RegistrationEmailService,
    private readonly eventBus: EventBus,
  ) {
  }

  async execute(command: PasswordRecoveryCommand): Promise<void> {
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
      new PasswordRecoveryInitiatedEvent(
        user._id.toString(),
        command.dto.email,
        passwordRecoveryCode,
      ),
    );
  }

  private generateConfirmationCode() {
    return randomBytes(6).toString('hex').toUpperCase();
  }
}

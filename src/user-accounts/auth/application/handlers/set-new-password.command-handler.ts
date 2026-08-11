import { BadRequestException } from '@nestjs/common';
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { SetNewPasswordCommand } from '../commands/set-new-password.command';
import { UsersRepository } from '../../../users/users.repository';
import { PasswordResetEvent } from '../events';

@CommandHandler(SetNewPasswordCommand)
export class SetNewPasswordCommandHandler implements ICommandHandler<SetNewPasswordCommand> {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly eventBus: EventBus,
  ) {
  }

  async execute(command: SetNewPasswordCommand): Promise<void> {
    const user = await this.usersRepository.findByPasswordRecoveryCode(
      command.dto.recoveryCode,
    );

    if (
      !user ||
      !user.passwordRecoveryCodeExpiresAt ||
      user.passwordRecoveryCodeExpiresAt.getTime() < Date.now()
    ) {
      throw new BadRequestException({
        errorsMessages: [
          {
            field: 'recoveryCode',
            message: 'recovery code is invalid or expired',
          },
        ],
      });
    }

    await this.usersRepository.updatePasswordWithRecoveryCode(
      user._id.toString(),
      command.dto.newPassword,
    );

    await this.eventBus.publish(
      new PasswordResetEvent(user._id.toString(), user.email),
    );
  }
}

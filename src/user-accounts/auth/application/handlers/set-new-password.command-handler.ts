import { BadRequestException, Injectable } from '@nestjs/common';
import { CommandHandler, EventBus } from '../../../../common/cqrs';
import { SetNewPasswordCommand } from '../commands/set-new-password.command';
import { UsersRepository } from '../../../users/users.repository';
import { PasswordResetEvent } from '../events';

@Injectable()
export class SetNewPasswordCommandHandler implements CommandHandler<SetNewPasswordCommand, void> {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly eventBus: EventBus,
  ) {
  }

  async handle(command: SetNewPasswordCommand): Promise<void> {
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

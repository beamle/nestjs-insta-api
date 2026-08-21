import { BadRequestException } from '@nestjs/common';
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { ConfirmEmailCommand } from '../commands/confirm-email.command';
import { UsersRepository } from '../../../users/users.repository';

@CommandHandler(ConfirmEmailCommand)
export class ConfirmEmailCommandHandler implements ICommandHandler<ConfirmEmailCommand> {
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute(command: ConfirmEmailCommand): Promise<void> {
    const user = await this.usersRepository.findByConfirmationCode(
      command.dto.code,
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
            field: 'code',
            message: 'confirmation code is invalid, expired, or already used',
          },
        ],
      });
    }

    await this.usersRepository.confirmEmail(user._id.toString());
  }
}

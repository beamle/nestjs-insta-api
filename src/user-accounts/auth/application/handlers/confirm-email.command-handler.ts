import { BadRequestException, Injectable } from '@nestjs/common';
import { CommandHandler, EventBus } from '../../../../common/cqrs';
import { ConfirmEmailCommand } from '../commands/confirm-email.command';
import { UsersRepository } from '../../../users/users.repository';
import { EmailConfirmedEvent } from '../events';

@Injectable()
export class ConfirmEmailCommandHandler implements CommandHandler<ConfirmEmailCommand, void> {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly eventBus: EventBus,
  ) {
  }

  async handle(command: ConfirmEmailCommand): Promise<void> {
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

    await this.eventBus.publish(
      new EmailConfirmedEvent(user._id.toString(), user.email),
    );
  }
}

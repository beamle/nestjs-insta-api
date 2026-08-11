import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CommandHandler, EventBus } from '../../../../common/cqrs';
import { LoginCommand } from '../commands/login.command';
import { UsersRepository } from '../../../users/users.repository';
import { sign } from 'jsonwebtoken';
import { UserLoggedInEvent } from '../events';

@Injectable()
export class LoginCommandHandler implements CommandHandler<LoginCommand, { accessToken: string }> {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly eventBus: EventBus,
  ) {
  }

  async handle(command: LoginCommand): Promise<{ accessToken: string }> {
    const user = await this.usersRepository.findByLoginOrEmail(
      command.dto.loginOrEmail,
    );

    if (!user || user.password !== command.dto.password) {
      throw new UnauthorizedException();
    }

    const accessToken = sign(
      { userId: user._id.toString() },
      process.env.JWT_SECRET ?? 'secret',
      { expiresIn: '5m' },
    );

    await this.eventBus.publish(
      new UserLoggedInEvent(user._id.toString(), user.email),
    );

    return { accessToken };
  }
}

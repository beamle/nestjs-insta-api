import { UnauthorizedException } from '@nestjs/common';
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { LoginCommand } from '../commands/login.command';
import { UsersRepository } from '../../../users/users.repository';
import { sign } from 'jsonwebtoken';

@CommandHandler(LoginCommand)
export class LoginCommandHandler implements ICommandHandler<LoginCommand, { accessToken: string }> {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly eventBus: EventBus,
  ) {
  }

  async execute(command: LoginCommand): Promise<{ accessToken: string }> {
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

    return { accessToken };
  }
}

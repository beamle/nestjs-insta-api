import { UnauthorizedException } from '@nestjs/common';
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { LoginCommand } from '../commands/login.command';
import { UsersRepository } from '../../../users/users.repository';
import { JwtService } from '../../services/JwtService';

@CommandHandler(LoginCommand)
export class LoginCommandHandler implements ICommandHandler<
  LoginCommand,
  { accessToken: string; refreshToken: string }
> {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly jwtService: JwtService,
  ) {}

  async execute(
    command: LoginCommand,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const user = await this.usersRepository.findByLoginOrEmail(
      command.dto.loginOrEmail,
    );

    if (!user || user.password !== command.dto.password) {
      throw new UnauthorizedException();
    }

    const accessToken = this.jwtService.createAccessToken(user._id.toString());
    const refreshToken = this.jwtService.createRefreshToken(
      user._id.toString(),
    );

    return {
      accessToken,
      refreshToken,
    };
  }
}

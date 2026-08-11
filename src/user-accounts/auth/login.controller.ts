import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { LoginDto } from './dto/login.dto';
import { LoginValidationPipe } from './pipes/login-validation.pipe';
import { LoginCommand } from './application/commands';

@Controller('auth')
export class LoginController {
  constructor(private readonly commandBus: CommandBus) {
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body(new LoginValidationPipe()) dto: LoginDto,
  ): Promise<{ accessToken: string }> {
    return this.commandBus.execute(new LoginCommand(dto));
  }
}

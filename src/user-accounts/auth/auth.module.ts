import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { LoginController } from './login.controller';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { RegistrationEmailService } from './email/registration-email.service';
import { RateLimitGuard } from './guards/rate-limit.guard';
import { RateLimitService } from './guards/rate-limit.service';
import { CommandBus, EventBus } from '../../common/cqrs';
import {
  ConfirmEmailCommandHandler,
  LoginCommandHandler,
  PasswordRecoveryCommandHandler,
  RegisterCommandHandler,
  ResendConfirmationEmailCommandHandler,
  SetNewPasswordCommandHandler,
} from './application/handlers';

@Module({
  imports: [UsersModule],
  controllers: [AuthController, LoginController],
  providers: [
    AuthService,
    RegistrationEmailService,
    RateLimitGuard,
    RateLimitService,
    CommandBus,
    EventBus,
    RegisterCommandHandler,
    ConfirmEmailCommandHandler,
    ResendConfirmationEmailCommandHandler,
    LoginCommandHandler,
    PasswordRecoveryCommandHandler,
    SetNewPasswordCommandHandler,
  ],
  exports: [RateLimitService, CommandBus, EventBus],
})
export class AuthModule {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly registerHandler: RegisterCommandHandler,
    private readonly confirmHandler: ConfirmEmailCommandHandler,
    private readonly resendHandler: ResendConfirmationEmailCommandHandler,
    private readonly loginHandler: LoginCommandHandler,
    private readonly recoveryHandler: PasswordRecoveryCommandHandler,
    private readonly setPasswordHandler: SetNewPasswordCommandHandler,
  ) {
    this.commandBus.register(registerHandler, 'RegisterCommand');
    this.commandBus.register(confirmHandler, 'ConfirmEmailCommand');
    this.commandBus.register(resendHandler, 'ResendConfirmationEmailCommand');
    this.commandBus.register(loginHandler, 'LoginCommand');
    this.commandBus.register(recoveryHandler, 'PasswordRecoveryCommand');
    this.commandBus.register(setPasswordHandler, 'SetNewPasswordCommand');
  }
}

import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { AuthController } from './auth.controller';
import { LoginController } from './login.controller';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { RegistrationEmailService } from './email/registration-email.service';
import { RateLimitGuard } from './guards/rate-limit.guard';
import { RateLimitService } from './guards/rate-limit.service';
import { JwtService } from './services/JwtService';
import {
  ConfirmEmailCommandHandler,
  LoginCommandHandler,
  PasswordRecoveryCommandHandler,
  RegisterCommandHandler,
  ResendConfirmationEmailCommandHandler,
  SetNewPasswordCommandHandler,
} from './application/handlers';

const HANDLERS = [
  RegisterCommandHandler,
  ConfirmEmailCommandHandler,
  ResendConfirmationEmailCommandHandler,
  LoginCommandHandler,
  PasswordRecoveryCommandHandler,
  SetNewPasswordCommandHandler,
];

@Module({
  imports: [UsersModule, CqrsModule],
  controllers: [AuthController, LoginController],
  providers: [
    AuthService,
    JwtService,
    RegistrationEmailService,
    RateLimitGuard,
    RateLimitService,
    ...HANDLERS,
  ],
  exports: [RateLimitService],
})
export class AuthModule {}

import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { LoginController } from './login.controller';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { RegistrationEmailService } from './email/registration-email.service';
import { RateLimitGuard } from './guards/rate-limit.guard';
import { RateLimitService } from './guards/rate-limit.service';

@Module({
  imports: [UsersModule],
  controllers: [AuthController, LoginController],
  providers: [AuthService, RegistrationEmailService, RateLimitGuard, RateLimitService],
  exports: [RateLimitService],
})
export class AuthModule {
}

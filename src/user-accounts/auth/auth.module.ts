import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { LoginController } from './login.controller';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { RegistrationEmailService } from './email/registration-email.service';

@Module({
  imports: [UsersModule],
  controllers: [AuthController, LoginController],
  providers: [AuthService, RegistrationEmailService],
})
export class AuthModule {
}

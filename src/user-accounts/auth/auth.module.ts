import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { RegistrationEmailService } from './email/registration-email.service';

@Module({
  imports: [UsersModule],
  controllers: [AuthController],
  providers: [AuthService, RegistrationEmailService],
})
export class AuthModule {
}

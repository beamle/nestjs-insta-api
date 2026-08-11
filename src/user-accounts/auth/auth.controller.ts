import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { RegistrationUserDto } from './dto/registration-user.dto';
import { RegistrationConfirmationDto } from './dto/registration-confirmation.dto';
import { RegistrationEmailResendingDto } from './dto/registration-email-resending.dto';
import { NewPasswordDto } from './dto/new-password.dto';
import { RateLimitGuard } from './guards/rate-limit.guard';
import { NewPasswordValidationPipe } from './pipes/new-password-validation.pipe';
import { RegistrationEmailResendingValidationPipe } from './pipes/registration-email-resending-validation.pipe';
import { RegistrationConfirmationValidationPipe } from './pipes/registration-confirmation-validation.pipe';
import { RegistrationValidationPipe } from './pipes/registration-validation.pipe';
import {
  ConfirmEmailCommand,
  PasswordRecoveryCommand,
  RegisterCommand,
  ResendConfirmationEmailCommand,
  SetNewPasswordCommand,
} from './application/commands';

@Controller('auth')
export class AuthController {
  constructor(private readonly commandBus: CommandBus) {
  }

  @Post('registration')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(RateLimitGuard)
  async register(
    @Body(new RegistrationValidationPipe()) dto: RegistrationUserDto,
  ): Promise<void> {
    await this.commandBus.execute(new RegisterCommand(dto));
  }

  @Post('registration-confirmation')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(RateLimitGuard)
  async confirmRegistration(
    @Body(new RegistrationConfirmationValidationPipe())
    dto: RegistrationConfirmationDto,
  ): Promise<void> {
    await this.commandBus.execute(new ConfirmEmailCommand(dto));
  }

  @Post('registration-email-resending')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(RateLimitGuard)
  async resendRegistrationEmail(
    @Body(new RegistrationEmailResendingValidationPipe())
    dto: RegistrationEmailResendingDto,
  ): Promise<void> {
    await this.commandBus.execute(new ResendConfirmationEmailCommand(dto));
  }

  @Post('password-recovery')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(RateLimitGuard)
  async passwordRecovery(
    @Body(new RegistrationEmailResendingValidationPipe())
    dto: RegistrationEmailResendingDto,
  ): Promise<void> {
    await this.commandBus.execute(new PasswordRecoveryCommand(dto));
  }

  @Post('new-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(RateLimitGuard)
  async newPassword(
    @Body(new NewPasswordValidationPipe()) dto: NewPasswordDto,
  ): Promise<void> {
    await this.commandBus.execute(new SetNewPasswordCommand(dto));
  }
}

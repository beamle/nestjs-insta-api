import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegistrationUserDto } from './dto/registration-user.dto';
import { RegistrationConfirmationDto } from './dto/registration-confirmation.dto';
import { RegistrationEmailResendingDto } from './dto/registration-email-resending.dto';
import { NewPasswordDto } from './dto/new-password.dto';
import { RateLimitGuard } from './guards/rate-limit.guard';
import { NewPasswordValidationPipe } from './pipes/new-password-validation.pipe';
import { RegistrationEmailResendingValidationPipe } from './pipes/registration-email-resending-validation.pipe';
import { RegistrationConfirmationValidationPipe } from './pipes/registration-confirmation-validation.pipe';
import { RegistrationValidationPipe } from './pipes/registration-validation.pipe';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {
  }

  @Post('registration')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(RateLimitGuard)
  async register(
    @Body(new RegistrationValidationPipe()) dto: RegistrationUserDto,
  ): Promise<void> {
    await this.authService.register(dto);
  }

  @Post('registration-confirmation')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(RateLimitGuard)
  async confirmRegistration(
    @Body(new RegistrationConfirmationValidationPipe())
    dto: RegistrationConfirmationDto,
  ): Promise<void> {
    await this.authService.confirmRegistration(dto);
  }

  @Post('registration-email-resending')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(RateLimitGuard)
  async resendRegistrationEmail(
    @Body(new RegistrationEmailResendingValidationPipe())
    dto: RegistrationEmailResendingDto,
  ): Promise<void> {
    await this.authService.resendConfirmationEmail(dto);
  }

  @Post('password-recovery')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(RateLimitGuard)
  async passwordRecovery(
    @Body(new RegistrationEmailResendingValidationPipe())
    dto: RegistrationEmailResendingDto,
  ): Promise<void> {
    await this.authService.passwordRecovery(dto);
  }

  @Post('new-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(RateLimitGuard)
  async newPassword(
    @Body(new NewPasswordValidationPipe()) dto: NewPasswordDto,
  ): Promise<void> {
    await this.authService.setNewPassword(dto);
  }
}

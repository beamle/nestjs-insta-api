import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegistrationUserDto } from './dto/registration-user.dto';
import { RegistrationConfirmationDto } from './dto/registration-confirmation.dto';
import { RateLimitGuard } from './guards/rate-limit.guard';
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
}

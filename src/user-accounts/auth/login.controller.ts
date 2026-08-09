import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { LoginValidationPipe } from './pipes/login-validation.pipe';

@Controller('auth')
export class LoginController {
  constructor(private readonly authService: AuthService) {
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body(new LoginValidationPipe()) dto: LoginDto,
  ): Promise<{ accessToken: string }> {
    return this.authService.login(dto);
  }
}

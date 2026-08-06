import { BadRequestException, Injectable } from '@nestjs/common';
import { UsersRepository } from '../users/users.repository';
import { RegistrationUserDto } from './dto/registration-user.dto';

type ValidationError = { message: string; field: string };

@Injectable()
export class AuthService {
  constructor(private readonly usersRepository: UsersRepository) {
  }

  async register(dto: RegistrationUserDto) {
    const [loginUser, emailUser] = await Promise.all([
      this.usersRepository.findByLogin(dto.login),
      this.usersRepository.findByEmail(dto.email),
    ]);

    const errors: ValidationError[] = [];
    if (loginUser) {
      errors.push({ field: 'login', message: 'login already exists' });
    }
    if (emailUser) {
      errors.push({ field: 'email', message: 'email already exists' });
    }

    if (errors.length > 0) {
      throw new BadRequestException({ errorsMessages: errors });
    }

    await this.usersRepository.create(dto);
  }
}

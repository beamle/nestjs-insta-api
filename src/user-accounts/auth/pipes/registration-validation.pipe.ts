import { BadRequestException, Injectable, PipeTransform, } from '@nestjs/common';
import { RegistrationUserDto } from '../dto/registration-user.dto';

type ValidationError = { message: string; field: string };

@Injectable()
export class RegistrationValidationPipe implements PipeTransform {
  transform(value: unknown): RegistrationUserDto {
    const dto = value as Record<string, unknown>;
    const errors: ValidationError[] = [];

    if (
      typeof dto.login !== 'string' ||
      dto.login.length < 3 ||
      dto.login.length > 10
    ) {
      errors.push({ field: 'login', message: 'login length must be 3-10' });
    }

    if (
      typeof dto.password !== 'string' ||
      dto.password.length < 6 ||
      dto.password.length > 20
    ) {
      errors.push({
        field: 'password',
        message: 'password length must be 6-20',
      });
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (typeof dto.email !== 'string' || !emailPattern.test(dto.email)) {
      errors.push({ field: 'email', message: 'email must be valid' });
    }

    if (errors.length > 0) {
      throw new BadRequestException({ errorsMessages: errors });
    }

    return {
      login: dto.login as string,
      password: dto.password as string,
      email: dto.email as string,
    };
  }
}

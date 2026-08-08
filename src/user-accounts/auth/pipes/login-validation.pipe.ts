import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { LoginDto } from '../dto/login.dto';

type ValidationError = { message: string; field: string };

@Injectable()
export class LoginValidationPipe implements PipeTransform {
  transform(value: unknown): LoginDto {
    const dto = value as Record<string, unknown>;
    const errors: ValidationError[] = [];

    if (
      typeof dto.loginOrEmail !== 'string' ||
      dto.loginOrEmail.trim().length === 0
    ) {
      errors.push({
        field: 'loginOrEmail',
        message: 'loginOrEmail must be a non-empty string',
      });
    }

    if (typeof dto.password !== 'string' || dto.password.trim().length === 0) {
      errors.push({
        field: 'password',
        message: 'password must be a non-empty string',
      });
    }

    if (errors.length > 0) {
      throw new BadRequestException({ errorsMessages: errors });
    }

    return {
      loginOrEmail: dto.loginOrEmail as string,
      password: dto.password as string,
    };
  }
}

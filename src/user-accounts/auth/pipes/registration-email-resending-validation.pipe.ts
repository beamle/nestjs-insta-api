import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { RegistrationEmailResendingDto } from '../dto/registration-email-resending.dto';

type ValidationError = { message: string; field: string };

@Injectable()
export class RegistrationEmailResendingValidationPipe implements PipeTransform {
  transform(value: unknown): RegistrationEmailResendingDto {
    const dto = value as Record<string, unknown>;
    const errors: ValidationError[] = [];

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (typeof dto.email !== 'string' || !emailPattern.test(dto.email)) {
      errors.push({ field: 'email', message: 'email must be valid' });
    }

    if (errors.length > 0) {
      throw new BadRequestException({ errorsMessages: errors });
    }

    return {
      email: dto.email as string,
    };
  }
}

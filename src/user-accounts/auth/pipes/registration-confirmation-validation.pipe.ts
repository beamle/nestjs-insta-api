import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { RegistrationConfirmationDto } from '../dto/registration-confirmation.dto';

type ValidationError = { message: string; field: string };

@Injectable()
export class RegistrationConfirmationValidationPipe implements PipeTransform {
  transform(value: unknown): RegistrationConfirmationDto {
    const dto = value as Record<string, unknown>;
    const errors: ValidationError[] = [];

    if (typeof dto.code !== 'string' || dto.code.length === 0) {
      errors.push({
        field: 'code',
        message: 'code must be a non-empty string',
      });
    }

    if (errors.length > 0) {
      throw new BadRequestException({ errorsMessages: errors });
    }

    return {
      code: dto.code as string,
    };
  }
}

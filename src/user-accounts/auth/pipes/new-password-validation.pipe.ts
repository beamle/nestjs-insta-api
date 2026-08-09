import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { NewPasswordDto } from '../dto/new-password.dto';

type ValidationError = { message: string; field: string };

@Injectable()
export class NewPasswordValidationPipe implements PipeTransform {
  transform(value: unknown): NewPasswordDto {
    const dto = value as Record<string, unknown>;
    const errors: ValidationError[] = [];

    if (
      typeof dto.newPassword !== 'string' ||
      dto.newPassword.length < 6 ||
      dto.newPassword.length > 20
    ) {
      errors.push({
        field: 'newPassword',
        message: 'newPassword length must be 6-20',
      });
    }

    if (
      typeof dto.recoveryCode !== 'string' ||
      dto.recoveryCode.trim().length === 0
    ) {
      errors.push({
        field: 'recoveryCode',
        message: 'recoveryCode must be a non-empty string',
      });
    }

    if (errors.length > 0) {
      throw new BadRequestException({ errorsMessages: errors });
    }

    return {
      newPassword: dto.newPassword as string,
      recoveryCode: dto.recoveryCode as string,
    };
  }
}

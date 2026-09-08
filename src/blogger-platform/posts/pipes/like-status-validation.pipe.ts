import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { LikeStatusDto } from '../dto/like-status.dto';

type ValidationError = { message: string; field: string };

const ALLOWED_LIKE_STATUS = new Set(['Like', 'Dislike', 'None']);

@Injectable()
export class LikeStatusValidationPipe implements PipeTransform {
  transform(value: unknown): LikeStatusDto {
    const dto = value as Record<string, unknown>;
    const errors: ValidationError[] = [];

    if (
      typeof dto.likeStatus !== 'string' ||
      !ALLOWED_LIKE_STATUS.has(dto.likeStatus)
    ) {
      errors.push({
        field: 'likeStatus',
        message: 'likeStatus must be one of Like, Dislike, None',
      });
    }

    if (errors.length > 0) {
      throw new BadRequestException({ errorsMessages: errors });
    }

    return {
      likeStatus: dto.likeStatus as LikeStatusDto['likeStatus'],
    };
  }
}

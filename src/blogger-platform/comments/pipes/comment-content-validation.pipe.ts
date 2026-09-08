import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { CreateCommentDto } from '../dto/create-comment.dto';

type ValidationError = { message: string; field: string };

@Injectable()
export class CommentContentValidationPipe implements PipeTransform {
  transform(value: unknown): CreateCommentDto {
    const dto = value as Record<string, unknown>;
    const errors: ValidationError[] = [];

    if (
      typeof dto.content !== 'string' ||
      dto.content.trim().length < 20 ||
      dto.content.length > 300
    ) {
      errors.push({
        field: 'content',
        message: 'content must be from 20 to 300 characters',
      });
    }

    if (errors.length > 0) {
      throw new BadRequestException({ errorsMessages: errors });
    }

    return { content: dto.content as string };
  }
}

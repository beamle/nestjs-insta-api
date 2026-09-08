import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { UpdatePostDto } from '../dto/update-post.dto';

type ValidationError = { message: string; field: string };

@Injectable()
export class UpdatePostValidationPipe implements PipeTransform {
  transform(value: unknown): UpdatePostDto {
    const dto = value as Record<string, unknown>;
    const errors: ValidationError[] = [];

    if (
      typeof dto.title !== 'string' ||
      dto.title.trim().length < 1 ||
      dto.title.length > 30
    ) {
      errors.push({
        field: 'title',
        message: 'title must be from 1 to 30 characters',
      });
    }

    if (
      typeof dto.shortDescription !== 'string' ||
      dto.shortDescription.trim().length < 1 ||
      dto.shortDescription.length > 100
    ) {
      errors.push({
        field: 'shortDescription',
        message: 'shortDescription must be from 1 to 100 characters',
      });
    }

    if (
      typeof dto.content !== 'string' ||
      dto.content.trim().length < 1 ||
      dto.content.length > 1000
    ) {
      errors.push({
        field: 'content',
        message: 'content must be from 1 to 1000 characters',
      });
    }

    if (typeof dto.blogId !== 'string' || dto.blogId.trim().length < 1) {
      errors.push({
        field: 'blogId',
        message: 'blogId must be a non-empty string',
      });
    }

    if (errors.length > 0) {
      throw new BadRequestException({ errorsMessages: errors });
    }

    return {
      title: dto.title as string,
      shortDescription: dto.shortDescription as string,
      content: dto.content as string,
      blogId: dto.blogId as string,
    };
  }
}

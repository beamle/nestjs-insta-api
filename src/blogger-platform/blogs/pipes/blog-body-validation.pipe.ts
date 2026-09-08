import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { CreateBlogDto } from '../dto/create-blog.dto';

type ValidationError = { message: string; field: string };

const WEBSITE_URL_REGEX = /^https:\/\/([a-zA-Z0-9-]+\.)+[a-zA-Z0-9-]+(\/.*)?$/;

@Injectable()
export class BlogBodyValidationPipe implements PipeTransform {
  transform(value: unknown): CreateBlogDto {
    const dto = value as Record<string, unknown>;
    const errors: ValidationError[] = [];

    if (
      typeof dto.websiteUrl !== 'string' ||
      dto.websiteUrl.trim().length === 0 ||
      dto.websiteUrl.length > 100 ||
      !WEBSITE_URL_REGEX.test(dto.websiteUrl)
    ) {
      errors.push({
        field: 'websiteUrl',
        message:
          'websiteUrl must be a valid https url and up to 100 characters',
      });
    }

    if (
      typeof dto.name !== 'string' ||
      dto.name.trim().length < 1 ||
      dto.name.length > 15
    ) {
      errors.push({
        field: 'name',
        message: 'name must be from 1 to 15 characters',
      });
    }

    if (
      typeof dto.description !== 'string' ||
      dto.description.trim().length < 1 ||
      dto.description.length > 500
    ) {
      errors.push({
        field: 'description',
        message: 'description must be from 1 to 500 characters',
      });
    }

    if (errors.length > 0) {
      throw new BadRequestException({ errorsMessages: errors });
    }

    return {
      name: dto.name as string,
      description: dto.description as string,
      websiteUrl: dto.websiteUrl as string,
    };
  }
}

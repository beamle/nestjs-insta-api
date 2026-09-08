import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { verify } from 'jsonwebtoken';
import { CreatePostForBlogDto } from './dto/create-post-for-blog.dto';
import { GetAllPostsDto } from '../posts/dto/get-all-posts.dto';
import { CreatePostForBlogCommand } from '../posts/application/commands/create-post-for-blog.command';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { FindAllPostsByBlogQuery } from '../posts/application/queries/find-all-posts-by-blog.query';
import { BasicAuthGuard } from '../../user-accounts/users/guards/basic-auth.guard';
import { CreatePostForBlogValidationPipe } from './pipes/create-post-for-blog-validation.pipe';

@Controller('blogs/:blogId/posts')
export class BlogsPostsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  findAll(
    @Param('blogId') blogId: string,
    @Query() query: GetAllPostsDto,
    @Req() request: any,
  ) {
    const currentUserId = this.getOptionalUserIdFromRequest(request);

    return this.queryBus.execute(
      new FindAllPostsByBlogQuery(blogId, query, currentUserId),
    );
  }

  @Post()
  @UseGuards(BasicAuthGuard)
  async createPost(
    @Param('blogId') blogId: string,
    @Body(new CreatePostForBlogValidationPipe()) dto: CreatePostForBlogDto,
  ) {
    return this.commandBus.execute(new CreatePostForBlogCommand(blogId, dto));
  }

  private getOptionalUserIdFromRequest(request: any): string | undefined {
    const authHeader = request.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      return undefined;
    }

    const token = authHeader.slice('Bearer '.length).trim();

    try {
      const payload = verify(
        token,
        process.env.JWT_ACCESS_SECRET ?? 'access-secret',
      ) as { userId?: string; type?: string };

      if (payload.type !== 'access' || typeof payload.userId !== 'string') {
        return undefined;
      }

      return payload.userId;
    } catch {
      return undefined;
    }
  }
}

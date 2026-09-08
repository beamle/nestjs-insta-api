import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
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

  @Post()
  @UseGuards(BasicAuthGuard)
  async createPost(
    @Param('blogId') blogId: string,
    @Body(new CreatePostForBlogValidationPipe()) dto: CreatePostForBlogDto,
  ) {
    return this.commandBus.execute(new CreatePostForBlogCommand(blogId, dto));
  }

  @Get()
  findAll(@Param('blogId') blogId: string, @Query() query: GetAllPostsDto) {
    return this.queryBus.execute(new FindAllPostsByBlogQuery(blogId, query));
  }
}

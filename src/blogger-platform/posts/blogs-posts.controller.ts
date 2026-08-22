import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { CreatePostForBlogDto } from './dto/create-post-for-blog.dto';
import { GetAllPostsDto } from './dto/get-all-posts.dto';
import { CreatePostForBlogCommand } from './application/commands/create-post-for-blog.command';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { FindAllPostsByBlogQuery } from './application/queries/find-all-posts-by-blog.query';

@Controller('blogs/:blogId/posts')
export class BlogsPostsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  async createPost(
    @Param('blogId') blogId: string,
    @Body() dto: CreatePostForBlogDto,
  ) {
    return this.commandBus.execute(new CreatePostForBlogCommand(blogId, dto));
  }

  @Get()
  findAll(@Param('blogId') blogId: string, @Query() query: GetAllPostsDto) {
    return this.queryBus.execute(new FindAllPostsByBlogQuery(blogId, query));
  }
}

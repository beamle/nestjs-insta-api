import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostForBlogDto } from './dto/create-post-for-blog.dto';
import { GetAllPostsDto } from './dto/get-all-posts.dto';
import { CreatePostForBlogCommand } from './application/commands/create-post-for-blog.command';
import { CommandBus } from '@nestjs/cqrs';

@Controller('blogs/:blogId/posts')
export class BlogsPostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly commandBus: CommandBus,
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
    return this.postsService.findAllByBlog(blogId, query);
  }
}

import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostForBlogDto } from './dto/create-post-for-blog.dto';
import { GetAllPostsDto } from './dto/get-all-posts.dto';

@Controller('blogs/:blogId/posts')
export class BlogsPostsController {
  constructor(private readonly postsService: PostsService) {
  }

  @Post()
  create(
    @Param('blogId') blogId: string,
    @Body() createPostDto: CreatePostForBlogDto,
  ) {
    return this.postsService.createForBlog(blogId, createPostDto);
  }

  @Get()
  findAll(@Param('blogId') blogId: string, @Query() query: GetAllPostsDto) {
    return this.postsService.findAllByBlog(blogId, query);
  }
}

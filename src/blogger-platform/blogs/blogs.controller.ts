import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { BlogsService } from './blogs.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { BlogsQueryDto } from './dto/get-all-blogs.dto';
import { CreatePostForBlogDto } from './dto/create-post-for-blog.dto';

@Controller('blogs')
export class BlogsController {
  constructor(private readonly blogsService: BlogsService) {}

  @Post()
  create(@Body() createBlogDto: CreateBlogDto) {
    return this.blogsService.create(createBlogDto);
  }

  @Post()
  createPostForBlog(
    @Param('id') id: string,
    @Body() createPostForBlogDto: CreatePostForBlogDto,
  ) {
    return this.blogsService.createPostForBlog(id, createPostForBlogDto);
  }

  @Get()
  findAll(@Query() query: BlogsQueryDto) {
    return this.blogsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.blogsService.findOne(id);
  }

  @Get(':blogId/posts')
  findAllPostsForBlog(
    @Param('blogId') blogId: string,
    @Query() query: BlogsQueryDto & { blogId: string },
  ) {
    return this.blogsService.findAllPostsForBlog(blogId, query);
  }

  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateBlogDto,
  ): Promise<void> {
    await this.blogsService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    await this.blogsService.remove(id);
  }
}

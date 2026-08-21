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
  UseGuards,
} from '@nestjs/common';
import { BlogsService } from './blogs.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { BlogsQueryDto } from './dto/get-all-blogs.dto';
import { CreatePostForBlogDto } from './dto/create-post-for-blog.dto';
import { AuthGuard } from '@nestjs/passport';
import { CreatePostForBlogCommand } from '../posts/application/commands/create-post-for-blog.command';
import { CommandBus } from '@nestjs/cqrs';

@Controller('blogs')
export class BlogsController {
  constructor(
    private readonly blogsService: BlogsService,
    private readonly commandBus: CommandBus,
  ) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  create(@Body() createBlogDto: CreateBlogDto) {
    return this.blogsService.create(createBlogDto);
  }

  @Post()
  @UseGuards(AuthGuard('jwt'))
  createPostForBlog(
    @Param('id') id: string,
    @Body() createPostForBlogDto: CreatePostForBlogDto,
  ) {
    return this.commandBus.execute(
      new CreatePostForBlogCommand(id, createPostForBlogDto),
    );
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
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.NO_CONTENT)
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateBlogDto,
  ): Promise<void> {
    await this.blogsService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    await this.blogsService.remove(id);
  }
}

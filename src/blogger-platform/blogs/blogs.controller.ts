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
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { BlogsQueryDto } from './dto/get-all-blogs.dto';
import { CreatePostForBlogDto } from './dto/create-post-for-blog.dto';
import { CreatePostForBlogCommand } from '../posts/application/commands/create-post-for-blog.command';
import { CreateBlogCommand } from './application/commands/create-blog.command';
import { UpdateBlogCommand } from './application/commands/update-blog.command';
import { DeleteBlogCommand } from './application/commands/delete-blog.command';
import { GetAllBlogsQuery } from './application/queries/get-all-blogs.query';
import { GetBlogByIdQuery } from './application/queries/get-blog-by-id.query';
import { FindAllPostsByBlogQuery } from '../posts/application/queries/find-all-posts-by-blog.query';
import { BasicAuthGuard } from '../../user-accounts/users/guards/basic-auth.guard';
import { BlogBodyValidationPipe } from './pipes/blog-body-validation.pipe';
import { CreatePostForBlogValidationPipe } from './pipes/create-post-for-blog-validation.pipe';

@Controller('blogs')
export class BlogsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @UseGuards(BasicAuthGuard)
  create(@Body(new BlogBodyValidationPipe()) createBlogDto: CreateBlogDto) {
    return this.commandBus.execute(new CreateBlogCommand(createBlogDto));
  }

  @Post(':id/posts')
  @UseGuards(BasicAuthGuard)
  createPostForBlog(
    @Param('id') id: string,
    @Body(new CreatePostForBlogValidationPipe())
    createPostForBlogDto: CreatePostForBlogDto,
  ) {
    return this.commandBus.execute(
      new CreatePostForBlogCommand(id, createPostForBlogDto),
    );
  }

  @Get()
  findAll(@Query() query: BlogsQueryDto) {
    return this.queryBus.execute(new GetAllBlogsQuery(query));
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.queryBus.execute(new GetBlogByIdQuery(id));
  }

  @Get(':blogId/posts')
  findAllPostsForBlog(
    @Param('blogId') blogId: string,
    @Query() query: BlogsQueryDto & { blogId: string },
  ) {
    return this.queryBus.execute(new FindAllPostsByBlogQuery(blogId, query));
  }

  @Put(':id')
  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async update(
    @Param('id') id: string,
    @Body(new BlogBodyValidationPipe()) dto: UpdateBlogDto,
  ): Promise<void> {
    await this.commandBus.execute(new UpdateBlogCommand(id, dto));
  }

  @Delete(':id')
  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    await this.commandBus.execute(new DeleteBlogCommand(id));
  }
}

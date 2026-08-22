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
import { AuthGuard } from '@nestjs/passport';
import { CreatePostDto } from './dto/create-post.dto';
import { GetAllPostsDto } from './dto/get-all-posts.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { LikeStatusDto } from './dto/like-status.dto';
import { CreateCommentDto } from '../comments/dto/create-comment.dto';
import { GetAllCommentsDto } from '../comments/dto/get-all-comments.dto';
import { CreatePostCommand } from './application/commands/create-post.command';
import { CreateCommentCommand } from './application/commands/create-comment.command';
import { GetAllPostsQuery } from './application/queries/get-all-posts.query';
import { GetPostByIdQuery } from './application/queries/get-post-by-id.query';
import { GetAllCommentsForPostQuery } from './application/queries/get-all-comments-for-post.query';
import { UpdatePostCommand } from './application/commands/update-post.command';
import { DeletePostCommand } from './application/commands/delete-post.command';
import { UpdateLikeStatusCommand } from './application/commands/update-like-status.command';

@Controller('posts')
export class PostsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  create(@Body() createPostDto: CreatePostDto) {
    return this.commandBus.execute(new CreatePostCommand(createPostDto));
  }

  @Post(':id/comments')
  createNewComment(
    @Param('id') id: string,
    @Body() createCommentDto: CreateCommentDto,
  ) {
    return this.commandBus.execute(
      new CreateCommentCommand(id, createCommentDto),
    );
  }

  @Get()
  findAll(@Query() query: GetAllPostsDto) {
    return this.queryBus.execute(new GetAllPostsQuery(query));
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.queryBus.execute(new GetPostByIdQuery(id));
  }

  @Get(':id/comments')
  findAllCommentsForPost(
    @Param('id') id: string,
    @Query() query: GetAllCommentsDto,
  ) {
    return this.queryBus.execute(new GetAllCommentsForPostQuery(id, query));
  }

  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async update(
    @Param('id') id: string,
    @Body() dto: UpdatePostDto,
  ): Promise<void> {
    await this.commandBus.execute(new UpdatePostCommand(id, dto));
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    await this.commandBus.execute(new DeletePostCommand(id));
  }

  @Put(':postId/like-status')
  @UseGuards(AuthGuard('jwt'))
  async updateLikeStatus(
    @Param('postId') postId: string,
    @Body() dto: LikeStatusDto,
  ): Promise<void> {
    await this.commandBus.execute(new UpdateLikeStatusCommand(postId, dto));
  }
}

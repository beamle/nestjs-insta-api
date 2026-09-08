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
  Req,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { AuthGuard } from '@nestjs/passport';
import { verify } from 'jsonwebtoken';
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
import { CreatePostValidationPipe } from './pipes/create-post-validation.pipe';
import { UpdatePostValidationPipe } from './pipes/update-post-validation.pipe';
import { LikeStatusValidationPipe } from './pipes/like-status-validation.pipe';
import { CommentContentValidationPipe } from './pipes/comment-content-validation.pipe';
import { BasicAuthGuard } from '../../user-accounts/users/guards/basic-auth.guard';

@Controller('posts')
export class PostsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @UseGuards(BasicAuthGuard)
  create(@Body(new CreatePostValidationPipe()) createPostDto: CreatePostDto) {
    return this.commandBus.execute(new CreatePostCommand(createPostDto));
  }

  @Post(':id/comments')
  @UseGuards(AuthGuard('jwt'))
  createNewComment(
    @Param('id') id: string,
    @Body(new CommentContentValidationPipe())
    createCommentDto: CreateCommentDto,
    @Req() request: any,
  ) {
    return this.commandBus.execute(
      new CreateCommentCommand(id, createCommentDto, request.user.userId),
    );
  }

  @Get()
  findAll(@Query() query: GetAllPostsDto, @Req() request: any) {
    const currentUserId = this.getOptionalUserIdFromRequest(request);

    return this.queryBus.execute(new GetAllPostsQuery(query, currentUserId));
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() request: any) {
    const currentUserId = this.getOptionalUserIdFromRequest(request);

    return this.queryBus.execute(new GetPostByIdQuery(id, currentUserId));
  }

  @Get(':id/comments')
  findAllCommentsForPost(
    @Param('id') id: string,
    @Query() query: GetAllCommentsDto,
    @Req() request: any,
  ) {
    const currentUserId = this.getOptionalUserIdFromRequest(request);

    return this.queryBus.execute(
      new GetAllCommentsForPostQuery(id, query, currentUserId),
    );
  }

  @Put(':id')
  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async update(
    @Param('id') id: string,
    @Body(new UpdatePostValidationPipe()) dto: UpdatePostDto,
  ): Promise<void> {
    await this.commandBus.execute(new UpdatePostCommand(id, dto));
  }

  @Delete(':id')
  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    await this.commandBus.execute(new DeletePostCommand(id));
  }

  @Put(':postId/like-status')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateLikeStatus(
    @Param('postId') postId: string,
    @Body(new LikeStatusValidationPipe()) dto: LikeStatusDto,
    @Req() request: any,
  ): Promise<void> {
    await this.commandBus.execute(
      new UpdateLikeStatusCommand(postId, dto, request.user.userId),
    );
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

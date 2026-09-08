import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { AuthGuard } from '@nestjs/passport';
import { verify } from 'jsonwebtoken';
import { LikeStatusDto } from '../posts/dto/like-status.dto';
import { GetCommentByIdQuery } from './application/queries/get-comment-by-id.query';
import { UpdateCommentLikeCommand } from './application/commands/update-comment-like.command';
import { UpdateCommentCommand } from './application/commands/update-comment.command';
import { DeleteCommentCommand } from './application/commands/delete-comment.command';
import { LikeStatusValidationPipe } from '../posts/pipes/like-status-validation.pipe';
import { CommentContentValidationPipe } from './pipes/comment-content-validation.pipe';

@Controller()
export class CommentsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get('comments/:commentId')
  findOne(@Param('commentId') commentId: string, @Req() request: any) {
    const currentUserId = this.getOptionalUserIdFromRequest(request);

    return this.queryBus.execute(
      new GetCommentByIdQuery(commentId, currentUserId),
    );
  }

  @Put('comments/:commentId/like-status')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateCommentLike(
    @Param('commentId') commentId: string,
    @Body(new LikeStatusValidationPipe()) likeStatusDto: LikeStatusDto,
    @Req() request: any,
  ): Promise<void> {
    await this.commandBus.execute(
      new UpdateCommentLikeCommand(
        commentId,
        likeStatusDto,
        request.user.userId,
      ),
    );
  }

  @Put('comments/:commentId')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateComment(
    @Param('commentId') commentId: string,
    @Body(new CommentContentValidationPipe())
    commentUpdateDto: { content: string },
    @Req() request: any,
  ): Promise<void> {
    await this.commandBus.execute(
      new UpdateCommentCommand(
        commentId,
        commentUpdateDto.content,
        request.user.userId,
      ),
    );
  }

  @Delete('comments/:commentId')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteComment(
    @Param('commentId') commentId: string,
    @Req() request: any,
  ): Promise<void> {
    await this.commandBus.execute(
      new DeleteCommentCommand(commentId, request.user.userId),
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

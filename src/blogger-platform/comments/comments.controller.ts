import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { LikeStatusDto } from '../posts/dto/like-status.dto';
import { GetCommentByIdQuery } from './application/queries/get-comment-by-id.query';
import { UpdateCommentLikeCommand } from './application/commands/update-comment-like.command';
import { UpdateCommentCommand } from './application/commands/update-comment.command';
import { DeleteCommentCommand } from './application/commands/delete-comment.command';

@Controller()
export class CommentsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get('comments/:commentId')
  findOne(@Param('commentId') commentId: string) {
    return this.queryBus.execute(new GetCommentByIdQuery(commentId));
  }

  @Post('comments/:commentId/like-status')
  updateCommentLike(
    @Param('commentId') commentId: string,
    @Body() likeStatusDto: LikeStatusDto,
  ) {
    return this.commandBus.execute(
      new UpdateCommentLikeCommand(commentId, likeStatusDto),
    );
  }

  @Post('comments/:commentId')
  updateComment(
    @Param('commentId') commentId: string,
    @Body() commentUpdateDto: { content: string },
  ) {
    return this.commandBus.execute(
      new UpdateCommentCommand(commentId, commentUpdateDto.content),
    );
  }

  @Delete('comments/:commentId')
  deleteComment(@Param('commentId') commentId: string) {
    return this.commandBus.execute(new DeleteCommentCommand(commentId));
  }
}

import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { GetAllCommentsDto } from './dto/get-all-comments.dto';
import { LikeStatusDto } from '../posts/dto/like-status.dto';

@Controller()
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get('posts/:postId/comments')
  findAllByPost(
    @Param('postId') postId: string,
    @Query() query: GetAllCommentsDto,
  ) {
    return this.commentsService.findAllByPost(postId, query);
  }

  @Get('comments/:commentId')
  findOne(@Param('commentId') commentId: string) {
    return this.commentsService.findOne(commentId);
  }

  @Post('comments/:commentId/like-status')
  updateCommentLike(
    @Param('commentId') commentId: string,
    @Body() likeStatusDto: LikeStatusDto,
  ) {
    return this.commentsService.updateCommentLike(commentId, likeStatusDto);
  }

  @Post('comments/:commentId')
  updateComment(
    @Param('commentId') commentId: string,
    @Body() commentUpdateDto: { content: string },
  ) {
    return this.commentsService.updateComment(commentId, commentUpdateDto);
  }
}

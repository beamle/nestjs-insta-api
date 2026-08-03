import { Controller, Get, Param, Query } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { GetAllCommentsDto } from './dto/get-all-comments.dto';

@Controller()
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {
  }

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
}

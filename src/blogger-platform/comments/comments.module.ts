import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CqrsModule } from '@nestjs/cqrs';
import { CommentsController } from './comments.controller';
import { CommentsRepository } from './comments.repository';
import { CommentsService } from './comments.service';
import { Comment, CommentSchema } from './schema/comment.schema';
import { PostsModule } from '../posts/posts.module';
import {
  DeleteCommentCommandHandler,
  GetCommentByIdQueryHandler,
  UpdateCommentCommandHandler,
  UpdateCommentLikeCommandHandler,
} from './application/handlers';

const COMMAND_HANDLERS = [
  UpdateCommentCommandHandler,
  DeleteCommentCommandHandler,
  UpdateCommentLikeCommandHandler,
];

const QUERY_HANDLERS = [GetCommentByIdQueryHandler];

@Module({
  imports: [
    CqrsModule,
    MongooseModule.forFeature([{ name: Comment.name, schema: CommentSchema }]),
    forwardRef(() => PostsModule),
  ],
  controllers: [CommentsController],
  providers: [
    CommentsService,
    CommentsRepository,
    ...COMMAND_HANDLERS,
    ...QUERY_HANDLERS,
  ],
  exports: [CommentsRepository],
})
export class CommentsModule {}

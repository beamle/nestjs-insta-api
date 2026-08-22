import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CqrsModule } from '@nestjs/cqrs';
import { PostsController } from './posts.controller';
import { PostsRepository } from './posts.repository';
import { PostsService } from './posts.service';
import { Post, PostSchema } from './schema/post.schema';
import { BlogsModule } from '../blogs/blogs.module';
import { CommentsModule } from '../comments/comments.module';
import {
  CreateCommentCommandHandler,
  CreatePostCommandHandler,
  CreatePostForBlogCommandHandler,
  DeletePostCommandHandler,
  FindAllPostsByBlogQueryHandler,
  GetAllPostsQueryHandler,
  GetPostByIdQueryHandler,
  GetPostCommentsQueryHandler,
  UpdateLikeStatusCommandHandler,
  UpdatePostCommandHandler,
} from './application/handlers';

const COMMAND_HANDLERS = [
  CreateCommentCommandHandler,
  CreatePostForBlogCommandHandler,
  CreatePostCommandHandler,
  DeletePostCommandHandler,
  UpdatePostCommandHandler,
  UpdateLikeStatusCommandHandler,
];

const QUERY_HANDLERS = [
  FindAllPostsByBlogQueryHandler,
  GetAllPostsQueryHandler,
  GetPostByIdQueryHandler,
  GetPostCommentsQueryHandler,
];

@Module({
  imports: [
    CqrsModule,
    forwardRef(() => BlogsModule),
    forwardRef(() => CommentsModule),
    MongooseModule.forFeature([
      {
        name: Post.name,
        schema: PostSchema,
      },
    ]),
  ],
  controllers: [PostsController],
  providers: [
    PostsService,
    PostsRepository,
    ...COMMAND_HANDLERS,
    ...QUERY_HANDLERS,
  ],
  exports: [PostsService, PostsRepository],
})
export class PostsModule {}

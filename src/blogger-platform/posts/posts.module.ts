import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PostsController } from './posts.controller';
import { PostsRepository } from './posts.repository';
import { PostsService } from './posts.service';
import { Post, PostSchema } from './schema/post.schema';
import { BlogsPostsController } from './blogs-posts.controller';
import {
  ConfirmEmailCommandHandler,
  LoginCommandHandler,
  PasswordRecoveryCommandHandler,
  RegisterCommandHandler,
  ResendConfirmationEmailCommandHandler,
  SetNewPasswordCommandHandler,
} from '../../user-accounts/auth/application/handlers';

const HANDLERS = [];

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Post.name,
        schema: PostSchema,
      },
    ]),
  ],
  controllers: [PostsController, BlogsPostsController],
  providers: [PostsService, PostsRepository],
  exports: [PostsService, PostsRepository],
})
export class PostsModule {}

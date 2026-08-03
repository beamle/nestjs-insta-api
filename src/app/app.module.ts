import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { BlogsModule } from '../blogger-platform/blogs/blogs.module';
import { PostsModule } from '../blogger-platform/posts/posts.module';
import { CommentsModule } from '../blogger-platform/comments/comments.module';
import { UsersModule } from '../user-accounts/users/users.module';
import { TestingController } from '../testing/testing.controller';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017/nest'),
    BlogsModule,
    PostsModule,
    CommentsModule,
    UsersModule,
  ],
  controllers: [AppController, TestingController],
  providers: [AppService],
})
export class AppModule {}

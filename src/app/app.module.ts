import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { BlogsModule } from '../blogs/blogs.module';
import { PostsModule } from '../posts/posts.module';
import { CommentsModule } from '../comments/comments.module';
import { TestingController } from '../testing/testing.controller';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017/nest'),
    BlogsModule,
    PostsModule,
    CommentsModule,
  ],
  controllers: [AppController, TestingController],
  providers: [AppService],
})
export class AppModule {}

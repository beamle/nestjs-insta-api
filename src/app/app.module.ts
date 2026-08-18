import 'dotenv/config';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { BlogsModule } from '../blogger-platform/blogs/blogs.module';
import { PostsModule } from '../blogger-platform/posts/posts.module';
import { CommentsModule } from '../blogger-platform/comments/comments.module';
import { UsersModule } from '../user-accounts/users/users.module';
import { AuthModule } from '../user-accounts/auth/auth.module';
import { TestingController } from '../testing/testing.controller';
import { PassportModule } from '@nestjs/passport';
import { JwtService } from '../user-accounts/auth/services/JwtService';
import { JwtStrategy } from '../user-accounts/auth/services/JwtStrategy';

@Module({
  imports: [
    MongooseModule.forRoot(
      process.env.MONGO_URI ?? 'mongodb://localhost:27017/nest',
    ),
    BlogsModule,
    PostsModule,
    CommentsModule,
    UsersModule,
    AuthModule,
    PassportModule,
  ],
  controllers: [AppController, TestingController],
  providers: [AppService, JwtStrategy, JwtService],
  exports: [JwtService],
})
export class AppModule {}

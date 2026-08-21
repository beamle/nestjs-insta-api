import { Module } from '@nestjs/common';
import { BlogsService } from './blogs.service';
import { BlogsController } from './blogs.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Blog, BlogSchema } from './schema/blog.schema';
import { BlogsRepository } from './blogs.repository';
import { PostsModule } from '../posts/posts.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Blog.name,
        schema: BlogSchema,
      },
    ]),
    PostsModule,
  ],
  controllers: [BlogsController],
  providers: [BlogsService, BlogsRepository],
  exports: [BlogsRepository],
})
export class BlogsModule {}

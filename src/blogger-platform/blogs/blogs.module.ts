import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CqrsModule } from '@nestjs/cqrs';
import { BlogsService } from './blogs.service';
import { BlogsController } from './blogs.controller';
import { Blog, BlogSchema } from './schema/blog.schema';
import { BlogsRepository } from './blogs.repository';
import { PostsModule } from '../posts/posts.module';
import {
  CreateBlogCommandHandler,
  DeleteBlogCommandHandler,
  GetAllBlogsQueryHandler,
  GetBlogByIdQueryHandler,
  UpdateBlogCommandHandler,
} from './application/handlers';

const COMMAND_HANDLERS = [
  CreateBlogCommandHandler,
  UpdateBlogCommandHandler,
  DeleteBlogCommandHandler,
];

const QUERY_HANDLERS = [GetAllBlogsQueryHandler, GetBlogByIdQueryHandler];

@Module({
  imports: [
    CqrsModule,
    MongooseModule.forFeature([
      {
        name: Blog.name,
        schema: BlogSchema,
      },
    ]),
    PostsModule,
  ],
  controllers: [BlogsController],
  providers: [
    BlogsService,
    BlogsRepository,
    ...COMMAND_HANDLERS,
    ...QUERY_HANDLERS,
  ],
  exports: [BlogsRepository],
})
export class BlogsModule {}

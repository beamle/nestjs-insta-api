import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BlogsController } from "../blogs/blogs.controller";
import { MongooseModule } from "@nestjs/mongoose";
import { BlogsModule } from "../blogs/blogs.module";

@Module({
  imports: [MongooseModule.forRoot('mongodb://localhost:27017/nest'), BlogsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

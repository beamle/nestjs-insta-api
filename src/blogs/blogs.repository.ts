import { Injectable } from '@nestjs/common';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { Model } from "mongoose";
import { Blog, BlogDocument } from "./schema/blog.schema";
import { InjectModel } from "@nestjs/mongoose";

@Injectable()
export class BlogsRepository {
  constructor(
    @InjectModel(Blog.name)
    private readonly blogModel: Model<BlogDocument>,
  ) {}


  async create(createBlogDto: CreateBlogDto) {
    const blog = new this.blogModel({
      ...createBlogDto,
      createdAt: new Date(),
      isMembership: false,
    });

    return await blog.save();
  }

  async findAll() {
    return this.blogModel.find();
  }

  findOne(id: string) {
    return this.blogModel.findById(id);
  }

  update(id: string, updateBlogDto: UpdateBlogDto) {
    return `This action updates a #${id} blog`;
  }

  remove(id: string) {
    return this.blogModel.deleteOne({id})
  }
}

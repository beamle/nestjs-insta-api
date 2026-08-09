import { Injectable } from '@nestjs/common';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { Model } from 'mongoose';
import { Blog, BlogDocument } from './schema/blog.schema';
import { InjectModel } from '@nestjs/mongoose';
import { toObjectId } from '../../helpers/helpers';
import { BlogsQueryDto } from "./dto/get-all-blogs.dto";

@Injectable()
export class BlogsRepository {
  constructor(
    @InjectModel(Blog.name)
    private readonly blogModel: Model<BlogDocument>,
  ) {
  }

  async create(createBlogDto: CreateBlogDto) {
    const blog = new this.blogModel({
      ...createBlogDto,
      createdAt: new Date(),
      isMembership: false,
    });

    return await blog.save();
  }

  async findAll(query: BlogsQueryDto) {
    const {
      searchNameTerm,
      sortBy = 'createdAt',
      sortDirection = 'desc',
      pageNumber = 1,
      pageSize = 10,
    } = query;

    const filter = searchNameTerm
      ? {
        name: {
          $regex: searchNameTerm,
          $options: 'i',
        },
      }
      : {};

    const totalCount = await this.blogModel.countDocuments(filter);

    const items = await this.blogModel
      .find(filter)
      .sort({ [sortBy]: sortDirection === 'asc' ? 1 : -1 })
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize)
      .lean()
      .exec();

    return {
      items,
      totalCount,
    };
  }

  async findOne(id: string) {
    return this.blogModel.findById(toObjectId(id)).exec();
  }

  async update(id: string, updateBlogDto: UpdateBlogDto) {
    return this.blogModel
      .findByIdAndUpdate(toObjectId(id), updateBlogDto, {
        returnDocument: 'after',
      })
      .exec();
  }

  remove(id: string) {
    return this.blogModel.deleteOne({ _id: toObjectId(id) }).exec();
  }
}

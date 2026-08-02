import { Injectable } from '@nestjs/common';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { BlogsRepository } from "./blogs.repository";

@Injectable()
export class BlogsService {
  constructor(private readonly blogsRepository: BlogsRepository) {}

  async create(createBlogDto: CreateBlogDto) {
    const blog = await this.blogsRepository.create(createBlogDto)
    if(!blog) throw new Error("Did not create blog")
  }

  async findAll() {
    return await this.blogsRepository.findAll()
  }

  async findOne(id: string) {
    return await this.blogsRepository.findOne(id)
  }

  update(id: string, updateBlogDto: UpdateBlogDto) {
    return `This action updates a #${id} blog`;
  }

  remove(id: string) {
    return `This action removes a #${id} blog`;
  }
}

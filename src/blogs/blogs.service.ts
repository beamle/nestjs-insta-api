import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { BlogsRepository } from "./blogs.repository";
import { BlogsQueryDto } from "./dto/get-all-blogs.dto";
import { BlogDocument } from "./schema/blog.schema";
import { BlogMapper } from "./mappers/blogs.mapper";

@Injectable()
export class BlogsService {
  constructor(private readonly blogsRepository: BlogsRepository) {}

  async create(createBlogDto: CreateBlogDto) {
    return await this.blogsRepository.create(createBlogDto)
  }

  async findAll(query: BlogsQueryDto) {
    const { items, totalCount } =
      await this.blogsRepository.findAll(query);

    return {
      pagesCount: Math.ceil(totalCount / query.pageSize),
      page: query.pageNumber,
      pageSize: query.pageSize,
      totalCount,
      items: items.map(BlogMapper.toViewModel),
    };
  }

  async findOne(id: string) {
    const blog = await this.blogsRepository.findOne(id)
    if (!blog) throw new NotFoundException(`No such blog with id: ${id}`);
    return BlogMapper.toViewModel(blog);
  }

  async update(id: string, updateBlogDto: UpdateBlogDto) {
    const updatedBlog = await this.blogsRepository.update(id, updateBlogDto);
    if (!updatedBlog) throw new NotFoundException(`No such blog with id: ${id}`);
    return updatedBlog;
  }

  async remove(id: string) {
    const result = await this.blogsRepository.remove(id);

    if (result.deletedCount === 0) {
      throw new NotFoundException(`No such blog with id: ${id}`);
    }
  }

  private mapToViewModel(blog: BlogDocument) {
    return {
      id: blog._id.toString(),
      name: blog.name,
      description: blog.description,
      websiteUrl: blog.websiteUrl,
      createdAt: blog.createdAt,
      isMembership: blog.isMembership,
    };
  }

}

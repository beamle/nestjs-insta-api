import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { BlogsRepository } from './blogs.repository';
import { BlogsQueryDto } from './dto/get-all-blogs.dto';
import { BlogMapper } from './mappers/blogs.mapper';

@Injectable()
export class BlogsService {
  constructor(private readonly blogsRepository: BlogsRepository) {
  }

  async create(createBlogDto: CreateBlogDto) {
    const blog = await this.blogsRepository.create(createBlogDto);
    return BlogMapper.toViewModel(blog);
  }

  async findAll(query: BlogsQueryDto) {
    const pageNumber = Number(query.pageNumber ?? 1);
    const pageSize = Number(query.pageSize ?? 10);
    const { items, totalCount } = await this.blogsRepository.findAll(query);

    return {
      pagesCount: totalCount > 0 ? Math.ceil(totalCount / pageSize) : 0,
      page: pageNumber,
      pageSize,
      totalCount,
      items: items.map((item) => BlogMapper.toViewModel(item)),
    };
  }

  async findOne(id: string) {
    const blog = await this.blogsRepository.findOne(id);
    if (!blog) throw new NotFoundException(`No such blog with id: ${id}`);
    return BlogMapper.toViewModel(blog);
  }

  async update(id: string, updateBlogDto: UpdateBlogDto) {
    const updatedBlog = await this.blogsRepository.update(id, updateBlogDto);
    if (!updatedBlog)
      throw new NotFoundException(`No such blog with id: ${id}`);
    return updatedBlog;
  }

  async remove(id: string) {
    const result = await this.blogsRepository.remove(id);

    if (result.deletedCount === 0) {
      throw new NotFoundException(`No such blog with id: ${id}`);
    }
  }
}

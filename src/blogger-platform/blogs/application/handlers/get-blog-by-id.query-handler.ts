import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { BlogsRepository } from '../../blogs.repository';
import { BlogMapper } from '../../mappers/blogs.mapper';
import { GetBlogByIdQuery } from '../queries/get-blog-by-id.query';

@QueryHandler(GetBlogByIdQuery)
export class GetBlogByIdQueryHandler implements IQueryHandler<GetBlogByIdQuery> {
  constructor(private readonly blogsRepository: BlogsRepository) {}

  async execute(query: GetBlogByIdQuery) {
    const { id } = query;
    
    const blog = await this.blogsRepository.findOne(id);
    
    if (!blog) {
      throw new NotFoundException(`No such blog with id: ${id}`);
    }
    
    return BlogMapper.toViewModel(blog);
  }
}

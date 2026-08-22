import { NotFoundException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PostsMapper } from '../../mappers/posts.mapper';
import { BlogsRepository } from '../../../blogs/blogs.repository';
import { PostsRepository } from '../../posts.repository';
import { FindAllPostsByBlogQuery } from '../queries/find-all-posts-by-blog.query';

@QueryHandler(FindAllPostsByBlogQuery)
export class FindAllPostsByBlogQueryHandler implements IQueryHandler<FindAllPostsByBlogQuery> {
  constructor(
    private readonly postsRepository: PostsRepository,
    private readonly blogsRepository: BlogsRepository,
  ) {}

  async execute(command: FindAllPostsByBlogQuery) {
    const { blogId, dto } = command;
    const blog = await this.blogsRepository.findOne(blogId);

    if (!blog) {
      throw new NotFoundException(`No such blog with id: ${blogId}`);
    }

    const pageNumber = Number(dto.pageNumber ?? 1);
    const pageSize = Number(dto.pageSize ?? 10);
    const { items, totalCount } = await this.postsRepository.findAll(
      {
        sortBy: dto.sortBy ?? 'createdAt',
        sortDirection: dto.sortDirection ?? 'desc',
        pageNumber,
        pageSize,
      },
      blogId,
    );

    return {
      pagesCount: totalCount > 0 ? Math.ceil(totalCount / pageSize) : 0,
      page: pageNumber,
      pageSize,
      totalCount,
      items: items.map((item) => PostsMapper.toViewModel(item)),
    };
  }
}

import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { BlogsRepository } from '../../blogs.repository';
import { BlogMapper } from '../../mappers/blogs.mapper';
import { GetAllBlogsQuery } from '../queries/get-all-blogs.query';

@QueryHandler(GetAllBlogsQuery)
export class GetAllBlogsQueryHandler implements IQueryHandler<GetAllBlogsQuery> {
  constructor(private readonly blogsRepository: BlogsRepository) {}

  async execute(query: GetAllBlogsQuery) {
    const { dto } = query;
    
    const pageNumber = Number(dto.pageNumber ?? 1);
    const pageSize = Number(dto.pageSize ?? 10);
    const { items, totalCount } = await this.blogsRepository.findAll(dto);

    return {
      pagesCount: totalCount > 0 ? Math.ceil(totalCount / pageSize) : 0,
      page: pageNumber,
      pageSize,
      totalCount,
      items: items.map((item) => BlogMapper.toViewModel(item)),
    };
  }
}

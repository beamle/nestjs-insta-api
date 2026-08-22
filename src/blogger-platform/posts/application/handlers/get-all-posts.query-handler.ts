import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PostsMapper } from '../../mappers/posts.mapper';
import { PostsRepository } from '../../posts.repository';
import { GetAllPostsQuery } from '../queries/get-all-posts.query';

@QueryHandler(GetAllPostsQuery)
export class GetAllPostsQueryHandler implements IQueryHandler<GetAllPostsQuery> {
  constructor(private readonly postsRepository: PostsRepository) {}

  async execute(query: GetAllPostsQuery) {
    const { dto } = query;
    
    const pageNumber = Number(dto.pageNumber ?? 1);
    const pageSize = Number(dto.pageSize ?? 10);
    const { items, totalCount } = await this.postsRepository.findAll({
      sortBy: dto.sortBy ?? 'createdAt',
      sortDirection: dto.sortDirection ?? 'desc',
      pageNumber,
      pageSize,
    });

    return {
      pagesCount: totalCount > 0 ? Math.ceil(totalCount / pageSize) : 0,
      page: pageNumber,
      pageSize,
      totalCount,
      items: items.map((item) => PostsMapper.toViewModel(item)),
    };
  }
}

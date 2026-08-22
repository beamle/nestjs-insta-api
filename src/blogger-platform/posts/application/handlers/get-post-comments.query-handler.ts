import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { PostsMapper } from '../../mappers/posts.mapper';
import { GetAllCommentsForPostQuery } from '../queries/get-all-comments-for-post.query';
import { PostsRepository } from '../../posts.repository';

@QueryHandler(GetAllCommentsForPostQuery)
export class GetPostCommentsQueryHandler implements IQueryHandler<GetAllCommentsForPostQuery> {
  constructor(private readonly postsRepository: PostsRepository) {}

  async execute(query: GetAllCommentsForPostQuery) {
    const post = await this.postsRepository.findOne(query.postId);

    if (!post) {
      throw new NotFoundException(`No such post with id: ${query.postId}`);
    }

    const pageNumber = Number(query.dto.pageNumber ?? 1);
    const pageSize = Number(query.dto.pageSize ?? 10);
    const { items, totalCount } = await this.postsRepository.findAllComments(
      {
        sortBy: query.dto.sortBy ?? 'createdAt',
        sortDirection: query.dto.sortDirection ?? 'desc',
        pageNumber,
        pageSize,
      },
      query.postId,
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

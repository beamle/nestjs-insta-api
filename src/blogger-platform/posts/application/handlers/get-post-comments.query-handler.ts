import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { CommentsMapper } from '../../../comments/mappers/comments.mapper';
import { GetAllCommentsForPostQuery } from '../queries/get-all-comments-for-post.query';
import { PostsRepository } from '../../posts.repository';
import { CommentsRepository } from '../../../comments/comments.repository';

@QueryHandler(GetAllCommentsForPostQuery)
export class GetPostCommentsQueryHandler implements IQueryHandler<GetAllCommentsForPostQuery> {
  constructor(
    private readonly postsRepository: PostsRepository,
    private readonly commentsRepository: CommentsRepository,
  ) {}

  async execute(query: GetAllCommentsForPostQuery) {
    const post = await this.postsRepository.findOne(query.postId);

    if (!post) {
      throw new NotFoundException(`No such post with id: ${query.postId}`);
    }

    const pageNumber = Number(query.dto.pageNumber ?? 1);
    const pageSize = Number(query.dto.pageSize ?? 10);
    const { items, totalCount } = await this.commentsRepository.findAllByPost(
      query.postId,
      {
        sortBy: query.dto.sortBy ?? 'createdAt',
        sortDirection: query.dto.sortDirection ?? 'desc',
        pageNumber,
        pageSize,
      },
    );

    return {
      pagesCount: totalCount > 0 ? Math.ceil(totalCount / pageSize) : 0,
      page: pageNumber,
      pageSize,
      totalCount,
      items: items.map((item) =>
        CommentsMapper.toViewModel(item, query.currentUserId),
      ),
    };
  }
}

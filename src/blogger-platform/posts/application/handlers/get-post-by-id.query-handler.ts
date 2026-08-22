import { GetPostByIdQuery } from '../queries/get-post-by-id.query';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PostsRepository } from '../../posts.repository';
import { NotFoundException } from '@nestjs/common';
import { PostsMapper } from '../../mappers/posts.mapper';

@QueryHandler(GetPostByIdQuery)
export class GetPostByIdQueryHandler implements IQueryHandler<GetPostByIdQuery> {
  constructor(private readonly postsRepository: PostsRepository) {}

  async execute(query: GetPostByIdQuery) {
    const post = await this.postsRepository.findOne(query.postId);

    if (!post) {
      throw new NotFoundException(`Post with id ${query.postId} not found`);
    }

    return PostsMapper.toViewModel(post);
  }
}

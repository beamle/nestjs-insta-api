import { Injectable, NotFoundException } from '@nestjs/common';
import { CommentsRepository } from './comments.repository';
import { GetAllCommentsDto } from './dto/get-all-comments.dto';
import { CommentsMapper } from './mappers/comments.mapper';
import { PostsRepository } from '../posts/posts.repository';

@Injectable()
export class CommentsService {
  constructor(
    private readonly commentsRepository: CommentsRepository,
    private readonly postsRepository: PostsRepository,
  ) {
  }

  async findAllByPost(postId: string, query: GetAllCommentsDto) {
    const post = await this.postsRepository.findOne(postId);

    if (!post) {
      throw new NotFoundException(`No such post with id: ${postId}`);
    }

    const pageNumber = Number(query.pageNumber ?? 1);
    const pageSize = Number(query.pageSize ?? 10);
    const { items, totalCount } = await this.commentsRepository.findAllByPost(
      postId,
      {
        pageNumber,
        pageSize,
      },
    );

    return {
      pagesCount: totalCount > 0 ? Math.ceil(totalCount / pageSize) : 0,
      page: pageNumber,
      pageSize,
      totalCount,
      items: items.map((item) => CommentsMapper.toViewModel(item)),
    };
  }

  async findOne(id: string) {
    const comment = await this.commentsRepository.findOne(id);

    if (!comment) {
      throw new NotFoundException(`No such comment with id: ${id}`);
    }

    return CommentsMapper.toViewModel(comment);
  }
}

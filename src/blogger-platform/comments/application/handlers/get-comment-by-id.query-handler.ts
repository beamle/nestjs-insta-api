import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { CommentsRepository } from '../../comments.repository';
import { CommentsMapper } from '../../mappers/comments.mapper';
import { GetCommentByIdQuery } from '../queries/get-comment-by-id.query';

@QueryHandler(GetCommentByIdQuery)
export class GetCommentByIdQueryHandler implements IQueryHandler<GetCommentByIdQuery> {
  constructor(private readonly commentsRepository: CommentsRepository) {}

  async execute(query: GetCommentByIdQuery) {
    const { commentId } = query;

    const comment = await this.commentsRepository.findOne(commentId);

    if (!comment) {
      throw new NotFoundException(`No such comment with id: ${commentId}`);
    }

    return CommentsMapper.toViewModel(comment);
  }
}

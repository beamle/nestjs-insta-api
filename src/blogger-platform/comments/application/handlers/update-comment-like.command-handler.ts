import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { UpdateCommentLikeCommand } from '../commands/update-comment-like.command';
import { CommentsRepository } from '../../comments.repository';

@CommandHandler(UpdateCommentLikeCommand)
export class UpdateCommentLikeCommandHandler implements ICommandHandler<UpdateCommentLikeCommand> {
  constructor(private readonly commentsRepository: CommentsRepository) {}

  async execute(command: UpdateCommentLikeCommand): Promise<void> {
    const { commentId, dto } = command;

    const comment = await this.commentsRepository.findOne(commentId);

    if (!comment) {
      throw new NotFoundException(`No such comment with id: ${commentId}`);
    }

    await this.commentsRepository.updateCommentLike(commentId, dto);
  }
}

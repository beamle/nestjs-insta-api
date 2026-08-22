import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { DeleteCommentCommand } from '../commands/delete-comment.command';
import { CommentsRepository } from '../../comments.repository';

@CommandHandler(DeleteCommentCommand)
export class DeleteCommentCommandHandler implements ICommandHandler<DeleteCommentCommand> {
  constructor(private readonly commentsRepository: CommentsRepository) {}

  async execute(command: DeleteCommentCommand): Promise<void> {
    const { commentId } = command;

    const comment = await this.commentsRepository.findOne(commentId);

    if (!comment) {
      throw new NotFoundException(`No such comment with id: ${commentId}`);
    }

    await this.commentsRepository.deleteComment(commentId);
  }
}

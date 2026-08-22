import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { UpdateCommentCommand } from '../commands/update-comment.command';
import { CommentsRepository } from '../../comments.repository';

@CommandHandler(UpdateCommentCommand)
export class UpdateCommentCommandHandler implements ICommandHandler<UpdateCommentCommand> {
  constructor(private readonly commentsRepository: CommentsRepository) {}

  async execute(command: UpdateCommentCommand): Promise<void> {
    const { commentId, content } = command;

    const comment = await this.commentsRepository.findOne(commentId);

    if (!comment) {
      throw new NotFoundException(`No such comment with id: ${commentId}`);
    }

    await this.commentsRepository.updateComment(commentId, content);
  }
}

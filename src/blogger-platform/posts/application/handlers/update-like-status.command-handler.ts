import { UpdateLikeStatusCommand } from '../commands/update-like-status.command';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsRepository } from '../../posts.repository';
import { NotFoundException } from '@nestjs/common';

@CommandHandler(UpdateLikeStatusCommand)
export class UpdateLikeStatusCommandHandler implements ICommandHandler<UpdateLikeStatusCommand> {
  constructor(private readonly postsRepository: PostsRepository) {}

  async execute(command: UpdateLikeStatusCommand): Promise<void> {
    const { postId, dto } = command;

    const updatedPost = await this.postsRepository.updateLikeStatus(postId, dto);

    if (!updatedPost) {
      throw new NotFoundException(`No such post with id: ${postId}`);
    }
  }
}

import { DeletePostCommand } from '../commands/delete-post.command';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsRepository } from '../../posts.repository';
import { NotFoundException } from '@nestjs/common';

@CommandHandler(DeletePostCommand)
export class DeletePostCommandHandler implements ICommandHandler<DeletePostCommand> {
  constructor(private readonly postsRepository: PostsRepository) {}

  async execute(command: DeletePostCommand): Promise<void> {
    const { postId } = command;

    const result = await this.postsRepository.remove(postId);

    if (result.deletedCount === 0) {
      throw new NotFoundException(`No such post with id: ${postId}`);
    }
  }
}

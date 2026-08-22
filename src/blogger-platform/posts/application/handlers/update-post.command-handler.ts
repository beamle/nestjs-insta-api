import { UpdatePostCommand } from '../commands/update-post.command';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsRepository } from '../../posts.repository';
import { NotFoundException } from '@nestjs/common';

@CommandHandler(UpdatePostCommand)
export class UpdatePostCommandHandler implements ICommandHandler<UpdatePostCommand> {
  constructor(private readonly postsRepository: PostsRepository) {}

  async execute(command: UpdatePostCommand): Promise<void> {
    const { postId, dto } = command;

    const post = await this.postsRepository.findOne(postId);

    if (!post) {
      throw new NotFoundException(`Post with id ${postId} not found`);
    }

    await this.postsRepository.update(postId, dto);
  }
}

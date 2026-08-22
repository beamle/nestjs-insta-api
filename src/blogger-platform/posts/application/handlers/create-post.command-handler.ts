import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreatePostCommand } from '../commands/create-post.command';
import { PostsRepository } from '../../posts.repository';
import { PostsMapper } from '../../mappers/posts.mapper';

@CommandHandler(CreatePostCommand)
export class CreatePostCommandHandler implements ICommandHandler<CreatePostCommand> {
  constructor(private readonly postsRepository: PostsRepository) {}

  async execute(command: CreatePostCommand) {
    const post = await this.postsRepository.create({
      ...command.dto,
      blogId: command.dto.blogId,
      blogName: command.dto.blogName,
    });

    return PostsMapper.toViewModel(post);
  }
}

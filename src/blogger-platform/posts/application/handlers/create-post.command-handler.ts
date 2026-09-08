import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreatePostCommand } from '../commands/create-post.command';
import { NotFoundException } from '@nestjs/common';
import { PostsRepository } from '../../posts.repository';
import { PostsMapper } from '../../mappers/posts.mapper';
import { BlogsRepository } from '../../../blogs/blogs.repository';

@CommandHandler(CreatePostCommand)
export class CreatePostCommandHandler implements ICommandHandler<CreatePostCommand> {
  constructor(
    private readonly postsRepository: PostsRepository,
    private readonly blogsRepository: BlogsRepository,
  ) {}

  async execute(command: CreatePostCommand) {
    const blog = await this.blogsRepository.findOne(command.dto.blogId);

    if (!blog) {
      throw new NotFoundException(
        `No such blog with id: ${command.dto.blogId}`,
      );
    }

    const post = await this.postsRepository.create({
      ...command.dto,
      blogId: command.dto.blogId,
      blogName: blog.name,
    });

    return PostsMapper.toViewModel(post);
  }
}

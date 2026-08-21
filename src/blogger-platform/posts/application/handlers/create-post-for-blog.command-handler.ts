import { NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreatePostForBlogCommand } from '../commands/create-post-for-blog.command';
import { PostsMapper } from '../../mappers/posts.mapper';
import { BlogsRepository } from '../../../blogs/blogs.repository';
import { PostsRepository } from '../../posts.repository';
import { PostViewModel } from '../../view-models/post.view-model';

@CommandHandler(CreatePostForBlogCommand)
export class CreatePostForBlogCommandHandler implements ICommandHandler<CreatePostForBlogCommand> {
  constructor(
    private readonly postsRepository: PostsRepository,
    private readonly blogsRepository: BlogsRepository,
  ) {}

  async execute(command: CreatePostForBlogCommand): Promise<PostViewModel> {
    const { blogId, dto } = command;
    const blog = await this.blogsRepository.findOne(blogId);

    if (!blog) {
      throw new NotFoundException(`No such blog with id: ${blogId}`);
    }

    const post = await this.postsRepository.create({
      ...dto,
      blogId,
      blogName: blog.name,
    });

    return PostsMapper.toViewModel(post);
  }
}

import { NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreatePostForBlogCommand } from '../commands/create-post-for-blog.command';
import { PostsMapper } from '../../mappers/posts.mapper';
import { BlogsRepository } from '../../../blogs/blogs.repository';
import { PostsRepository } from '../../posts.repository';
import { PostViewModel } from '../../view-models/post.view-model';
import { GetAllPostsDto } from '../../dto/get-all-posts.dto';
import { FindAllPostsByBlogCommand } from '../commands/find-all-posts-by-blog.command';

@CommandHandler(FindAllPostsByBlogCommand)
export class FindAllPostsByBlogCommandHandler implements ICommandHandler<FindAllPostsByBlogCommand> {
  constructor(
    private readonly postsRepository: PostsRepository,
    private readonly blogsRepository: BlogsRepository,
  ) {}

  async execute(command: FindAllPostsByBlogCommand) {
    const { blogId, dto } = command;
    const blog = await this.blogsRepository.findOne(blogId);

    if (!blog) {
      throw new NotFoundException(`No such blog with id: ${blogId}`);
    }

    const pageNumber = Number(dto.pageNumber ?? 1);
    const pageSize = Number(dto.pageSize ?? 10);
    const { items, totalCount } = await this.postsRepository.findAll(
      {
        sortBy: dto.sortBy ?? 'createdAt',
        sortDirection: dto.sortDirection ?? 'desc',
        pageNumber,
        pageSize,
      },
      blogId,
    );

    return {
      pagesCount: totalCount > 0 ? Math.ceil(totalCount / pageSize) : 0,
      page: pageNumber,
      pageSize,
      totalCount,
      items: items.map((item) => PostsMapper.toViewModel(item)),
    };
  }
}

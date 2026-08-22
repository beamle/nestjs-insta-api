import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateBlogCommand } from '../commands/create-blog.command';
import { BlogsRepository } from '../../blogs.repository';
import { BlogMapper } from '../../mappers/blogs.mapper';

@CommandHandler(CreateBlogCommand)
export class CreateBlogCommandHandler implements ICommandHandler<CreateBlogCommand> {
  constructor(private readonly blogsRepository: BlogsRepository) {}

  async execute(command: CreateBlogCommand) {
    const { dto } = command;
    const blog = await this.blogsRepository.create(dto);
    return BlogMapper.toViewModel(blog);
  }
}

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateBlogCommand } from '../commands/update-blog.command';
import { BlogsRepository } from '../../blogs.repository';
import { NotFoundException } from '@nestjs/common';

@CommandHandler(UpdateBlogCommand)
export class UpdateBlogCommandHandler implements ICommandHandler<UpdateBlogCommand> {
  constructor(private readonly blogsRepository: BlogsRepository) {}

  async execute(command: UpdateBlogCommand): Promise<void> {
    const { id, dto } = command;
    
    const updatedBlog = await this.blogsRepository.update(id, dto);
    
    if (!updatedBlog) {
      throw new NotFoundException(`No such blog with id: ${id}`);
    }
  }
}

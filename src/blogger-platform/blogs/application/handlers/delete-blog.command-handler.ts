import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DeleteBlogCommand } from '../commands/delete-blog.command';
import { BlogsRepository } from '../../blogs.repository';
import { NotFoundException } from '@nestjs/common';

@CommandHandler(DeleteBlogCommand)
export class DeleteBlogCommandHandler implements ICommandHandler<DeleteBlogCommand> {
  constructor(private readonly blogsRepository: BlogsRepository) {}

  async execute(command: DeleteBlogCommand): Promise<void> {
    const { id } = command;
    
    const result = await this.blogsRepository.remove(id);

    if (result.deletedCount === 0) {
      throw new NotFoundException(`No such blog with id: ${id}`);
    }
  }
}

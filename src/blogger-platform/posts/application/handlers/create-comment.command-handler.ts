import { CreateCommentCommand } from '../commands/create-comment.command';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsRepository } from '../../posts.repository';
import { CommentsRepository } from '../../../comments/comments.repository';
import { NotFoundException } from '@nestjs/common';
import { CommentsMapper } from '../../../comments/mappers/comments.mapper';

@CommandHandler(CreateCommentCommand)
export class CreateCommentCommandHandler implements ICommandHandler<CreateCommentCommand> {
  constructor(
    private readonly postsRepository: PostsRepository,
    private readonly commentsRepository: CommentsRepository,
  ) {}

  async execute(command: CreateCommentCommand) {
    const post = await this.postsRepository.findOne(command.postId);

    if (!post) {
      throw new NotFoundException(`No such post with id: ${command.postId}`);
    }

    // TODO current user in controller to implement
    const comment = await this.commentsRepository.create(
      {
        ...command.dto,
        commentatorInfo: { userId: 'someUserId', userLogin: 'someUserLogin' }, //
      },
      command.postId,
    );

    return CommentsMapper.toViewModel(comment);
  }
}

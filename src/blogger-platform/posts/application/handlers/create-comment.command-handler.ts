import { CreateCommentCommand } from '../commands/create-comment.command';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsRepository } from '../../posts.repository';
import { CommentsRepository } from '../../../comments/comments.repository';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CommentsMapper } from '../../../comments/mappers/comments.mapper';
import { UsersRepository } from '../../../../user-accounts/users/users.repository';

@CommandHandler(CreateCommentCommand)
export class CreateCommentCommandHandler implements ICommandHandler<CreateCommentCommand> {
  constructor(
    private readonly postsRepository: PostsRepository,
    private readonly commentsRepository: CommentsRepository,
    private readonly usersRepository: UsersRepository,
  ) {}

  async execute(command: CreateCommentCommand) {
    const post = await this.postsRepository.findOne(command.postId);

    if (!post) {
      throw new NotFoundException(`No such post with id: ${command.postId}`);
    }

    const user = await this.usersRepository.findOne(command.userId);

    if (!user) {
      throw new UnauthorizedException();
    }

    const commentatorInfo = {
      userId: user._id.toString(),
      userLogin: user.login,
    };

    const comment = await this.commentsRepository.create(
      {
        ...command.dto,
        commentatorInfo,
      },
      command.postId,
    );

    return CommentsMapper.toViewModel(comment);
  }
}

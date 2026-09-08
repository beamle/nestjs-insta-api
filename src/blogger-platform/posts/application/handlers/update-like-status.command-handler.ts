import { UpdateLikeStatusCommand } from '../commands/update-like-status.command';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsRepository } from '../../posts.repository';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { UsersRepository } from '../../../../user-accounts/users/users.repository';

@CommandHandler(UpdateLikeStatusCommand)
export class UpdateLikeStatusCommandHandler implements ICommandHandler<UpdateLikeStatusCommand> {
  constructor(
    private readonly postsRepository: PostsRepository,
    private readonly usersRepository: UsersRepository,
  ) {}

  async execute(command: UpdateLikeStatusCommand): Promise<void> {
    const { postId, dto, userId } = command;

    const user = await this.usersRepository.findOne(userId);

    if (!user) {
      throw new UnauthorizedException();
    }

    const updatedPost = await this.postsRepository.updateLikeStatus(
      postId,
      userId,
      user.login,
      dto,
    );

    if (!updatedPost) {
      throw new NotFoundException(`No such post with id: ${postId}`);
    }
  }
}

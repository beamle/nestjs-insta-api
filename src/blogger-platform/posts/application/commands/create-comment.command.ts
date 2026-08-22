import { CreateCommentDto } from '../../../comments/dto/create-comment.dto';

export class CreateCommentCommand {
  constructor(
    public readonly postId: string,
    public readonly dto: CreateCommentDto,
  ) {}
}

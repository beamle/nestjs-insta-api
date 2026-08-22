import { LikeStatusDto } from '../../../posts/dto/like-status.dto';

export class UpdateCommentLikeCommand {
  constructor(
    public readonly commentId: string,
    public readonly dto: LikeStatusDto,
  ) {}
}

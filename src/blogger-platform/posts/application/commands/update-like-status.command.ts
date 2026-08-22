import { LikeStatusDto } from '../../dto/like-status.dto';

export class UpdateLikeStatusCommand {
  constructor(
    public readonly postId: string,
    public readonly dto: LikeStatusDto,
  ) {}
}

import { UpdatePostDto } from '../../dto/update-post.dto';

export class UpdatePostCommand {
  constructor(
    public readonly postId: string,
    public readonly dto: UpdatePostDto,
  ) {}
}

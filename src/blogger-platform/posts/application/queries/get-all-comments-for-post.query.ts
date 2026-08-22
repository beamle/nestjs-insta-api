import { GetAllCommentsDto } from '../../../comments/dto/get-all-comments.dto';

export class GetAllCommentsForPostQuery {
  constructor(
    public readonly postId: string,
    public readonly dto: GetAllCommentsDto,
  ) {}
}
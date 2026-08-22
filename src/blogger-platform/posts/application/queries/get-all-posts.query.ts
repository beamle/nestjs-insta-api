import { GetAllPostsDto } from '../../dto/get-all-posts.dto';

export class GetAllPostsQuery {
  constructor(public readonly dto: GetAllPostsDto) {}
}

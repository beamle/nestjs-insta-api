import { GetAllPostsDto } from '../../dto/get-all-posts.dto';

export class FindAllPostsByBlogCommand {
  constructor(public readonly dto: GetAllPostsDto) {}
}

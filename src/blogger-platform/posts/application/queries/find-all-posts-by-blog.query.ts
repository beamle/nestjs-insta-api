import { GetAllPostsDto } from '../../dto/get-all-posts.dto';

export class FindAllPostsByBlogQuery {
  constructor(
    public readonly blogId: string,
    public readonly dto: GetAllPostsDto,
  ) {}
}

import { CreatePostForBlogDto } from '../../dto/create-post-for-blog.dto';

export class CreatePostForBlogCommand {
  constructor(
    public readonly blogId: string,
    public readonly dto: CreatePostForBlogDto,
  ) {}
}

import { UpdateBlogDto } from '../../dto/update-blog.dto';

export class UpdateBlogCommand {
  constructor(
    public readonly id: string,
    public readonly dto: UpdateBlogDto,
  ) {
  }
}

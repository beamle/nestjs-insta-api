import { CreateBlogDto } from '../../dto/create-blog.dto';

export class CreateBlogCommand {
  constructor(public readonly dto: CreateBlogDto) {
  }
}

import { BlogsQueryDto } from '../../dto/get-all-blogs.dto';

export class GetAllBlogsQuery {
  constructor(public readonly dto: BlogsQueryDto) {}
}

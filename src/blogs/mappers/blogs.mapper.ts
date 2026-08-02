import { BlogDocument } from '../schema/blog.schema';
import { BlogViewModel } from '../view-models/blog.view-model';

export class BlogMapper {
  static toViewModel(blog: BlogDocument): BlogViewModel {
    return {
      id: blog._id.toString(),
      name: blog.name,
      description: blog.description,
      websiteUrl: blog.websiteUrl,
      createdAt: blog.createdAt,
      isMembership: blog.isMembership,
    };
  }
}

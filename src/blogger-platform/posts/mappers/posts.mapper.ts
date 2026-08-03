import { PostDocument } from '../schema/post.schema';
import { PostViewModel } from '../view-models/post.view-model';

export class PostsMapper {
  static toViewModel(post: PostDocument): PostViewModel {
    return {
      id: post._id.toString(),
      title: post.title,
      shortDescription: post.shortDescription,
      content: post.content,
      blogId: post.blogId,
      blogName: post.blogName,
      createdAt: post.createdAt,
      extendedLikesInfo: {
        likesCount: post.extendedLikesInfo.likesCount,
        dislikesCount: post.extendedLikesInfo.dislikesCount,
        myStatus: post.extendedLikesInfo.myStatus,
        newestLikes: post.extendedLikesInfo.newestLikes.map((like) => ({
          addedAt: like.addedAt,
          userId: like.userId,
          login: like.login,
        })),
      },
    };
  }
}

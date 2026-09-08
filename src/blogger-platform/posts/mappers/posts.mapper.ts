import { PostDocument } from '../schema/post.schema';
import { PostViewModel } from '../view-models/post.view-model';

export class PostsMapper {
  static toViewModel(
    post: PostDocument,
    currentUserId?: string,
  ): PostViewModel {
    const likes = post.likes ?? [];
    const newestLikes = post.extendedLikesInfo.newestLikes ?? [];

    const currentUserLike =
      currentUserId != null
        ? likes.find((like) => like.userId === currentUserId)
        : undefined;

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
        myStatus: currentUserLike?.status ?? 'None',
        newestLikes: newestLikes.map((like) => ({
          addedAt: like.addedAt,
          userId: like.userId,
          login: like.login,
        })),
      },
    };
  }
}

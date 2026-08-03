import { CommentDocument } from '../schema/comment.schema';
import { CommentViewModel } from '../view-models/comment.view-model';

export class CommentsMapper {
  static toViewModel(comment: CommentDocument): CommentViewModel {
    return {
      id: comment._id.toString(),
      content: comment.content,
      commentatorInfo: {
        userId: comment.commentatorInfo.userId,
        userLogin: comment.commentatorInfo.userLogin,
      },
      createdAt: comment.createdAt,
      likesInfo: {
        likesCount: comment.likesInfo.likesCount,
        dislikesCount: comment.likesInfo.dislikesCount,
        myStatus: comment.likesInfo.myStatus,
      },
    };
  }
}

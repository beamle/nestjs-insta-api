import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { Comment, CommentDocument } from './schema/comment.schema';
import { GetAllCommentsDto } from './dto/get-all-comments.dto';
import { toObjectId } from '../../helpers/helpers';
import { LikeStatusDto } from '../posts/dto/like-status.dto';

@Injectable()
export class CommentsRepository {
  constructor(
    @InjectModel(Comment.name)
    private readonly commentModel: Model<CommentDocument>,
  ) {}

  async create(
    comment: {
      content: string;
      commentatorInfo: { userId: string; userLogin: string };
    },
    postId: string,
  ) {
    const entity = new this.commentModel({
      ...comment,
      postId,
      createdAt: new Date(),
      likesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: 'None',
      },
    });

    return await entity.save();
  }

  async findAllByPost(postId: string, query: GetAllCommentsDto) {
    const pageNumber = Number(query.pageNumber ?? 1);
    const pageSize = Number(query.pageSize ?? 10);
    const filter = { postId };

    const totalCount = await this.commentModel.countDocuments(filter);
    const items = await this.commentModel
      .find(filter)
      .sort({ createdAt: -1 })
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize)
      .lean()
      .exec();

    return {
      items,
      totalCount,
    };
  }

  async findOne(id: string) {
    return this.commentModel.findById(toObjectId(id)).exec();
  }

  async updateCommentLike(
    commentId: string,
    userId: string,
    likeStatusDto: LikeStatusDto,
  ) {
    const comment = await this.commentModel
      .findById(toObjectId(commentId))
      .exec();

    if (!comment) {
      return null;
    }

    if (!Array.isArray(comment.likes)) {
      comment.likes = [];
    }

    const previousLike = comment.likes.find((like) => like.userId === userId);
    const previousStatus = previousLike?.status ?? 'None';
    const nextStatus = likeStatusDto.likeStatus;

    if (previousStatus === nextStatus) {
      return comment;
    }

    if (previousStatus === 'Like') {
      comment.likesInfo.likesCount = Math.max(
        0,
        comment.likesInfo.likesCount - 1,
      );
    }

    if (previousStatus === 'Dislike') {
      comment.likesInfo.dislikesCount = Math.max(
        0,
        comment.likesInfo.dislikesCount - 1,
      );
    }

    if (nextStatus === 'None') {
      comment.likes = comment.likes.filter((like) => like.userId !== userId);
    } else {
      const now = new Date();

      if (previousLike) {
        previousLike.status = nextStatus;
        previousLike.addedAt = now;
      } else {
        comment.likes.push({ userId, status: nextStatus, addedAt: now });
      }

      if (nextStatus === 'Like') {
        comment.likesInfo.likesCount += 1;
      }

      if (nextStatus === 'Dislike') {
        comment.likesInfo.dislikesCount += 1;
      }
    }

    comment.likesInfo.myStatus = 'None';

    return comment.save();
  }

  async updateComment(commentId: string, content: string) {
    return this.commentModel
      .findByIdAndUpdate(
        toObjectId(commentId),
        { $set: { content } },
        { new: true },
      )
      .exec();
  }

  async deleteComment(commentId: string) {
    return this.commentModel.findByIdAndDelete(toObjectId(commentId)).exec();
  }
}

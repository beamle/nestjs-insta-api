import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { Comment, CommentDocument } from './schema/comment.schema';
import { GetAllCommentsDto } from './dto/get-all-comments.dto';
import { toObjectId } from '../../helpers/helpers';

@Injectable()
export class CommentsRepository {
  constructor(
    @InjectModel(Comment.name)
    private readonly commentModel: Model<CommentDocument>,
  ) {
  }

  async create(comment: {
    postId: string;
    content: string;
    commentatorInfo: { userId: string; userLogin: string };
  }) {
    const entity = new this.commentModel({
      ...comment,
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
}

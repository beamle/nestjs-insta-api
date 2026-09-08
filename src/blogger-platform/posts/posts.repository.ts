import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { Post, PostDocument } from './schema/post.schema';
import { CreatePostDto } from './dto/create-post.dto';
import { GetAllPostsDto } from './dto/get-all-posts.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { toObjectId } from '../../helpers/helpers';
import { LikeStatusDto } from './dto/like-status.dto';
import { GetAllCommentsDto } from '../comments/dto/get-all-comments.dto';

@Injectable()
export class PostsRepository {
  constructor(
    @InjectModel(Post.name)
    private readonly postModel: Model<PostDocument>,
  ) {}

  async create(createPostDto: CreatePostDto & { blogName?: string }) {
    const post = new this.postModel({
      ...createPostDto,
      createdAt: new Date(),
      extendedLikesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: 'None',
        newestLikes: [],
      },
    });

    return await post.save();
  }

  async findAll(query: GetAllPostsDto, blogId?: string) {
    const pageNumber = Number(query.pageNumber ?? 1);
    const pageSize = Number(query.pageSize ?? 10);
    const sortBy = query.sortBy ?? 'createdAt';
    const sortDirection = query.sortDirection ?? 'desc';
    const filter = blogId ? { blogId } : {};

    const totalCount = await this.postModel.countDocuments(filter);
    const items = await this.postModel
      .find(filter)
      .sort({ [sortBy]: sortDirection === 'asc' ? 1 : -1 })
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
    return this.postModel.findById(toObjectId(id)).exec();
  }

  async findAllComments(query: GetAllCommentsDto, postId: string) {
    const pageNumber = Number(query.pageNumber ?? 1);
    const pageSize = Number(query.pageSize ?? 10);
    const sortBy = query.sortBy ?? 'createdAt';
    const sortDirection = query.sortDirection ?? 'desc';
    const filter = { postId };

    const totalCount = await this.postModel.countDocuments(filter);
    const items = await this.postModel
      .find(filter)
      .sort({ [sortBy]: sortDirection === 'asc' ? 1 : -1 })
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize)
      .lean()
      .exec();

    return {
      items,
      totalCount,
    };
  }

  async update(id: string, updatePostDto: UpdatePostDto) {
    return this.postModel
      .findByIdAndUpdate(toObjectId(id), updatePostDto, {
        returnDocument: 'after',
      })
      .exec();
  }

  remove(id: string) {
    return this.postModel.deleteOne({ _id: toObjectId(id) }).exec();
  }

  async updateLikeStatus(
    postId: string,
    userId: string,
    userLogin: string,
    likeStatusDto: LikeStatusDto,
  ) {
    const post = await this.postModel.findById(toObjectId(postId)).exec();

    if (!post) {
      return null;
    }

    if (!Array.isArray(post.likes)) {
      post.likes = [];
    }

    const previousLike = post.likes.find((like) => like.userId === userId);
    const previousStatus = previousLike?.status ?? 'None';
    const nextStatus = likeStatusDto.likeStatus;

    if (previousStatus === nextStatus) {
      return post;
    }

    if (previousStatus === 'Like') {
      post.extendedLikesInfo.likesCount = Math.max(
        0,
        post.extendedLikesInfo.likesCount - 1,
      );
    }

    if (previousStatus === 'Dislike') {
      post.extendedLikesInfo.dislikesCount = Math.max(
        0,
        post.extendedLikesInfo.dislikesCount - 1,
      );
    }

    if (nextStatus === 'None') {
      post.likes = post.likes.filter((like) => like.userId !== userId);
    } else {
      const now = new Date();

      if (previousLike) {
        previousLike.status = nextStatus;
        previousLike.login = userLogin;
        previousLike.addedAt = now;
      } else {
        post.likes.push({
          userId,
          login: userLogin,
          status: nextStatus,
          addedAt: now,
        });
      }

      if (nextStatus === 'Like') {
        post.extendedLikesInfo.likesCount += 1;
      }

      if (nextStatus === 'Dislike') {
        post.extendedLikesInfo.dislikesCount += 1;
      }
    }

    post.extendedLikesInfo.myStatus = 'None';
    post.extendedLikesInfo.newestLikes = post.likes
      .filter((like) => like.status === 'Like')
      .sort((a, b) => b.addedAt.getTime() - a.addedAt.getTime())
      .slice(0, 3)
      .map((like) => ({
        addedAt: like.addedAt,
        userId: like.userId,
        login: like.login,
      }));

    return post.save();
  }
}

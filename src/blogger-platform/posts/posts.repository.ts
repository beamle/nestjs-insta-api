import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { Post, PostDocument } from './schema/post.schema';
import { CreatePostDto } from './dto/create-post.dto';
import { GetAllPostsDto } from './dto/get-all-posts.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { toObjectId } from '../../helpers/helpers';
import { LikeStatusDto } from './dto/like-status.dto';

@Injectable()
export class PostsRepository {
  constructor(
    @InjectModel(Post.name)
    private readonly postModel: Model<PostDocument>,
  ) {}

  async create(createPostDto: CreatePostDto & { blogName: string }) {
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

  async updateLikeStatus(postId: string, likeStatusDto: LikeStatusDto) {
    return this.postModel
      .findByIdAndUpdate(
        toObjectId(postId),
        { $set: { 'extendedLikesInfo.myStatus': likeStatusDto.likeStatus } },
        { returnDocument: 'after' },
      )
      .exec();
  }
}

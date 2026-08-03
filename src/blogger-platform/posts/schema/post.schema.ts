import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({ _id: false })
export class NewestLike {
  @Prop({ required: true })
  addedAt: Date;

  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  login: string;
}

export const NewestLikeSchema = SchemaFactory.createForClass(NewestLike);

@Schema({ _id: false })
export class ExtendedLikesInfo {
  @Prop({ default: 0 })
  likesCount: number;

  @Prop({ default: 0 })
  dislikesCount: number;

  @Prop({ default: 'None' })
  myStatus: 'None' | 'Like' | 'Dislike';

  @Prop({ type: [NewestLikeSchema], default: [] })
  newestLikes: NewestLike[];
}

export const ExtendedLikesInfoSchema =
  SchemaFactory.createForClass(ExtendedLikesInfo);

@Schema()
export class Post {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  shortDescription: string;

  @Prop({ required: true })
  content: string;

  @Prop({ required: true })
  blogId: string;

  @Prop({ required: true })
  blogName: string;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({
    type: ExtendedLikesInfoSchema,
    default: () => ({
      likesCount: 0,
      dislikesCount: 0,
      myStatus: 'None',
      newestLikes: [],
    }),
  })
  extendedLikesInfo: ExtendedLikesInfo;
}

export type PostDocument = HydratedDocument<Post>;

export const PostSchema = SchemaFactory.createForClass(Post);

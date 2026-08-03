import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  login: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  password: string;

  createdAt: Date;

  updatedAt: Date;

  static createInstance(dto: {
    login: string;
    password: string;
    email: string;
  }): User {
    const user = new User();
    user.login = dto.login;
    user.password = dto.password;
    user.email = dto.email;
    return user;
  }
}

export type UserDocument = HydratedDocument<User>;

export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.loadClass(User);

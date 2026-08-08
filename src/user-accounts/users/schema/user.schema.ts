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

  @Prop({ type: Boolean, required: false, default: false })
  isEmailConfirmed: boolean;

  @Prop({ type: String, required: false, default: null })
  confirmationCode: string | null;

  @Prop({ type: Date, required: false, default: null })
  confirmationCodeExpiresAt: Date | null;

  createdAt: Date;

  updatedAt: Date;

  static createInstance(dto: {
    login: string;
    password: string;
    email: string;
    isEmailConfirmed?: boolean;
    confirmationCode?: string | null;
    confirmationCodeExpiresAt?: Date | null;
  }): User {
    const user = new User();
    user.login = dto.login;
    user.password = dto.password;
    user.email = dto.email;
    user.isEmailConfirmed = dto.isEmailConfirmed ?? false;
    user.confirmationCode = dto.confirmationCode ?? null;
    user.confirmationCodeExpiresAt = dto.confirmationCodeExpiresAt ?? null;
    return user;
  }
}

export type UserDocument = HydratedDocument<User>;

export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.loadClass(User);

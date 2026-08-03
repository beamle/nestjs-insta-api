import { UserDocument } from '../schema/user.schema';
import { UserViewModel } from '../view-models/user.view-model';

export class UsersMapper {
  static toViewModel(user: UserDocument): UserViewModel {
    return {
      id: user._id.toString(),
      login: user.login,
      email: user.email,
      createdAt: user.createdAt,
    };
  }
}

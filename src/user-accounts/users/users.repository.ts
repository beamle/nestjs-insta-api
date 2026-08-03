import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { User, UserDocument } from './schema/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { GetAllUsersDto } from './dto/get-all-users.dto';
import { toObjectId } from '../../helpers/helpers';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) {
  }

  async create(createUserDto: CreateUserDto) {
    const user = new this.userModel(User.createInstance(createUserDto));

    return await user.save();
  }

  async findAll(query: GetAllUsersDto) {
    const pageNumber = Number(query.pageNumber ?? 1);
    const pageSize = Number(query.pageSize ?? 10);
    const sortBy = query.sortBy ?? 'createdAt';
    const sortDirection = query.sortDirection ?? 'desc';
    type UserSearchFilter = {
      login?: { $regex: string; $options: 'i' };
      email?: { $regex: string; $options: 'i' };
    };

    const filterParts: UserSearchFilter[] = [];

    if (query.searchLoginTerm) {
      filterParts.push({
        login: { $regex: query.searchLoginTerm, $options: 'i' },
      });
    }

    if (query.searchEmailTerm) {
      filterParts.push({
        email: { $regex: query.searchEmailTerm, $options: 'i' },
      });
    }

    const filter = filterParts.length > 0 ? { $or: filterParts } : {};
    const totalCount = await this.userModel.countDocuments(filter);
    const items = await this.userModel
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
    return this.userModel.findById(toObjectId(id)).exec();
  }

  remove(id: string) {
    return this.userModel.deleteOne({ _id: toObjectId(id) }).exec();
  }
}

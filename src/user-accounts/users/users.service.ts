import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { GetAllUsersDto } from './dto/get-all-users.dto';
import { UsersRepository } from './users.repository';
import { UsersMapper } from './mappers/users.mapper';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {
  }

  async create(createUserDto: CreateUserDto) {
    const user = await this.usersRepository.create(createUserDto);
    return UsersMapper.toViewModel(user);
  }

  async findAll(query: GetAllUsersDto) {
    const pageNumber = Number(query.pageNumber ?? 1);
    const pageSize = Number(query.pageSize ?? 10);
    const { items, totalCount } = await this.usersRepository.findAll({
      ...query,
      pageNumber,
      pageSize,
    });

    return {
      pagesCount: totalCount > 0 ? Math.ceil(totalCount / pageSize) : 0,
      page: pageNumber,
      pageSize,
      totalCount,
      items: items.map((item) => UsersMapper.toViewModel(item)),
    };
  }

  async remove(id: string) {
    const result = await this.usersRepository.remove(id);

    if (result.deletedCount === 0) {
      throw new NotFoundException(`No such user with id: ${id}`);
    }
  }
}

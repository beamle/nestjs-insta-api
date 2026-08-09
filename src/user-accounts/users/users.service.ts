import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { GetAllUsersDto } from './dto/get-all-users.dto';
import { UsersRepository } from './users.repository';
import { UsersMapper } from './mappers/users.mapper';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {
  }

  async create(createUserDto: CreateUserDto) {
    const [loginUser, emailUser] = await Promise.all([
      this.usersRepository.findByLogin(createUserDto.login),
      this.usersRepository.findByEmail(createUserDto.email),
    ]);

    const errorsMessages: Array<{ message: string; field: string }> = [];

    if (loginUser) {
      errorsMessages.push({ field: 'login', message: 'login already exists' });
    }

    if (emailUser) {
      errorsMessages.push({ field: 'email', message: 'email already exists' });
    }

    if (errorsMessages.length > 0) {
      throw new BadRequestException({ errorsMessages });
    }

    const user = await this.usersRepository.create({
      ...createUserDto,
      isEmailConfirmed: true,
      confirmationCode: null,
      confirmationCodeExpiresAt: null,
    });
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

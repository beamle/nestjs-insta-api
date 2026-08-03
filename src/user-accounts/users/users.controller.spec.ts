import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { GetAllUsersDto } from './dto/get-all-users.dto';
import { NotFoundException } from '@nestjs/common';

describe('UsersController', () => {
  let controller: UsersController;

  const mockUser = {
    id: 'user-id',
    login: 'B73',
    email: 'example@example.dev',
    createdAt: new Date('2026-08-03T07:46:55.035Z'),
  };

  const mockUsersService = {
    create: jest.fn(),
    findAll: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    jest.clearAllMocks();
  });

  it('should create a user', async () => {
    const dto: CreateUserDto = {
      login: 'B73',
      password: 'string',
      email: 'example@example.dev',
    };

    mockUsersService.create.mockResolvedValue(mockUser);

    await expect(controller.create(dto)).resolves.toEqual(mockUser);
    expect(mockUsersService.create).toHaveBeenCalledWith(dto);
  });

  it('should return all users', async () => {
    const query: GetAllUsersDto = {
      sortBy: 'createdAt',
      sortDirection: 'desc',
      pageNumber: 1,
      pageSize: 10,
      searchLoginTerm: undefined,
      searchEmailTerm: undefined,
    };
    const result = {
      pagesCount: 1,
      page: 1,
      pageSize: 10,
      totalCount: 1,
      items: [mockUser],
    };

    mockUsersService.findAll.mockResolvedValue(result);

    await expect(controller.findAll(query)).resolves.toEqual(result);
  });

  it('should delete a user', async () => {
    mockUsersService.remove.mockResolvedValue(undefined);

    await expect(controller.remove('user-id')).resolves.toBeUndefined();
  });

  it('should propagate not found errors', async () => {
    mockUsersService.remove.mockRejectedValue(
      new NotFoundException('No such user with id: user-id'),
    );

    await expect(controller.remove('user-id')).rejects.toThrow(
      NotFoundException,
    );
  });
});

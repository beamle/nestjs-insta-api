import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';

describe('UsersService', () => {
  let service: UsersService;

  const mockUsersRepository = {
    create: jest.fn(),
    findByLogin: jest.fn(),
    findByEmail: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: UsersRepository,
          useValue: mockUsersRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('creates a user when login and email are unique', async () => {
    mockUsersRepository.findByLogin.mockResolvedValue(null);
    mockUsersRepository.findByEmail.mockResolvedValue(null);
    mockUsersRepository.create.mockResolvedValue({
      _id: { toString: () => 'user-id' },
      login: 'B73',
      email: 'example@example.dev',
      createdAt: new Date('2026-08-03T07:46:55.035Z'),
    });

    const result = await service.create({
      login: 'B73',
      password: 'string',
      email: 'example@example.dev',
    });

    expect(mockUsersRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        login: 'B73',
        password: 'string',
        email: 'example@example.dev',
        isEmailConfirmed: true,
      }),
    );
    expect(result).toEqual(
      expect.objectContaining({
        id: 'user-id',
        login: 'B73',
        email: 'example@example.dev',
      }),
    );
  });

  it('rejects duplicate login or email on create', async () => {
    mockUsersRepository.findByLogin.mockResolvedValue({ id: '1' });
    mockUsersRepository.findByEmail.mockResolvedValue({ id: '2' });

    await expect(
      service.create({
        login: 'B73',
        password: 'string',
        email: 'example@example.dev',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});

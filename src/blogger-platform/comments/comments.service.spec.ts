import { Test, TestingModule } from '@nestjs/testing';
import { CommentsService } from './comments.service';
import { CommentsRepository } from './comments.repository';
import { PostsRepository } from '../posts/posts.repository';

describe('CommentsService', () => {
  let service: CommentsService;

  const mockCommentsRepository = {
    create: jest.fn(),
    findAllByPost: jest.fn(),
    findOne: jest.fn(),
  };

  const mockPostsRepository = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentsService,
        {
          provide: CommentsRepository,
          useValue: mockCommentsRepository,
        },
        {
          provide: PostsRepository,
          useValue: mockPostsRepository,
        },
      ],
    }).compile();

    service = module.get<CommentsService>(CommentsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

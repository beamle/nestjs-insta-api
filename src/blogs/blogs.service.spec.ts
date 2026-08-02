import { Test, TestingModule } from '@nestjs/testing';
import { BlogsService } from './blogs.service';
import { BlogsRepository } from './blogs.repository';

describe('BlogsService', () => {
  let service: BlogsService;

  const mockBlogsRepository = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BlogsService,
        {
          provide: BlogsRepository,
          useValue: mockBlogsRepository,
        },
      ],
    }).compile();

    service = module.get<BlogsService>(BlogsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

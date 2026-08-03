import { Test, TestingModule } from '@nestjs/testing';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { GetAllPostsDto } from './dto/get-all-posts.dto';
import { NotFoundException } from '@nestjs/common';

describe('PostsController', () => {
  let controller: PostsController;

  const mockPost = {
    id: 'post-id',
    title: 'Post title',
    shortDescription: 'Short description',
    content: 'Content',
    blogId: 'blog-id',
    blogName: 'Blog name',
    createdAt: new Date('2026-08-03T07:03:27.410Z'),
    extendedLikesInfo: {
      likesCount: 0,
      dislikesCount: 0,
      myStatus: 'None' as const,
      newestLikes: [],
    },
  };

  const mockPostsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostsController],
      providers: [
        {
          provide: PostsService,
          useValue: mockPostsService,
        },
      ],
    }).compile();

    controller = module.get<PostsController>(PostsController);
    jest.clearAllMocks();
  });

  it('should create a post', async () => {
    const dto: CreatePostDto = {
      title: 'Post title',
      shortDescription: 'Short description',
      content: 'Content',
      blogId: 'blog-id',
    };

    mockPostsService.create.mockResolvedValue(mockPost);

    await expect(controller.create(dto)).resolves.toEqual(mockPost);
    expect(mockPostsService.create).toHaveBeenCalledWith(dto);
  });

  it('should return all posts', async () => {
    const query: GetAllPostsDto = { pageNumber: 1, pageSize: 10 };
    const result = {
      pagesCount: 1,
      page: 1,
      pageSize: 10,
      totalCount: 1,
      items: [mockPost],
    };

    mockPostsService.findAll.mockResolvedValue(result);

    await expect(controller.findAll(query)).resolves.toEqual(result);
    expect(mockPostsService.findAll).toHaveBeenCalledWith(query);
  });

  it('should return a single post', async () => {
    mockPostsService.findOne.mockResolvedValue(mockPost);

    await expect(controller.findOne('post-id')).resolves.toEqual(mockPost);
    expect(mockPostsService.findOne).toHaveBeenCalledWith('post-id');
  });

  it('should propagate not found errors', async () => {
    mockPostsService.findOne.mockRejectedValue(
      new NotFoundException('No such post with id: post-id'),
    );

    await expect(controller.findOne('post-id')).rejects.toThrow(
      NotFoundException,
    );
  });
});

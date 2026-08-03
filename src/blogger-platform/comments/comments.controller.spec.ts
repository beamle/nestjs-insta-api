import { Test, TestingModule } from '@nestjs/testing';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';
import { GetAllCommentsDto } from './dto/get-all-comments.dto';
import { NotFoundException } from '@nestjs/common';

describe('CommentsController', () => {
  let controller: CommentsController;

  const mockComment = {
    id: 'comment-id',
    content: 'Comment content',
    commentatorInfo: {
      userId: 'user-1',
      userLogin: 'tester',
    },
    createdAt: new Date('2026-08-03T07:03:27.410Z'),
    likesInfo: {
      likesCount: 0,
      dislikesCount: 0,
      myStatus: 'None' as const,
    },
  };

  const mockCommentsService = {
    findAllByPost: jest.fn(),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommentsController],
      providers: [
        {
          provide: CommentsService,
          useValue: mockCommentsService,
        },
      ],
    }).compile();

    controller = module.get<CommentsController>(CommentsController);
    jest.clearAllMocks();
  });

  it('should return comments for post', async () => {
    const query: GetAllCommentsDto = { pageNumber: 1, pageSize: 10 };
    const result = {
      pagesCount: 1,
      page: 1,
      pageSize: 10,
      totalCount: 1,
      items: [mockComment],
    };

    mockCommentsService.findAllByPost.mockResolvedValue(result);

    await expect(controller.findAllByPost('post-id', query)).resolves.toEqual(
      result,
    );
  });

  it('should return a comment by id', async () => {
    mockCommentsService.findOne.mockResolvedValue(mockComment);

    await expect(controller.findOne('comment-id')).resolves.toEqual(
      mockComment,
    );
  });

  it('should propagate not found errors', async () => {
    mockCommentsService.findOne.mockRejectedValue(
      new NotFoundException('No such comment with id: comment-id'),
    );

    await expect(controller.findOne('comment-id')).rejects.toThrow(
      NotFoundException,
    );
  });
});

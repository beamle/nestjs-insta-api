import { Test, TestingModule } from '@nestjs/testing';
import { BlogsController } from './blogs.controller';
import { BlogsService } from './blogs.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { BlogsQueryDto } from './dto/get-all-blogs.dto';
import { NotFoundException } from '@nestjs/common';

describe('BlogsController (Unit)', () => {
  let controller: BlogsController;

  const mockBlogViewModel = {
    id: '507f1f77bcf86cd799439011',
    name: 'Test Blog',
    description: 'Test Description',
    websiteUrl: 'https://example.com',
    createdAt: new Date('2024-01-01'),
    isMembership: false,
  };

  const mockBlogsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BlogsController],
      providers: [
        {
          provide: BlogsService,
          useValue: mockBlogsService,
        },
      ],
    }).compile();

    controller = module.get<BlogsController>(BlogsController);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a blog and return the created blog', async () => {
      const createBlogDto: CreateBlogDto = {
        name: 'New Blog',
        description: 'New Description',
        websiteUrl: 'https://newblog.com',
      };

      mockBlogsService.create.mockResolvedValue(mockBlogViewModel);

      const result = await controller.create(createBlogDto);

      expect(result).toEqual(mockBlogViewModel);
      expect(mockBlogsService.create).toHaveBeenCalledWith(createBlogDto);
      expect(mockBlogsService.create).toHaveBeenCalledTimes(1);
    });

    it('should propagate service errors when creating a blog', async () => {
      const createBlogDto: CreateBlogDto = {
        name: 'New Blog',
        description: 'New Description',
        websiteUrl: 'https://newblog.com',
      };

      const error = new Error('Database error');
      mockBlogsService.create.mockRejectedValue(error);

      await expect(controller.create(createBlogDto)).rejects.toThrow(error);
    });
  });

  describe('findAll', () => {
    it('should return a paginated list of blogs with default parameters', async () => {
      const query: BlogsQueryDto = {
        searchNameTerm: undefined,
        sortBy: 'createdAt',
        sortDirection: 'desc',
        pageNumber: 1,
        pageSize: 10,
      };

      const expectedResult = {
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 1,
        items: [mockBlogViewModel],
      };

      mockBlogsService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll(query);

      expect(result).toEqual(expectedResult);
      expect(mockBlogsService.findAll).toHaveBeenCalledWith(query);
      expect(mockBlogsService.findAll).toHaveBeenCalledTimes(1);
    });

    it('should handle search term in query', async () => {
      const query: BlogsQueryDto = {
        searchNameTerm: 'tech',
        sortBy: 'createdAt',
        sortDirection: 'desc',
        pageNumber: 1,
        pageSize: 10,
      };

      const expectedResult = {
        pagesCount: 0,
        page: 1,
        pageSize: 10,
        totalCount: 0,
        items: [],
      };

      mockBlogsService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll(query);

      expect(result).toEqual(expectedResult);
      expect(mockBlogsService.findAll).toHaveBeenCalledWith(query);
    });

    it('should handle different sorting directions', async () => {
      const queryAsc: BlogsQueryDto = {
        searchNameTerm: undefined,
        sortBy: 'name',
        sortDirection: 'asc',
        pageNumber: 1,
        pageSize: 10,
      };

      const expectedResult = {
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 1,
        items: [mockBlogViewModel],
      };

      mockBlogsService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll(queryAsc);

      expect(result).toEqual(expectedResult);
      expect(mockBlogsService.findAll).toHaveBeenCalledWith(queryAsc);
    });

    it('should handle pagination correctly on page 2', async () => {
      const query: BlogsQueryDto = {
        searchNameTerm: undefined,
        sortBy: 'createdAt',
        sortDirection: 'desc',
        pageNumber: 2,
        pageSize: 5,
      };

      const expectedResult = {
        pagesCount: 2,
        page: 2,
        pageSize: 5,
        totalCount: 10,
        items: [mockBlogViewModel],
      };

      mockBlogsService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll(query);

      expect(result).toEqual(expectedResult);
      expect(mockBlogsService.findAll).toHaveBeenCalledWith(query);
    });

    it('should return empty items when no blogs match the search', async () => {
      const query: BlogsQueryDto = {
        searchNameTerm: 'nonexistent',
        sortBy: 'createdAt',
        sortDirection: 'desc',
        pageNumber: 1,
        pageSize: 10,
      };

      const expectedResult = {
        pagesCount: 0,
        page: 1,
        pageSize: 10,
        totalCount: 0,
        items: [],
      };

      mockBlogsService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll(query);

      expect(result.items).toEqual([]);
      expect(result.totalCount).toBe(0);
    });
  });

  describe('findOne', () => {
    it('should return a blog by id', async () => {
      const blogId = '507f1f77bcf86cd799439011';

      mockBlogsService.findOne.mockResolvedValue(mockBlogViewModel);

      const result = await controller.findOne(blogId);

      expect(result).toEqual(mockBlogViewModel);
      expect(mockBlogsService.findOne).toHaveBeenCalledWith(blogId);
      expect(mockBlogsService.findOne).toHaveBeenCalledTimes(1);
    });

    it('should throw NotFoundException when blog is not found', async () => {
      const blogId = '507f1f77bcf86cd799439012';

      mockBlogsService.findOne.mockRejectedValue(
        new NotFoundException(`No such blog with id: ${blogId}`),
      );

      await expect(controller.findOne(blogId)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockBlogsService.findOne).toHaveBeenCalledWith(blogId);
    });

    it('should handle various valid MongoDB IDs', async () => {
      const validIds = [
        '507f1f77bcf86cd799439011',
        '000000000000000000000001',
        'aabbccddeeff00112233aabb',
      ];

      for (const id of validIds) {
        mockBlogsService.findOne.mockResolvedValue(mockBlogViewModel);

        const result = await controller.findOne(id);

        expect(result).toEqual(mockBlogViewModel);
        expect(mockBlogsService.findOne).toHaveBeenCalledWith(id);
      }
    });
  });

  describe('update', () => {
    it('should update a blog with all fields and return void', async () => {
      const blogId = '507f1f77bcf86cd799439011';
      const updateBlogDto: UpdateBlogDto = {
        name: 'Updated Blog',
        description: 'Updated Description',
        websiteUrl: 'https://updated.com',
      };

      mockBlogsService.update.mockResolvedValue(undefined);

      const result = await controller.update(blogId, updateBlogDto);

      expect(result).toBeUndefined();
      expect(mockBlogsService.update).toHaveBeenCalledWith(
        blogId,
        updateBlogDto,
      );
      expect(mockBlogsService.update).toHaveBeenCalledTimes(1);
    });

    it('should allow partial updates with only name', async () => {
      const blogId = '507f1f77bcf86cd799439011';
      const updateBlogDto: UpdateBlogDto = {
        name: 'Only Updated Name',
      };

      mockBlogsService.update.mockResolvedValue(undefined);

      await controller.update(blogId, updateBlogDto);

      expect(mockBlogsService.update).toHaveBeenCalledWith(
        blogId,
        updateBlogDto,
      );
    });

    it('should allow partial updates with only description', async () => {
      const blogId = '507f1f77bcf86cd799439011';
      const updateBlogDto: UpdateBlogDto = {
        description: 'Only Updated Description',
      };

      mockBlogsService.update.mockResolvedValue(undefined);

      await controller.update(blogId, updateBlogDto);

      expect(mockBlogsService.update).toHaveBeenCalledWith(
        blogId,
        updateBlogDto,
      );
    });

    it('should allow partial updates with only websiteUrl', async () => {
      const blogId = '507f1f77bcf86cd799439011';
      const updateBlogDto: UpdateBlogDto = {
        websiteUrl: 'https://newurl.com',
      };

      mockBlogsService.update.mockResolvedValue(undefined);

      await controller.update(blogId, updateBlogDto);

      expect(mockBlogsService.update).toHaveBeenCalledWith(
        blogId,
        updateBlogDto,
      );
    });

    it('should throw NotFoundException when updating non-existent blog', async () => {
      const blogId = '507f1f77bcf86cd799439012';
      const updateBlogDto: UpdateBlogDto = {
        name: 'Updated Blog',
      };

      mockBlogsService.update.mockRejectedValue(
        new NotFoundException(`No such blog with id: ${blogId}`),
      );

      await expect(controller.update(blogId, updateBlogDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockBlogsService.update).toHaveBeenCalledWith(
        blogId,
        updateBlogDto,
      );
    });

    it('should return HTTP 204 No Content on successful update', async () => {
      const blogId = '507f1f77bcf86cd799439011';
      const updateBlogDto: UpdateBlogDto = {
        name: 'Updated Blog',
      };

      mockBlogsService.update.mockResolvedValue(undefined);

      const result = await controller.update(blogId, updateBlogDto);

      expect(result).toBeUndefined();
    });
  });

  describe('remove', () => {
    it('should remove a blog', async () => {
      const blogId = '507f1f77bcf86cd799439011';

      mockBlogsService.remove.mockResolvedValue(undefined);

      const result = await controller.remove(blogId);

      expect(result).toBeUndefined();
      expect(mockBlogsService.remove).toHaveBeenCalledWith(blogId);
      expect(mockBlogsService.remove).toHaveBeenCalledTimes(1);
    });

    it('should throw NotFoundException when removing non-existent blog', async () => {
      const blogId = '507f1f77bcf86cd799439012';

      mockBlogsService.remove.mockRejectedValue(
        new NotFoundException(`No such blog with id: ${blogId}`),
      );

      await expect(controller.remove(blogId)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockBlogsService.remove).toHaveBeenCalledWith(blogId);
    });

    it('should handle deletion of multiple different blogs', async () => {
      const blogIds = [
        '507f1f77bcf86cd799439011',
        '507f1f77bcf86cd799439012',
        '507f1f77bcf86cd799439013',
      ];

      mockBlogsService.remove.mockResolvedValue(undefined);

      for (const id of blogIds) {
        const result = await controller.remove(id);
        expect(result).toBeUndefined();
        expect(mockBlogsService.remove).toHaveBeenCalledWith(id);
      }

      expect(mockBlogsService.remove).toHaveBeenCalledTimes(3);
    });

    it('should return HTTP 204 No Content on successful deletion', async () => {
      const blogId = '507f1f77bcf86cd799439011';

      mockBlogsService.remove.mockResolvedValue(undefined);

      const result = await controller.remove(blogId);

      expect(result).toBeUndefined();
    });
  });
});

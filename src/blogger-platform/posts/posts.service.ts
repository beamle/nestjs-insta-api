import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { CreatePostForBlogDto } from './dto/create-post-for-blog.dto';
import { GetAllPostsDto } from './dto/get-all-posts.dto';
import { PostsRepository } from './posts.repository';
import { BlogsRepository } from '../blogs/blogs.repository';
import { PostsMapper } from './mappers/posts.mapper';
import { UpdatePostDto } from './dto/update-post.dto';
import { LikeStatusDto } from './dto/like-status.dto';
import { GetAllCommentsDto } from '../comments/dto/get-all-comments.dto';
import { CommentsRepository } from '../comments/comments.repository';
import { CommentsMapper } from '../comments/mappers/comments.mapper';
import { CreateCommentDto } from '../comments/dto/create-comment.dto';

@Injectable()
export class PostsService {
  constructor(
    private readonly postsRepository: PostsRepository,
    private readonly blogsRepository: BlogsRepository,
    private readonly commentsRepository: CommentsRepository,
  ) {}

  async create(createPostDto: CreatePostDto) {
    return this.createForBlog(createPostDto.blogId, createPostDto);
  }

  async createNewComment(postId: string, createCommentDto: CreateCommentDto) {
    return this.createNewCommentForPost(postId, createCommentDto);
  }

  async createForBlog(blogId: string, createPostDto: CreatePostForBlogDto) {
    const blog = await this.blogsRepository.findOne(blogId);

    if (!blog) {
      throw new NotFoundException(`No such blog with id: ${blogId}`);
    }

    const post = await this.postsRepository.create({
      ...createPostDto,
      blogId,
      blogName: blog.name,
    });

    return PostsMapper.toViewModel(post);
  }

  async createNewCommentForPost(
    postId: string,
    createCommentDto: CreateCommentDto,
  ) {
    const post = await this.postsRepository.findOne(postId);

    if (!post) {
      throw new NotFoundException(`No such post with id: ${postId}`);
    }

    const comment = await this.commentsRepository.create(
      {
        ...createCommentDto,
        commentatorInfo: { userId: 'someUserId', userLogin: 'someUserLogin' }, //
      },
      postId,
    );

    return CommentsMapper.toViewModel(comment);
  }

  async findAll(query: GetAllPostsDto) {
    const pageNumber = Number(query.pageNumber ?? 1);
    const pageSize = Number(query.pageSize ?? 10);
    const { items, totalCount } = await this.postsRepository.findAll({
      sortBy: query.sortBy ?? 'createdAt',
      sortDirection: query.sortDirection ?? 'desc',
      pageNumber,
      pageSize,
    });

    return {
      pagesCount: totalCount > 0 ? Math.ceil(totalCount / pageSize) : 0,
      page: pageNumber,
      pageSize,
      totalCount,
      items: items.map((item) => PostsMapper.toViewModel(item)),
    };
  }

  async findOne(id: string) {
    const post = await this.postsRepository.findOne(id);

    if (!post) {
      throw new NotFoundException(`No such post with id: ${id}`);
    }

    return PostsMapper.toViewModel(post);
  }

  async findAllByBlog(blogId: string, query: GetAllPostsDto) {
    const blog = await this.blogsRepository.findOne(blogId);

    if (!blog) {
      throw new NotFoundException(`No such blog with id: ${blogId}`);
    }

    const pageNumber = Number(query.pageNumber ?? 1);
    const pageSize = Number(query.pageSize ?? 10);
    const { items, totalCount } = await this.postsRepository.findAll(
      {
        sortBy: query.sortBy ?? 'createdAt',
        sortDirection: query.sortDirection ?? 'desc',
        pageNumber,
        pageSize,
      },
      blogId,
    );

    return {
      pagesCount: totalCount > 0 ? Math.ceil(totalCount / pageSize) : 0,
      page: pageNumber,
      pageSize,
      totalCount,
      items: items.map((item) => PostsMapper.toViewModel(item)),
    };
  }
  async findAllCommentsForPost(postId: string, query: GetAllCommentsDto) {
    const post = await this.postsRepository.findOne(postId);

    if (!post) {
      throw new NotFoundException(`No such post with id: ${postId}`);
    }

    const pageNumber = Number(query.pageNumber ?? 1);
    const pageSize = Number(query.pageSize ?? 10);
    const { items, totalCount } = await this.postsRepository.findAllComments(
      {
        sortBy: query.sortBy ?? 'createdAt',
        sortDirection: query.sortDirection ?? 'desc',
        pageNumber,
        pageSize,
      },
      postId,
    );

    return {
      pagesCount: totalCount > 0 ? Math.ceil(totalCount / pageSize) : 0,
      page: pageNumber,
      pageSize,
      totalCount,
      items: items.map((item) => PostsMapper.toViewModel(item)),
    };
  }

  async update(id: string, updatePostDto: UpdatePostDto) {
    const updatedPost = await this.postsRepository.update(id, updatePostDto);

    if (!updatedPost) {
      throw new NotFoundException(`No such post with id: ${id}`);
    }
  }

  async remove(id: string) {
    const result = await this.postsRepository.remove(id);

    if (result.deletedCount === 0) {
      throw new NotFoundException(`No such post with id: ${id}`);
    }
  }

  async updateLikeStatus(postId: string, likeStatusDto: LikeStatusDto) {
    const updatedPost = await this.postsRepository.updateLikeStatus(
      postId,
      likeStatusDto,
    );

    if (!updatedPost) {
      throw new NotFoundException(`No such post with id: ${postId}`);
    }
  }
}

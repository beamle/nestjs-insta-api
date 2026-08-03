import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { CreatePostForBlogDto } from './dto/create-post-for-blog.dto';
import { GetAllPostsDto } from './dto/get-all-posts.dto';
import { PostsRepository } from './posts.repository';
import { BlogsRepository } from '../blogs/blogs.repository';
import { PostsMapper } from './mappers/posts.mapper';

@Injectable()
export class PostsService {
  constructor(
    private readonly postsRepository: PostsRepository,
    private readonly blogsRepository: BlogsRepository,
  ) {
  }

  async create(createPostDto: CreatePostDto) {
    return this.createForBlog(createPostDto.blogId, createPostDto);
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

  async findAll(query: GetAllPostsDto) {
    const pageNumber = Number(query.pageNumber ?? 1);
    const pageSize = Number(query.pageSize ?? 10);
    const { items, totalCount } = await this.postsRepository.findAll({
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
}

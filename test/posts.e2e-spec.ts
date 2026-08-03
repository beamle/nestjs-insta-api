import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app/app.module';

describe('Posts API (e2e)', () => {
  let app: INestApplication;
  let blogId: string;
  let postId: string;

  const httpServer = () => app.getHttpServer() as unknown as App;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    await request(httpServer()).delete('/testing/all-data').expect(204);

    const blogResponse = await request(httpServer())
      .post('/blogs')
      .send({
        name: 'Posts Test Blog',
        description: 'Blog for posts tests',
        websiteUrl: 'https://posts-test.com',
      })
      .expect(201);

    blogId = (blogResponse.body as { id: string }).id;
  }, 30000);

  afterAll(async () => {
    await request(httpServer()).delete('/testing/all-data').expect(204);
    await app.close();
  }, 10000);

  it('POST /posts - creates a post with blog name', async () => {
    const createPostDto = {
      title: 'My First Post',
      shortDescription: 'Short post description',
      content: 'Post content',
      blogId,
    };

    const response = await request(httpServer())
      .post('/posts')
      .send(createPostDto)
      .expect(201);

    const body = response.body as {
      id: string;
      title: string;
      shortDescription: string;
      content: string;
      blogId: string;
      blogName: string;
      createdAt: string;
      extendedLikesInfo: {
        likesCount: number;
        dislikesCount: number;
        myStatus: 'None' | 'Like' | 'Dislike';
        newestLikes: unknown[];
      };
    };

    expect(body.title).toBe('My First Post');
    expect(body.shortDescription).toBe('Short post description');
    expect(body.content).toBe('Post content');
    expect(body.blogId).toBe(blogId);
    expect(body.blogName).toBe('Posts Test Blog');
    expect(body.extendedLikesInfo.likesCount).toBe(0);
    expect(body.extendedLikesInfo.dislikesCount).toBe(0);
    expect(body.extendedLikesInfo.myStatus).toBe('None');
    expect(body.extendedLikesInfo.newestLikes).toEqual([]);

    postId = body.id;
  }, 10000);

  it('GET /posts - returns posts list', async () => {
    const response = await request(httpServer()).get('/posts').expect(200);

    const body = response.body as {
      items: Array<{ id: string }>;
      page: number;
      pageSize: number;
      totalCount: number;
    };

    expect(body.items.length).toBeGreaterThan(0);
    expect(body.totalCount).toBeGreaterThan(0);
    expect(body.page).toBe(1);
    expect(body.pageSize).toBe(10);
  }, 10000);

  it('GET /posts/:id - returns a single post', async () => {
    const response = await request(httpServer())
      .get(`/posts/${postId}`)
      .expect(200);

    const body = response.body as {
      id: string;
      title: string;
      blogName: string;
    };

    expect(body.id).toBe(postId);
    expect(body.title).toBe('My First Post');
    expect(body.blogName).toBe('Posts Test Blog');
  }, 10000);

  it('POST /posts - returns 404 for missing blog', async () => {
    await request(httpServer())
      .post('/posts')
      .send({
        title: 'Bad Post',
        shortDescription: 'Bad',
        content: 'Bad',
        blogId: '507f1f77bcf86cd799439999',
      })
      .expect(404);
  }, 10000);
});

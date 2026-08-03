import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app/app.module';
import { CommentsRepository } from '../src/blogger-platform/comments/comments.repository';

describe('Testing API (e2e)', () => {
  let app: INestApplication;
  let commentsRepository: CommentsRepository;

  const httpServer = () => app.getHttpServer() as unknown as App;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    commentsRepository =
      moduleFixture.get<CommentsRepository>(CommentsRepository);
    await app.init();
  }, 30000);

  afterAll(async () => {
    await app.close();
  }, 10000);

  it('DELETE /testing/all-data - clears all collections', async () => {
    const blogResponse = await request(httpServer())
      .post('/blogs')
      .send({
        name: 'Cleanup Blog',
        description: 'Will be deleted',
        websiteUrl: 'https://cleanup.com',
      })
      .expect(201);

    const blogId = (blogResponse.body as { id: string }).id;

    const postResponse = await request(httpServer())
      .post(`/blogs/${blogId}/posts`)
      .send({
        title: 'Cleanup Post',
        shortDescription: 'Will be deleted',
        content: 'Will be deleted',
      })
      .expect(201);

    const postId = (postResponse.body as { id: string }).id;

    await commentsRepository.create({
      postId,
      content: 'Cleanup comment',
      commentatorInfo: {
        userId: 'cleanup-user',
        userLogin: 'cleanup',
      },
    });

    await request(httpServer()).delete('/testing/all-data').expect(204);

    const blogsResponse = await request(httpServer()).get('/blogs').expect(200);
    const postsResponse = await request(httpServer()).get('/posts').expect(200);
    const commentsResponse = await request(httpServer())
      .get(`/posts/${postId}/comments`)
      .expect(404);

    const blogsBody = blogsResponse.body as { items: unknown[] };
    const postsBody = postsResponse.body as { items: unknown[] };

    expect(blogsBody.items).toEqual([]);
    expect(postsBody.items).toEqual([]);
    expect(commentsResponse.status).toBe(404);
  }, 10000);
});

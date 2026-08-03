import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app/app.module';
import { CommentsRepository } from '../src/comments/comments.repository';

describe('Comments API (e2e)', () => {
  let app: INestApplication;
  let commentsRepository: CommentsRepository;
  let blogId: string;
  let postId: string;
  let commentId: string;

  const httpServer = () => app.getHttpServer() as unknown as App;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    commentsRepository =
      moduleFixture.get<CommentsRepository>(CommentsRepository);
    await app.init();
    await request(httpServer()).delete('/testing/all-data').expect(204);

    const blogResponse = await request(httpServer())
      .post('/blogs')
      .send({
        name: 'Comments Test Blog',
        description: 'Blog for comments tests',
        websiteUrl: 'https://comments-test.com',
      })
      .expect(201);

    blogId = (blogResponse.body as { id: string }).id;

    const postResponse = await request(httpServer())
      .post(`/blogs/${blogId}/posts`)
      .send({
        title: 'Comments Test Post',
        shortDescription: 'Short',
        content: 'Content',
      })
      .expect(201);

    postId = (postResponse.body as { id: string }).id;

    const seededComment = await commentsRepository.create({
      postId,
      content: 'First comment',
      commentatorInfo: {
        userId: 'user-1',
        userLogin: 'tester',
      },
    });

    commentId = seededComment._id.toString();
  }, 30000);

  afterAll(async () => {
    await request(httpServer()).delete('/testing/all-data').expect(204);
    await app.close();
  }, 10000);

  it('GET /posts/:postId/comments - returns all comments for post', async () => {
    const response = await request(httpServer())
      .get(`/posts/${postId}/comments`)
      .expect(200);

    const body = response.body as {
      items: Array<{ id: string }>;
      page: number;
      pageSize: number;
      totalCount: number;
    };

    expect(body.totalCount).toBe(1);
    expect(body.items[0].id).toBe(commentId);
    expect(body.page).toBe(1);
    expect(body.pageSize).toBe(10);
  }, 10000);

  it('GET /comments/:commentId - returns comment by id', async () => {
    const response = await request(httpServer())
      .get(`/comments/${commentId}`)
      .expect(200);

    const body = response.body as {
      id: string;
      content: string;
      commentatorInfo: { userId: string; userLogin: string };
      likesInfo: {
        likesCount: number;
        dislikesCount: number;
        myStatus: string;
      };
    };

    expect(body.id).toBe(commentId);
    expect(body.content).toBe('First comment');
    expect(body.commentatorInfo.userId).toBe('user-1');
    expect(body.commentatorInfo.userLogin).toBe('tester');
  }, 10000);

  it('GET /posts/:postId/comments - returns 404 for missing post', async () => {
    await request(httpServer())
      .get('/posts/507f1f77bcf86cd799439999/comments')
      .expect(404);
  }, 10000);
});

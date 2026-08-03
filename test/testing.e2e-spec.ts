import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app/app.module';

describe('Testing API (e2e)', () => {
  let app: INestApplication;

  const httpServer = () => app.getHttpServer() as unknown as App;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  }, 30000);

  afterAll(async () => {
    await app.close();
  }, 10000);

  it('DELETE /testing/all-data - clears all collections', async () => {
    await request(httpServer())
      .post('/blogs')
      .send({
        name: 'Cleanup Blog',
        description: 'Will be deleted',
        websiteUrl: 'https://cleanup.com',
      })
      .expect(201);

    await request(httpServer()).delete('/testing/all-data').expect(204);

    const blogsResponse = await request(httpServer()).get('/blogs').expect(200);
    const postsResponse = await request(httpServer()).get('/posts').expect(200);

    const blogsBody = blogsResponse.body as { items: unknown[] };
    const postsBody = postsResponse.body as { items: unknown[] };

    expect(blogsBody.items).toEqual([]);
    expect(postsBody.items).toEqual([]);
  }, 10000);
});

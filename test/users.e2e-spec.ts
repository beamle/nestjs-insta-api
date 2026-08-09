import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app/app.module';

describe('Users API (e2e)', () => {
  let app: INestApplication;
  let userId: string;
  const adminAuth = `Basic ${Buffer.from('admin:qwerty').toString('base64')}`;

  const httpServer = () => app.getHttpServer() as unknown as App;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    await request(httpServer()).delete('/testing/all-data').expect(204);
  }, 30000);

  afterAll(async () => {
    await request(httpServer()).delete('/testing/all-data').expect(204);
    await app.close();
  }, 10000);

  it('POST /users - returns 401 without auth', async () => {
    await request(httpServer()).post('/users').send({}).expect(401);
  }, 10000);

  it('POST /users - returns 400 for invalid body', async () => {
    const response = await request(httpServer())
      .post('/users')
      .set('Authorization', adminAuth)
      .send({
        login: 'sh',
        password: 'length_21-weqweqweqwq',
        email: 'someemail@gg.com',
      })
      .expect(400);

    expect(response.body.errorsMessages).toEqual([
      expect.objectContaining({ field: 'login' }),
      expect.objectContaining({ field: 'password' }),
    ]);
  }, 10000);

  it('POST /users - creates a user', async () => {
    const response = await request(httpServer())
      .post('/users')
      .set('Authorization', adminAuth)
      .send({
        login: 'B73',
        password: 'string',
        email: 'example@example.dev',
      })
      .expect(201);

    const body = response.body as {
      id: string;
      login: string;
      email: string;
      createdAt: string;
    };

    expect(body.login).toBe('B73');
    expect(body.email).toBe('example@example.dev');
    expect(body.id).toBeDefined();

    userId = body.id;
  }, 10000);

  it('GET /users - returns all users', async () => {
    const response = await request(httpServer()).get('/users').expect(200);

    const body = response.body as {
      pagesCount: number;
      page: number;
      pageSize: number;
      totalCount: number;
      items: Array<{ id: string; login: string; email: string }>;
    };

    expect(body.totalCount).toBeGreaterThan(0);
    expect(body.items[0].login).toBe('B73');
    expect(body.items[0].email).toBe('example@example.dev');
  }, 10000);

  it('GET /users - filters by login term', async () => {
    const response = await request(httpServer())
      .get('/users?searchLoginTerm=B7')
      .expect(200);

    const body = response.body as { items: Array<{ login: string }> };
    expect(body.items.length).toBeGreaterThan(0);
    expect(body.items[0].login).toContain('B7');
  }, 10000);

  it('DELETE /users/:id - deletes a user', async () => {
    await request(httpServer())
      .delete(`/users/${userId}`)
      .set('Authorization', adminAuth)
      .expect(204);
  }, 10000);

  it('DELETE /users/:id - returns 404 for missing user', async () => {
    await request(httpServer())
      .delete('/users/507f1f77bcf86cd799439999')
      .set('Authorization', adminAuth)
      .expect(404);
  }, 10000);
});

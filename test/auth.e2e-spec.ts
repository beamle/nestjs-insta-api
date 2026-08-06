import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app/app.module';

describe('Auth API (e2e)', () => {
  let app: INestApplication<App>;

  const httpServer = () => app.getHttpServer();

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    await request(httpServer()).delete('/testing/all-data').expect(204);
  }, 30000);

  afterEach(async () => {
    await app.close();
  }, 10000);

  it('POST /auth/registration returns 204 for valid payload', async () => {
    await request(httpServer())
      .post('/auth/registration')
      .send({
        login: 'tester',
        password: 'secret12',
        email: 'tester@example.com',
      })
      .expect(204);
  });

  it('POST /auth/registration returns 400 for invalid payload', async () => {
    const response = await request(httpServer())
      .post('/auth/registration')
      .send({
        login: 'ab',
        password: '1',
        email: 'bad',
      })
      .expect(400);

    expect(response.body.errorsMessages).toBeDefined();
  });

  it('POST /auth/registration returns 400 for duplicates', async () => {
    await request(httpServer())
      .post('/auth/registration')
      .send({
        login: 'tester',
        password: 'secret12',
        email: 'tester@example.com',
      })
      .expect(204);

    const response = await request(httpServer())
      .post('/auth/registration')
      .send({
        login: 'tester',
        password: 'secret12',
        email: 'tester@example.com',
      })
      .expect(400);

    expect(response.body.errorsMessages).toBeDefined();
  });

  it('POST /auth/registration returns 429 after too many attempts', async () => {
    for (let index = 0; index < 5; index += 1) {
      await request(httpServer())
        .post('/auth/registration')
        .set('x-forwarded-for', '10.0.0.1')
        .send({
          login: `tester${index}`,
          password: 'secret12',
          email: `tester${index}@example.com`,
        })
        .expect(204);
    }

    await request(httpServer())
      .post('/auth/registration')
      .set('x-forwarded-for', '10.0.0.1')
      .send({
        login: 'tester6',
        password: 'secret12',
        email: 'tester6@example.com',
      })
      .expect(429);
  });
});

import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app/app.module';
import { UsersRepository } from '../src/user-accounts/users/users.repository';

describe('Auth API (e2e)', () => {
  let app: INestApplication<App>;
  let moduleFixture: TestingModule;

  const httpServer = () => app.getHttpServer();

  beforeEach(async () => {
    moduleFixture = await Test.createTestingModule({
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
    const payload = {
      login: 'tester',
      password: 'secret12',
      email: 'tester@example.com',
    };

    await request(httpServer())
      .post('/auth/registration')
      .send(payload)
      .expect(204);

    const usersRepository = moduleFixture.get(UsersRepository);
    const user = await usersRepository.findByEmail(payload.email);

    expect(user?.confirmationCode).toBeDefined();
  }, 10000);

  it('POST /auth/registration-confirmation returns 204 for valid code', async () => {
    const payload = {
      login: 'tester-confirm',
      password: 'secret12',
      email: 'tester-confirm@example.com',
    };

    await request(httpServer())
      .post('/auth/registration')
      .send(payload)
      .expect(204);

    const usersRepository = moduleFixture.get(UsersRepository);
    const user = await usersRepository.findByEmail(payload.email);

    await request(httpServer())
      .post('/auth/registration-confirmation')
      .send({
        confirmationCode: user?.confirmationCode,
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

  it('POST /auth/registration-confirmation returns 400 for invalid code', async () => {
    const response = await request(httpServer())
      .post('/auth/registration-confirmation')
      .send({
        confirmationCode: 'INVALID-CODE',
      })
      .expect(400);

    expect(response.body.errorsMessages).toBeDefined();
  });

  it('POST /auth/registration-confirmation returns 429 after too many attempts', async () => {
    const payload = {
      login: 'tester-rate',
      password: 'secret12',
      email: 'tester-rate@example.com',
    };

    await request(httpServer()).post('/auth/registration').send(payload).expect(204);

    for (let index = 0; index < 5; index += 1) {
      await request(httpServer())
        .post('/auth/registration-confirmation')
        .set('x-forwarded-for', '10.0.0.2')
        .send({
          confirmationCode: 'INVALID-CODE',
        })
        .expect(400);
    }

    await request(httpServer())
      .post('/auth/registration-confirmation')
      .set('x-forwarded-for', '10.0.0.2')
      .send({
        confirmationCode: 'INVALID-CODE',
      })
      .expect(429);
  }, 10000);

  it('POST /login returns 200 with accessToken for valid credentials', async () => {
    const payload = {
      login: 'login-user',
      password: 'secret12',
      email: 'login-user@example.com',
    };

    await request(httpServer()).post('/auth/registration').send(payload).expect(204);

    const response = await request(httpServer())
      .post('/login')
      .send({
        loginOrEmail: payload.login,
        password: payload.password,
      })
      .expect(200);

    expect(response.body.accessToken).toEqual(expect.any(String));
  });

  it('POST /login returns 400 for invalid input', async () => {
    await request(httpServer())
      .post('/login')
      .send({
        loginOrEmail: '',
        password: '',
      })
      .expect(400);
  });

  it('POST /login returns 401 for wrong credentials', async () => {
    await request(httpServer())
      .post('/login')
      .send({
        loginOrEmail: 'unknown-user',
        password: 'wrong',
      })
      .expect(401);
  });

  it('POST /auth/password-recovery returns 204 for non-existing email', async () => {
    await request(httpServer())
      .post('/auth/password-recovery')
      .send({
        email: 'missing@example.com',
      })
      .expect(204);
  });

  it('POST /auth/password-recovery returns 400 for invalid email', async () => {
    await request(httpServer())
      .post('/auth/password-recovery')
      .send({
        email: '222^gmail.com',
      })
      .expect(400);
  });

  it('POST /auth/password-recovery returns 429 after too many attempts', async () => {
    for (let index = 0; index < 5; index += 1) {
      await request(httpServer())
        .post('/auth/password-recovery')
        .set('x-forwarded-for', '10.0.0.3')
        .send({
          email: `missing${index}@example.com`,
        })
        .expect(204);
    }

    await request(httpServer())
      .post('/auth/password-recovery')
      .set('x-forwarded-for', '10.0.0.3')
      .send({
        email: 'missing-final@example.com',
      })
      .expect(429);
  });
});

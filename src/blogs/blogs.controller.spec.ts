import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from "../app/app.module";


describe('BlogsController (e2e)', () => {
  let app: INestApplication;
  let createdBlogId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
      }),
    );

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/blogs (POST) - should create a blog', async () => {
    const createBlogDto = {
      name: 'Test Blog',
      description: 'Test Desc',
      websiteUrl: 'https://test.com',
    };

    const response = await request(app.getHttpServer())
      .post('/blogs')
      .send(createBlogDto)
      .expect(201);

    expect(response.body).toMatchObject({
      name: 'Test Blog',
      description: 'Test Desc',
      websiteUrl: 'https://test.com',
    });
    expect(response.body.id).toBeDefined();

    createdBlogId = response.body.id;
  });

  it('/blogs (GET) - should return paginated list of blogs', async () => {
    const response = await request(app.getHttpServer())
      .get('/blogs?pageNumber=1&pageSize=10')
      .expect(200);

    expect(response.body).toHaveProperty('items');
    expect(response.body).toHaveProperty('totalCount');
    expect(Array.isArray(response.body.items)).toBe(true);
  });

  it('/blogs/:id (GET) - should return a blog by ID', async () => {
    const response = await request(app.getHttpServer())
      .get(`/blogs/${createdBlogId}`)
      .expect(200);

    expect(response.body).toHaveProperty('id', createdBlogId);
  });

  it('/blogs/:id (GET) - should return 404 for non-existent ID', async () => {
    await request(app.getHttpServer())
      .get('/blogs/00000000-0000-0000-0000-000000000000')
      .expect(404);
  });

  it('/blogs/:id (PUT) - should update the created blog', async () => {
    const updateBlogDto = {
      name: 'Updated Blog',
      description: 'Updated Desc',
      websiteUrl: 'https://updated-test.com',
    };

    await request(app.getHttpServer())
      .put(`/blogs/${createdBlogId}`)
      .send(updateBlogDto)
      .expect(204);
  });

  it('/blogs/:id (DELETE) - should remove the created blog', async () => {
    await request(app.getHttpServer())
      .delete(`/blogs/${createdBlogId}`)
      .expect(204);
  });

  it('/blogs/:id (GET) - should return 404 after deletion', async () => {
    await request(app.getHttpServer())
      .get(`/blogs/${createdBlogId}`)
      .expect(404);
  });
});
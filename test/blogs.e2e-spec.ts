import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app/app.module';

describe('Blogs API (e2e)', () => {
  let app: INestApplication;

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

  describe('Blog CRUD Operations', () => {
    let blogId: string;

    it('POST /blogs - create a blog', async () => {
      const createBlogDto = {
        name: 'My Test Blog',
        description: 'A blog about testing',
        websiteUrl: 'https://example.com',
      };

      const response = await request(app.getHttpServer())
        .post('/blogs')
        .send(createBlogDto)
        .expect(201);

      const body = response.body as {
        id: string;
        name: string;
        description: string;
        websiteUrl: string;
        isMembership: boolean;
      };

      expect(body).toHaveProperty('id');
      expect(body.name).toBe('My Test Blog');
      expect(body.description).toBe('A blog about testing');
      expect(body.websiteUrl).toBe('https://example.com');
      expect(body.isMembership).toBe(false);

      blogId = body.id;
    }, 10000);

    it('GET /blogs - retrieve all blogs', async () => {
      const response = await request(app.getHttpServer() as unknown)
        .get('/blogs')
        .expect(200);

      const body = response.body as {
        items: unknown[];
        page: number;
        pageSize: number;
        totalCount: number;
      };

      expect(body).toHaveProperty('items');
      expect(body).toHaveProperty('page');
      expect(body).toHaveProperty('pageSize');
      expect(body).toHaveProperty('totalCount');
      expect(Array.isArray(body.items)).toBe(true);
    }, 10000);

    it('GET /blogs/:id - retrieve a single blog', async () => {
      const response = await request(app.getHttpServer() as unknown)
        .get(`/blogs/${blogId}`)
        .expect(200);

      const body = response.body as {
        id: string;
        name: string;
        description: string;
        websiteUrl: string;
        isMembership: boolean;
      };

      expect(body.id).toBe(blogId);
      expect(body.name).toBe('My Test Blog');
    }, 10000);

    it('PUT /blogs/:id - update a blog', async () => {
      const updateBlogDto = {
        name: 'Updated Test Blog',
        description: 'Updated blog about testing',
        websiteUrl: 'https://updated.com',
      };

      await request(app.getHttpServer() as unknown)
        .put(`/blogs/${blogId}`)
        .send(updateBlogDto)
        .expect(204);
    }, 10000);

    it('GET /blogs/:id - verify blog was updated', async () => {
      const response = await request(app.getHttpServer() as unknown)
        .get(`/blogs/${blogId}`)
        .expect(200);

      const body = response.body as {
        name: string;
        description: string;
      };

      expect(body.name).toBe('Updated Test Blog');
      expect(body.description).toBe('Updated blog about testing');
    }, 10000);

    it('DELETE /blogs/:id - delete a blog', async () => {
      await request(app.getHttpServer() as unknown)
        .delete(`/blogs/${blogId}`)
        .expect(204);
    }, 10000);

    it('GET /blogs/:id - verify blog was deleted (404)', async () => {
      await request(app.getHttpServer() as unknown)
        .get(`/blogs/${blogId}`)
        .expect(404);
    }, 10000);
  });

  describe('Blog Pagination and Filtering', () => {
    beforeAll(async () => {
      const blogs = [
        {
          name: 'JavaScript Blog',
          description: 'Learn JS',
          websiteUrl: 'https://js.com',
        },
        {
          name: 'TypeScript Blog',
          description: 'Learn TS',
          websiteUrl: 'https://ts.com',
        },
        {
          name: 'Node.js Blog',
          description: 'Learn Node',
          websiteUrl: 'https://node.com',
        },
      ];

      for (const blog of blogs) {
        await request(app.getHttpServer() as unknown)
          .post('/blogs')
          .send(blog)
          .expect(201);
      }
    }, 15000);

    it('GET /blogs - retrieve paginated blogs with page 1', async () => {
      const response = await request(app.getHttpServer() as unknown)
        .get('/blogs?pageNumber=1&pageSize=2')
        .expect(200);

      const body = response.body as {
        page: number;
        pageSize: number;
        items: unknown[];
      };

      expect(body.page).toBe(1);
      expect(body.pageSize).toBe(2);
      expect(body.items.length).toBeLessThanOrEqual(2);
    }, 10000);

    it('GET /blogs - search blogs by name', async () => {
      const response = await request(app.getHttpServer() as unknown)
        .get('/blogs?searchNameTerm=JavaScript')
        .expect(200);

      const body = response.body as {
        items: Array<{ name: string }>;
      };

      expect(body.items.length).toBeGreaterThan(0);
      expect(body.items[0].name).toContain('JavaScript');
    }, 10000);

    it('GET /blogs - sort by name ascending', async () => {
      const response = await request(app.getHttpServer() as unknown)
        .get('/blogs?sortBy=name&sortDirection=asc')
        .expect(200);

      const body = response.body as {
        items: Array<{ name: string }>;
      };

      expect(body.items.length).toBeGreaterThan(0);
    }, 10000);
  });
});

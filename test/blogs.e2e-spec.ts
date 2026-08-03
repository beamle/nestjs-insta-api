import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app/app.module';

describe('Blogs API (e2e)', () => {
  let app: INestApplication;

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

  describe('Blog CRUD Operations', () => {
    let blogId: string;

    it('POST /blogs - create a blog', async () => {
      const createBlogDto = {
        name: 'My Test Blog',
        description: 'A blog about testing',
        websiteUrl: 'https://example.com',
      };

      const response = await request(httpServer())
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
      const response = await request(httpServer()).get('/blogs').expect(200);

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
      const response = await request(httpServer())
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

      await request(httpServer())
        .put(`/blogs/${blogId}`)
        .send(updateBlogDto)
        .expect(204);
    }, 10000);

    it('GET /blogs/:id - verify blog was updated', async () => {
      const response = await request(httpServer())
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
      await request(httpServer()).delete(`/blogs/${blogId}`).expect(204);
    }, 10000);

    it('GET /blogs/:id - verify blog was deleted (404)', async () => {
      await request(httpServer()).get(`/blogs/${blogId}`).expect(404);
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
        await request(httpServer()).post('/blogs').send(blog).expect(201);
      }
    }, 15000);

    it('GET /blogs - retrieve paginated blogs with page 1', async () => {
      const response = await request(httpServer())
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
      const response = await request(httpServer())
        .get('/blogs?searchNameTerm=JavaScript')
        .expect(200);

      const body = response.body as {
        items: Array<{ name: string }>;
      };

      expect(body.items.length).toBeGreaterThan(0);
      expect(body.items[0].name).toContain('JavaScript');
    }, 10000);

    it('GET /blogs - sort by name ascending', async () => {
      const response = await request(httpServer())
        .get('/blogs?sortBy=name&sortDirection=asc')
        .expect(200);

      const body = response.body as {
        items: Array<{ name: string }>;
      };

      expect(body.items.length).toBeGreaterThan(0);
    }, 10000);
  });

  describe('Blog Posts', () => {
    let blogId: string;
    let postId: string;

    beforeAll(async () => {
      const blogResponse = await request(httpServer())
        .post('/blogs')
        .send({
          name: 'Blog Posts Parent',
          description: 'Parent blog for posts',
          websiteUrl: 'https://blog-posts-parent.com',
        })
        .expect(201);

      blogId = (blogResponse.body as { id: string }).id;
    });

    it('POST /blogs/:blogId/posts - creates a post for blog', async () => {
      const response = await request(httpServer())
        .post(`/blogs/${blogId}/posts`)
        .send({
          title: 'Blog Post Title',
          shortDescription: 'Blog post short description',
          content: 'Blog post content',
        })
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
          newestLikes: Array<{
            addedAt: string;
            userId: string;
            login: string;
          }>;
        };
      };

      expect(body.title).toBe('Blog Post Title');
      expect(body.shortDescription).toBe('Blog post short description');
      expect(body.content).toBe('Blog post content');
      expect(body.blogId).toBe(blogId);
      expect(body.blogName).toBe('Blog Posts Parent');
      expect(body.extendedLikesInfo.likesCount).toBe(0);
      expect(body.extendedLikesInfo.dislikesCount).toBe(0);
      expect(body.extendedLikesInfo.myStatus).toBe('None');
      expect(body.extendedLikesInfo.newestLikes).toEqual([]);

      postId = body.id;
    }, 10000);

    it('GET /blogs/:blogId/posts - returns all posts for blog', async () => {
      const response = await request(httpServer())
        .get(`/blogs/${blogId}/posts`)
        .expect(200);

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
      expect(body.items[0].id).toBe(postId);
    }, 10000);

    it('POST /blogs/:blogId/posts - returns 404 for missing blog', async () => {
      await request(httpServer())
        .post('/blogs/507f1f77bcf86cd799439999/posts')
        .send({
          title: 'Missing Blog Post',
          shortDescription: 'Missing',
          content: 'Missing',
        })
        .expect(404);
    }, 10000);
  });
});

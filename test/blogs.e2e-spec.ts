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
    // Note: ValidationPipe is not configured globally in the app
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

      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe('My Test Blog');
      expect(response.body.description).toBe('A blog about testing');
      expect(response.body.websiteUrl).toBe('https://example.com');
      expect(response.body.isMembership).toBe(false);

      blogId = response.body.id;
    }, 10000);

    it('GET /blogs - retrieve all blogs', async () => {
      const response = await request(app.getHttpServer())
        .get('/blogs')
        .expect(200);

      expect(response.body).toHaveProperty('items');
      expect(response.body).toHaveProperty('page');
      expect(response.body).toHaveProperty('pageSize');
      expect(response.body).toHaveProperty('totalCount');
      expect(Array.isArray(response.body.items)).toBe(true);
    }, 10000);

    it('GET /blogs/:id - retrieve a single blog', async () => {
      const response = await request(app.getHttpServer())
        .get(`/blogs/${blogId}`)
        .expect(200);

      expect(response.body.id).toBe(blogId);
      expect(response.body.name).toBe('My Test Blog');
    }, 10000);

    it('PUT /blogs/:id - update a blog', async () => {
      const updateBlogDto = {
        name: 'Updated Test Blog',
        description: 'Updated description',
      };

      await request(app.getHttpServer())
        .put(`/blogs/${blogId}`)
        .send(updateBlogDto)
        .expect(204);

      // Verify the update
      const response = await request(app.getHttpServer())
        .get(`/blogs/${blogId}`)
        .expect(200);

      expect(response.body.name).toBe('Updated Test Blog');
      expect(response.body.description).toBe('Updated description');
    }, 10000);

    it('DELETE /blogs/:id - delete a blog', async () => {
      await request(app.getHttpServer())
        .delete(`/blogs/${blogId}`)
        .expect(204);

      // Verify deletion
      await request(app.getHttpServer())
        .get(`/blogs/${blogId}`)
        .expect(404);
    }, 10000);

    it('GET /blogs with search - filter blogs', async () => {
      // Create a test blog
      const createBlogDto = {
        name: 'SearchTest Blog',
        description: 'Testing search functionality',
        websiteUrl: 'https://search-test.com',
      };

      const createResponse = await request(app.getHttpServer())
        .post('/blogs')
        .send(createBlogDto)
        .expect(201);

      const testBlogId = createResponse.body.id;

      // Search for it
      const searchResponse = await request(app.getHttpServer())
        .get('/blogs?searchNameTerm=SearchTest')
        .expect(200);

      expect(searchResponse.body.items.length).toBeGreaterThan(0);
      const foundBlog = searchResponse.body.items.find((b: any) => b.id === testBlogId);
      expect(foundBlog).toBeDefined();

      // Cleanup
      await request(app.getHttpServer())
        .delete(`/blogs/${testBlogId}`)
        .expect(204);
    }, 15000);

    it('GET /blogs with pagination', async () => {
      const response = await request(app.getHttpServer())
        .get('/blogs?pageNumber=1&pageSize=5')
        .expect(200);

      expect(response.body.page).toBe(1);
      expect(response.body.pageSize).toBe(5);
      expect(Array.isArray(response.body.items)).toBe(true);
    }, 10000);

    it('GET /blogs/:id with invalid ID - should return 404', async () => {
      await request(app.getHttpServer())
        .get('/blogs/00000000000000000000000f')
        .expect(404);
    }, 10000);

    it('DELETE /blogs/:id with invalid ID - should return 404', async () => {
      await request(app.getHttpServer())
        .delete('/blogs/00000000000000000000000f')
        .expect(404);
    }, 10000);

    it('PUT /blogs/:id with invalid ID - should return 404', async () => {
      const updateBlogDto = {
        name: 'Updated Name',
      };

      await request(app.getHttpServer())
        .put('/blogs/00000000000000000000000f')
        .send(updateBlogDto)
        .expect(404);
    }, 10000);
  });

  describe('Full CRUD Workflow', () => {
    it('should complete full create-read-update-delete cycle', async () => {
      // 1. Create
      const createBlogDto = {
        name: 'Full Cycle Blog',
        description: 'Testing the full cycle',
        websiteUrl: 'https://cycle-test.com',
      };

      const createResponse = await request(app.getHttpServer())
        .post('/blogs')
        .send(createBlogDto)
        .expect(201);

      const blogId = createResponse.body.id;
      expect(createResponse.body.name).toBe('Full Cycle Blog');

      // 2. Read
      const readResponse = await request(app.getHttpServer())
        .get(`/blogs/${blogId}`)
        .expect(200);

      expect(readResponse.body.id).toBe(blogId);
      expect(readResponse.body.name).toBe('Full Cycle Blog');

      // 3. Update
      const updateBlogDto = {
        name: 'Updated Full Cycle Blog',
      };

      await request(app.getHttpServer())
        .put(`/blogs/${blogId}`)
        .send(updateBlogDto)
        .expect(204);

      const updatedReadResponse = await request(app.getHttpServer())
        .get(`/blogs/${blogId}`)
        .expect(200);

      expect(updatedReadResponse.body.name).toBe('Updated Full Cycle Blog');

      // 4. Delete
      await request(app.getHttpServer())
        .delete(`/blogs/${blogId}`)
        .expect(204);

      // 5. Verify deletion
      await request(app.getHttpServer())
        .get(`/blogs/${blogId}`)
        .expect(404);
    }, 30000);
  });
});

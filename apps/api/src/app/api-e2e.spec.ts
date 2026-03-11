/**
 * API E2E Scenario Tests
 *
 * Tests public endpoints through both controllers using supertest.
 * Uses minimal NestJS app with mock services (no AppModule/TypeORM).
 */

jest.mock('@nestjs/typeorm', () => ({
  InjectRepository: () => () => {},
  TypeOrmModule: {
    forRoot: () => ({ module: class {}, providers: [], exports: [] }),
    forFeature: () => ({ module: class {}, providers: [], exports: [] }),
  },
}));

import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { UserApiHandlersController } from '@realworld/user/api/handlers';
import { UserService, FollowService } from '@realworld/user/api/shared';
import { ArticleApiHandlersController } from '@realworld/article/api/handlers';
import { ArticleService, CommentService, FavoriteService, TagService } from '@realworld/article/api/shared';

describe('API E2E Scenarios', () => {
  let app: INestApplication;

  const user = { id: 'u1', username: 'testuser', email: 'test@test.com', bio: 'bio', image: '', token: 'jwt-token', createdAt: new Date() };
  const profile = { username: 'testuser', bio: 'bio', image: '', following: false, createdAt: new Date() };
  const article = { id: 'a1', slug: 'test-article', title: 'Test', description: 'desc', body: 'body', authorId: 'u1', tagList: ['test'], createdAt: new Date() };
  const comment = { id: 'c1', body: 'Great article!', authorId: 'u1', articleSlug: 'test-article', createdAt: new Date() };

  const mockUserService = {
    login: jest.fn().mockResolvedValue(user),
    register: jest.fn().mockResolvedValue(user),
    findOne: jest.fn().mockResolvedValue(user),
    findAll: jest.fn().mockResolvedValue([user]),
    getJwtInfo: jest.fn().mockReturnValue(null),
    getProfile: jest.fn().mockResolvedValue(profile),
    insert: jest.fn(),
    update: jest.fn(),
    softDelete: jest.fn(),
    count: jest.fn().mockResolvedValue(1),
  };

  const mockFollowService = {
    findOne: jest.fn().mockResolvedValue(null),
    findAll: jest.fn().mockResolvedValue([]),
    insert: jest.fn(),
    update: jest.fn(),
    softDelete: jest.fn(),
    count: jest.fn().mockResolvedValue(0),
  };

  const mockArticleService = {
    findAll: jest.fn().mockResolvedValue([article]),
    findOne: jest.fn().mockResolvedValue(article),
    insert: jest.fn().mockResolvedValue({ identifiers: [{ id: 'a1' }] }),
    update: jest.fn(),
    softDelete: jest.fn(),
    count: jest.fn().mockResolvedValue(1),
    repository: { createQueryBuilder: jest.fn() },
  };

  const mockCommentService = {
    findAll: jest.fn().mockResolvedValue([comment]),
    findOne: jest.fn().mockResolvedValue(comment),
    insert: jest.fn().mockResolvedValue({ identifiers: [{ id: 'c1' }] }),
    softDelete: jest.fn(),
    count: jest.fn().mockResolvedValue(1),
  };

  const mockFavoriteService = {
    findOne: jest.fn().mockResolvedValue(null),
    findAll: jest.fn().mockResolvedValue([]),
    insert: jest.fn(),
    softDelete: jest.fn(),
    count: jest.fn().mockResolvedValue(0),
  };

  const mockTagService = {
    findAll: jest.fn().mockResolvedValue([{ name: 'test', count: 1 }]),
    findOne: jest.fn(),
    insert: jest.fn(),
    update: jest.fn(),
    count: jest.fn().mockResolvedValue(1),
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [UserApiHandlersController, ArticleApiHandlersController],
      providers: [
        { provide: UserService, useValue: mockUserService },
        { provide: FollowService, useValue: mockFollowService },
        { provide: ArticleService, useValue: mockArticleService },
        { provide: CommentService, useValue: mockCommentService },
        { provide: FavoriteService, useValue: mockFavoriteService },
        { provide: TagService, useValue: mockTagService },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
  });

  afterAll(async () => await app.close());

  beforeEach(() => jest.clearAllMocks());

  it('POST /api/users - register', async () => {
    mockUserService.register.mockResolvedValue(user);
    const res = await request(app.getHttpServer())
      .post('/api/users')
      .send({ username: 'testuser', email: 'test@test.com', password: 'pass123' })
      .expect(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe('test@test.com');
  });

  it('POST /api/users/login - login', async () => {
    mockUserService.login.mockResolvedValue(user);
    const res = await request(app.getHttpServer())
      .post('/api/users/login')
      .send({ email: 'test@test.com', password: 'pass123' })
      .expect(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('token');
  });

  it('GET /api/profiles/:username - get profile', async () => {
    mockUserService.findOne.mockResolvedValue(user);
    mockUserService.getJwtInfo.mockReturnValue(null);
    mockUserService.getProfile.mockResolvedValue(profile);
    const res = await request(app.getHttpServer())
      .get('/api/profiles/testuser')
      .expect(200);
    expect(res.body.success).toBe(true);
    expect(res.body.detailData.username).toBe('testuser');
  });

  it('GET /api/tags - list tags', async () => {
    mockTagService.findAll.mockResolvedValue([{ name: 'test', count: 1 }]);
    mockTagService.count.mockResolvedValue(1);
    const res = await request(app.getHttpServer())
      .get('/api/tags')
      .expect(200);
    expect(res.body.success).toBe(true);
    expect(res.body.listData).toContain('test');
  });

  it('GET /api/articles - list articles', async () => {
    mockArticleService.findAll.mockResolvedValue([article]);
    mockArticleService.count.mockResolvedValue(1);
    mockUserService.getJwtInfo.mockReturnValue(null);
    mockUserService.findOne.mockResolvedValue(user);
    mockUserService.getProfile.mockResolvedValue(profile);
    mockFavoriteService.findOne.mockResolvedValue(null);
    mockFavoriteService.count.mockResolvedValue(0);
    const res = await request(app.getHttpServer())
      .get('/api/articles')
      .expect(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.listData)).toBe(true);
  });

  it('GET /api/articles/:slug - get article', async () => {
    mockArticleService.findOne.mockResolvedValue(article);
    mockUserService.getJwtInfo.mockReturnValue(null);
    mockUserService.findOne.mockResolvedValue(user);
    mockUserService.getProfile.mockResolvedValue(profile);
    mockFavoriteService.findOne.mockResolvedValue(null);
    mockFavoriteService.count.mockResolvedValue(0);
    const res = await request(app.getHttpServer())
      .get('/api/articles/test-article')
      .expect(200);
    expect(res.body.success).toBe(true);
    expect(res.body.detailData.slug).toBe('test-article');
  });

  it('GET /api/articles/:slug/comments - get comments', async () => {
    mockCommentService.findAll.mockResolvedValue([comment]);
    mockCommentService.count.mockResolvedValue(1);
    mockUserService.getJwtInfo.mockReturnValue(null);
    mockUserService.findOne.mockResolvedValue(user);
    mockUserService.getProfile.mockResolvedValue(profile);
    const res = await request(app.getHttpServer())
      .get('/api/articles/test-article/comments')
      .expect(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.listData)).toBe(true);
  });
});

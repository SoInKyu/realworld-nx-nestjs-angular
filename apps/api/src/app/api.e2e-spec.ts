/**
 * API Integration Tests using supertest
 *
 * Tests public endpoints (no auth needed):
 * - POST /api/users/login
 * - POST /api/users
 * - GET /api/profiles/:username
 *
 * We build a minimal NestJS app with only the UserApiHandlersController
 * and mock all services to avoid TypeORM/DB dependencies.
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

describe('API Integration Tests', () => {
  let app: INestApplication;

  const mockUserData = {
    id: 'user-uuid-1',
    email: 'test@example.com',
    username: 'testuser',
    bio: 'A test user',
    image: 'https://example.com/avatar.png',
    token: 'mock-jwt-token',
    createdAt: new Date('2025-01-01'),
  };

  const mockUserService = {
    login: jest.fn(),
    register: jest.fn(),
    findOne: jest.fn(),
    findAll: jest.fn(),
    getJwtInfo: jest.fn(),
    getProfile: jest.fn(),
    insert: jest.fn(),
    update: jest.fn(),
    softDelete: jest.fn(),
    count: jest.fn(),
  };

  const mockFollowService = {
    findOne: jest.fn(),
    findAll: jest.fn(),
    insert: jest.fn(),
    update: jest.fn(),
    softDelete: jest.fn(),
    count: jest.fn(),
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [UserApiHandlersController],
      providers: [
        { provide: UserService, useValue: mockUserService },
        { provide: FollowService, useValue: mockFollowService },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/users/login', () => {
    it('should return 201 with user data on successful login', async () => {
      mockUserService.login.mockResolvedValue({
        id: mockUserData.id,
        email: mockUserData.email,
        username: mockUserData.username,
        bio: mockUserData.bio,
        image: mockUserData.image,
        token: mockUserData.token,
      });

      const response = await request(app.getHttpServer())
        .post('/api/users/login')
        .send({ email: 'test@example.com', password: 'password123' })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.email).toBe('test@example.com');
      expect(response.body.data.username).toBe('testuser');
      expect(response.body.data.token).toBe('mock-jwt-token');
      expect(response.body.message).toBe('Logged in successfully');
      expect(mockUserService.login).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });
  });

  describe('POST /api/users', () => {
    it('should return 201 with registered user data', async () => {
      mockUserService.register.mockResolvedValue({
        email: 'newuser@example.com',
        username: 'newuser',
        bio: null,
        image: null,
        password: null,
        token: 'new-jwt-token',
      });

      const response = await request(app.getHttpServer())
        .post('/api/users')
        .send({
          email: 'newuser@example.com',
          username: 'newuser',
          password: 'securepass',
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.email).toBe('newuser@example.com');
      expect(response.body.data.username).toBe('newuser');
      expect(response.body.data.token).toBe('new-jwt-token');
      expect(response.body.message).toBe('Registered successfully.');
      expect(mockUserService.register).toHaveBeenCalledWith({
        email: 'newuser@example.com',
        username: 'newuser',
        password: 'securepass',
      });
    });
  });

  describe('GET /api/profiles/:username', () => {
    it('should return 200 with profile data', async () => {
      mockUserService.findOne.mockResolvedValue({
        id: mockUserData.id,
        username: mockUserData.username,
        bio: mockUserData.bio,
        image: mockUserData.image,
        createdAt: mockUserData.createdAt,
      });

      mockUserService.getJwtInfo.mockReturnValue(null);

      mockUserService.getProfile.mockResolvedValue({
        username: mockUserData.username,
        bio: mockUserData.bio,
        image: mockUserData.image,
        following: false,
        createdAt: mockUserData.createdAt,
      });

      const response = await request(app.getHttpServer())
        .get('/api/profiles/testuser')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.detailData.username).toBe('testuser');
      expect(response.body.detailData.bio).toBe('A test user');
      expect(response.body.detailData.following).toBe(false);
      expect(mockUserService.findOne).toHaveBeenCalledWith({ username: 'testuser' });
      expect(mockUserService.getProfile).toHaveBeenCalled();
    });
  });
});

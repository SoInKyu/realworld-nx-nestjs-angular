jest.mock('@nestjs/typeorm', () => ({
  InjectRepository: () => () => {},
  TypeOrmModule: { forFeature: () => ({ module: class {} }) },
}));

import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ArticleApiHandlersController } from './article-api-handlers.controller';

describe('ArticleApiHandlersController', () => {
  let controller: ArticleApiHandlersController;
  let mockArticleService: any;
  let mockUserService: any;
  let mockFavoriteService: any;
  let mockFollowService: any;
  let mockTagService: any;
  let mockCommentService: any;

  const mockReq = {
    user: { sub: 'test-user-id' },
    headers: { authorization: 'Bearer test-token' },
  };

  const mockUser = {
    id: 'test-user-id',
    username: 'testuser',
    email: 'test@test.com',
    bio: 'bio',
    image: 'image.jpg',
    createdAt: new Date('2026-01-01'),
  };

  const mockArticle = {
    slug: 'test-article-123',
    title: 'Test Article',
    description: 'Test description',
    body: 'Test body',
    authorId: 'test-user-id',
    tagList: ['tag1', 'tag2'],
    createdAt: new Date('2026-01-01'),
  };

  const mockProfile = {
    username: 'testuser',
    bio: 'bio',
    image: 'image.jpg',
    following: false,
    createdAt: new Date('2026-01-01'),
  };

  beforeEach(() => {
    mockArticleService = {
      findAll: jest.fn(),
      findOne: jest.fn(),
      insert: jest.fn(),
      update: jest.fn(),
      softDelete: jest.fn(),
      count: jest.fn(),
      repository: {},
    };
    mockUserService = {
      findOne: jest.fn(),
      getProfile: jest.fn(),
      getJwtInfo: jest.fn(),
    };
    mockFavoriteService = {
      findOne: jest.fn(),
      insert: jest.fn(),
      softDelete: jest.fn(),
      count: jest.fn(),
    };
    mockFollowService = {
      findAll: jest.fn(),
    };
    mockTagService = {
      findAll: jest.fn(),
      findOne: jest.fn(),
      insert: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    };
    mockCommentService = {
      findAll: jest.fn(),
      findOne: jest.fn(),
      insert: jest.fn(),
      softDelete: jest.fn(),
      count: jest.fn(),
    };

    controller = new ArticleApiHandlersController(
      mockArticleService as any,
      mockUserService as any,
      mockFavoriteService as any,
      mockFollowService as any,
      mockTagService as any,
      mockCommentService as any
    );

    jest.clearAllMocks();

    // Default mocks for response mapping helpers
    mockUserService.findOne.mockResolvedValue(mockUser);
    mockUserService.getProfile.mockResolvedValue(mockProfile);
    mockFavoriteService.findOne.mockResolvedValue(null);
    mockFavoriteService.count.mockResolvedValue(0);
  });

  // --- Article CRUD ---

  describe('create', () => {
    it('should create an article with slug and return response', async () => {
      mockArticleService.insert.mockResolvedValue({ identifiers: [{ id: 'new-id' }] });
      mockTagService.findOne.mockResolvedValue(null);
      mockTagService.insert.mockResolvedValue({});

      const data = { title: 'My Article', description: 'desc', body: 'body', tagList: ['tag1'] };
      const result = await controller.create(mockReq, data);

      expect(result.success).toBe(true);
      expect(mockArticleService.insert).toHaveBeenCalled();
      const insertedArticle = mockArticleService.insert.mock.calls[0][0];
      expect(insertedArticle.authorId).toBe('test-user-id');
      expect(insertedArticle.slug).toContain('my-article');
    });

    it('should update tags when tagList is provided', async () => {
      mockArticleService.insert.mockResolvedValue({});
      mockTagService.findOne.mockResolvedValueOnce(null).mockResolvedValueOnce({ id: 'tag-id', name: 'existing', count: 5 });
      mockTagService.insert.mockResolvedValue({});
      mockTagService.update.mockResolvedValue({});

      const data = { title: 'My Article', description: 'desc', body: 'body', tagList: ['new-tag', 'existing'] };
      await controller.create(mockReq, data);

      expect(mockTagService.insert).toHaveBeenCalledWith({ name: 'new-tag', count: 1 });
      expect(mockTagService.update).toHaveBeenCalledWith({ id: 'tag-id' }, { count: 6 });
    });
  });

  describe('update', () => {
    it('should update article and return response', async () => {
      mockArticleService.update.mockResolvedValue({ affected: 1 });
      mockArticleService.findOne.mockResolvedValue(mockArticle);

      const result = await controller.update(mockReq, 'test-article-123', { title: 'Updated Title' });

      expect(result.success).toBe(true);
      expect(mockArticleService.update).toHaveBeenCalledWith(
        { slug: 'test-article-123' },
        { title: 'Updated Title' }
      );
    });
  });

  describe('delete', () => {
    it('should delete own article successfully', async () => {
      mockArticleService.findOne.mockResolvedValue({ ...mockArticle, authorId: 'test-user-id' });
      mockArticleService.softDelete.mockResolvedValue({ affected: 1 });

      const result = await controller.delete(mockReq, 'test-article-123');

      expect(result.success).toBe(true);
      expect(mockArticleService.softDelete).toHaveBeenCalledWith({ slug: 'test-article-123' });
    });

    it('should throw UnauthorizedException when deleting another user\'s article', async () => {
      mockArticleService.findOne.mockResolvedValue({ ...mockArticle, authorId: 'other-user-id' });

      await expect(
        controller.delete(mockReq, 'test-article-123')
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw NotFoundException when article does not exist', async () => {
      mockArticleService.findOne.mockResolvedValue(null);

      await expect(
        controller.delete(mockReq, 'nonexistent-slug')
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findBySlug', () => {
    it('should return article by slug', async () => {
      mockArticleService.findOne.mockResolvedValue(mockArticle);
      mockUserService.getJwtInfo.mockReturnValue({ sub: 'test-user-id' });

      const result = await controller.findBySlug(mockReq, 'test-article-123');

      expect(result.success).toBe(true);
      expect(result.detailData).toBeDefined();
      expect(mockArticleService.findOne).toHaveBeenCalledWith({ slug: 'test-article-123' });
    });

    it('should throw NotFoundException when article does not exist', async () => {
      mockArticleService.findOne.mockResolvedValue(null);

      await expect(
        controller.findBySlug(mockReq, 'nonexistent-slug')
      ).rejects.toThrow(NotFoundException);
    });
  });

  // --- Favorites ---

  describe('favoriteAnArticle', () => {
    it('should add favorite when not already favorited (idempotency)', async () => {
      mockFavoriteService.findOne.mockResolvedValueOnce(null);
      mockFavoriteService.insert.mockResolvedValue({});
      mockArticleService.findOne.mockResolvedValue(mockArticle);

      const result = await controller.favoriteAnArticle(mockReq, 'test-article-123');

      expect(result.success).toBe(true);
      expect(mockFavoriteService.insert).toHaveBeenCalledWith({
        userId: 'test-user-id',
        articleSlug: 'test-article-123',
      });
    });

    it('should not insert duplicate favorite', async () => {
      mockFavoriteService.findOne.mockResolvedValueOnce({ id: 'fav-1' });
      mockArticleService.findOne.mockResolvedValue(mockArticle);

      await controller.favoriteAnArticle(mockReq, 'test-article-123');

      expect(mockFavoriteService.insert).not.toHaveBeenCalled();
    });
  });

  describe('unfavoriteAnArticle', () => {
    it('should remove favorite when favorited', async () => {
      mockFavoriteService.findOne.mockResolvedValueOnce({ id: 'fav-1' });
      mockFavoriteService.softDelete.mockResolvedValue({ affected: 1 });
      mockArticleService.findOne.mockResolvedValue(mockArticle);

      const result = await controller.unfavoriteAnArticle(mockReq, 'test-article-123');

      expect(result.success).toBe(true);
      expect(mockFavoriteService.softDelete).toHaveBeenCalledWith({
        userId: 'test-user-id',
        articleSlug: 'test-article-123',
      });
    });
  });

  // --- Comments ---

  describe('createAComment', () => {
    it('should create a comment successfully', async () => {
      mockCommentService.insert.mockResolvedValue({});

      const result = await controller.createAComment(
        mockReq, 'test-article-123', { body: 'Great article!' }
      );

      expect(result.success).toBe(true);
      expect(mockCommentService.insert).toHaveBeenCalledWith({
        body: 'Great article!',
        authorId: 'test-user-id',
        articleSlug: 'test-article-123',
      });
    });
  });

  describe('deleteAComment', () => {
    it('should delete own comment successfully', async () => {
      mockCommentService.findOne.mockResolvedValue({
        id: 'comment-1', authorId: 'test-user-id', articleSlug: 'test-article-123', body: 'comment',
      });
      mockCommentService.softDelete.mockResolvedValue({ affected: 1 });

      const result = await controller.deleteAComment(mockReq, 'test-article-123', 'comment-1');

      expect(result.success).toBe(true);
      expect(mockCommentService.softDelete).toHaveBeenCalledWith({
        articleSlug: 'test-article-123',
        id: 'comment-1',
      });
    });

    it('should throw UnauthorizedException when deleting another user\'s comment', async () => {
      mockCommentService.findOne.mockResolvedValue({
        id: 'comment-1', authorId: 'other-user-id', articleSlug: 'test-article-123', body: 'comment',
      });

      await expect(
        controller.deleteAComment(mockReq, 'test-article-123', 'comment-1')
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw NotFoundException when comment does not exist', async () => {
      mockCommentService.findOne.mockResolvedValue(null);

      await expect(
        controller.deleteAComment(mockReq, 'test-article-123', 'nonexistent-id')
      ).rejects.toThrow(NotFoundException);
    });
  });

  // --- Tags ---

  describe('findAllTags', () => {
    it('should return list of tag names', async () => {
      const tags = [{ name: 'javascript' }, { name: 'typescript' }, { name: 'nestjs' }];
      mockTagService.findAll.mockResolvedValue(tags);
      mockTagService.count.mockResolvedValue(3);

      const result = await controller.findAllTags({});

      expect(result.success).toBe(true);
      expect(result.listData).toEqual(['javascript', 'typescript', 'nestjs']);
      expect(result.total).toBe(3);
    });
  });
});

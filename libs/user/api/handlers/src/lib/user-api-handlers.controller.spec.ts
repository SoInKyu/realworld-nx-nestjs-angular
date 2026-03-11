jest.mock('@nestjs/typeorm', () => ({
  InjectRepository: () => () => {},
  TypeOrmModule: { forFeature: () => ({ module: class {} }) },
}));

import { NotFoundException } from '@nestjs/common';
import { UserApiHandlersController } from './user-api-handlers.controller';

describe('UserApiHandlersController', () => {
  let controller: UserApiHandlersController;
  let mockUserService: any;
  let mockFollowService: any;

  const mockReq = {
    user: { sub: 'test-user-id' },
    headers: { authorization: 'Bearer test-token' },
  };

  const mockUser = {
    id: 'test-user-id',
    username: 'testuser',
    email: 'test@test.com',
    password: 'hashed-password',
    bio: 'bio',
    image: 'image.jpg',
  };

  const mockProfile = {
    username: 'testuser',
    bio: 'bio',
    image: 'image.jpg',
    following: false,
  };

  beforeEach(() => {
    mockUserService = {
      login: jest.fn(),
      register: jest.fn(),
      updateUserInfo: jest.fn(),
      findOne: jest.fn(),
      getJwtInfo: jest.fn(),
      getProfile: jest.fn(),
    };
    mockFollowService = {
      insert: jest.fn(),
      softDelete: jest.fn(),
    };

    controller = new UserApiHandlersController(
      mockUserService as any,
      mockFollowService as any
    );

    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should login and return action success response', async () => {
      const loginData = { email: 'test@test.com', password: 'password' };
      const loginResult = { id: 'test-user-id', email: 'test@test.com', token: 'jwt-token' };
      mockUserService.login.mockResolvedValue(loginResult);

      const result = await controller.login(loginData as any);

      expect(result.success).toBe(true);
      expect((result as any).data).toEqual(loginResult);
      expect(mockUserService.login).toHaveBeenCalledWith(loginData);
    });
  });

  describe('register', () => {
    it('should register and return action success response', async () => {
      const registerData = { username: 'newuser', email: 'new@test.com', password: 'password' };
      const registerResult = { id: 'new-id', username: 'newuser', email: 'new@test.com', token: 'jwt-token' };
      mockUserService.register.mockResolvedValue(registerResult);

      const result = await controller.register(registerData as any);

      expect(result.success).toBe(true);
      expect((result as any).data).toEqual(registerResult);
      expect(mockUserService.register).toHaveBeenCalledWith(registerData);
    });
  });

  describe('update', () => {
    it('should update user and return action success response', async () => {
      const updateData = { bio: 'updated bio' };
      const updateResult = { id: 'test-user-id', bio: 'updated bio' };
      mockUserService.updateUserInfo.mockResolvedValue(updateResult);

      const result = await controller.update(mockReq, updateData);

      expect(result.success).toBe(true);
      expect((result as any).data).toEqual(updateResult);
      expect(mockUserService.updateUserInfo).toHaveBeenCalledWith('test-user-id', updateData);
    });
  });

  describe('getCurrentUser', () => {
    it('should return current user without password', async () => {
      mockUserService.findOne.mockResolvedValue(mockUser);

      const result = await controller.getCurrentUser(mockReq);

      expect(result.success).toBe(true);
      expect(result.detailData).not.toHaveProperty('password');
      expect(result.detailData).toHaveProperty('username', 'testuser');
      expect(mockUserService.findOne).toHaveBeenCalledWith({ id: 'test-user-id' });
    });
  });

  describe('getProfile', () => {
    it('should return profile for existing user', async () => {
      mockUserService.findOne.mockResolvedValue(mockUser);
      mockUserService.getJwtInfo.mockReturnValue({ sub: 'test-user-id' });
      mockUserService.getProfile.mockResolvedValue(mockProfile);

      const result = await controller.getProfile(mockReq, 'testuser');

      expect(result.success).toBe(true);
      expect(result.detailData).toEqual(mockProfile);
      expect(mockUserService.findOne).toHaveBeenCalledWith({ username: 'testuser' });
      expect(mockUserService.getProfile).toHaveBeenCalledWith('test-user-id', mockUser);
    });

    it('should throw NotFoundException when user does not exist', async () => {
      mockUserService.findOne.mockResolvedValue(null);

      await expect(
        controller.getProfile(mockReq, 'nonexistent')
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('followAUser', () => {
    it('should follow a user and return profile', async () => {
      mockUserService.findOne.mockResolvedValue(mockUser);
      mockFollowService.insert.mockResolvedValue({});
      mockUserService.getProfile.mockResolvedValue({ ...mockProfile, following: true });

      const result = await controller.followAUser(mockReq, 'testuser');

      expect(result.success).toBe(true);
      expect(mockFollowService.insert).toHaveBeenCalledWith({
        followedId: 'test-user-id',
        followerId: 'test-user-id',
      });
      expect(mockUserService.getProfile).toHaveBeenCalledWith('test-user-id', mockUser);
    });

    it('should throw NotFoundException when user does not exist', async () => {
      mockUserService.findOne.mockResolvedValue(null);

      await expect(
        controller.followAUser(mockReq, 'nonexistent')
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('unfollowAUser', () => {
    it('should unfollow a user and return profile', async () => {
      mockUserService.findOne.mockResolvedValue(mockUser);
      mockFollowService.softDelete.mockResolvedValue({ affected: 1 });
      mockUserService.getProfile.mockResolvedValue(mockProfile);

      const result = await controller.unfollowAUser(mockReq, 'testuser');

      expect(result.success).toBe(true);
      expect(mockFollowService.softDelete).toHaveBeenCalledWith({
        followedId: 'test-user-id',
        followerId: 'test-user-id',
      });
      expect(mockUserService.getProfile).toHaveBeenCalledWith('test-user-id', mockUser);
    });

    it('should throw NotFoundException when user does not exist', async () => {
      mockUserService.findOne.mockResolvedValue(null);

      await expect(
        controller.unfollowAUser(mockReq, 'nonexistent')
      ).rejects.toThrow(NotFoundException);
    });
  });
});

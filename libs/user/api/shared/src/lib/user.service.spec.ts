jest.mock('@nestjs/typeorm', () => ({
  InjectRepository: () => () => {},
}));

import { BadRequestException, NotFoundException } from '@nestjs/common';
import { UserService } from './user.service';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('UserService', () => {
  let service: UserService;
  let mockRepository: any;
  let mockJwtService: any;
  let mockFollowService: any;

  const mockUser = {
    id: 'user-1',
    email: 'test@test.com',
    username: 'testuser',
    password: 'hashedPassword',
    bio: 'test bio',
    image: 'test-image.jpg',
    createdAt: new Date('2026-01-01'),
  };

  beforeEach(() => {
    mockRepository = {
      findOne: jest.fn(),
      insert: jest.fn(),
      update: jest.fn(),
      find: jest.fn(),
      count: jest.fn(),
      softDelete: jest.fn(),
    };
    mockJwtService = {
      sign: jest.fn().mockReturnValue('jwt-token'),
      decode: jest.fn(),
    };
    mockFollowService = {
      findOne: jest.fn(),
    };

    service = new UserService(
      mockRepository as any,
      mockJwtService as any,
      mockFollowService as any
    );

    jest.clearAllMocks();
    mockJwtService.sign.mockReturnValue('jwt-token');
  });

  describe('login', () => {
    it('should return user with token on successful login', async () => {
      mockRepository.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.login({ email: 'test@test.com', password: 'password123' });

      expect(result).toHaveProperty('token', 'jwt-token');
      expect(result).toHaveProperty('email', 'test@test.com');
      expect(result).toHaveProperty('username', 'testuser');
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        sub: 'user-1',
        email: 'test@test.com',
        username: 'testuser',
      });
    });

    it('should throw NotFoundException when email does not exist', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(
        service.login({ email: 'nonexistent@test.com', password: 'password123' })
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when password is wrong', async () => {
      mockRepository.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.login({ email: 'test@test.com', password: 'wrongpassword' })
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('register', () => {
    it('should create user with hashed password and return token', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-new-password');
      mockRepository.insert.mockResolvedValue({ identifiers: [{ id: 'new-id' }] });

      const newUser = { username: 'newuser', email: 'new@test.com', password: 'password123' };
      const result = await service.register(newUser);

      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(result.password).toBeNull();
      expect(result).toHaveProperty('token', 'jwt-token');
      expect(mockRepository.insert).toHaveBeenCalled();
    });

    it('should throw BadRequestException when email or username already exists', async () => {
      mockRepository.findOne.mockResolvedValue(mockUser);

      await expect(
        service.register({ username: 'testuser', email: 'test@test.com', password: 'password123' })
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('updateUserInfo', () => {
    it('should update user info with password change', async () => {
      mockRepository.findOne.mockResolvedValue(mockUser);
      (bcrypt.hash as jest.Mock).mockResolvedValue('new-hashed-password');
      mockRepository.update.mockResolvedValue({ affected: 1 });

      const result = await service.updateUserInfo('user-1', {
        username: 'updated',
        password: 'newpassword',
      });

      expect(bcrypt.hash).toHaveBeenCalledWith('newpassword', 10);
      expect(result.password).toBeNull();
      expect(result).toHaveProperty('token', 'jwt-token');
    });

    it('should update user info without password change', async () => {
      mockRepository.findOne.mockResolvedValue(mockUser);
      mockRepository.update.mockResolvedValue({ affected: 1 });

      const result = await service.updateUserInfo('user-1', { username: 'updated' });

      expect(bcrypt.hash).not.toHaveBeenCalled();
      expect(result.username).toBe('updated');
      expect(result).toHaveProperty('token');
    });

    it('should throw BadRequestException when user does not exist', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(
        service.updateUserInfo('nonexistent-id', { username: 'test' })
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getProfile', () => {
    it('should return profile with following=true when user follows', async () => {
      mockFollowService.findOne.mockResolvedValue({ id: 'follow-1' });

      const result = await service.getProfile('requester-id', mockUser as any);

      expect(result).toEqual({
        username: 'testuser',
        bio: 'test bio',
        image: 'test-image.jpg',
        following: true,
        createdAt: mockUser.createdAt,
      });
      expect(mockFollowService.findOne).toHaveBeenCalledWith({
        followerId: 'requester-id',
        followedId: 'user-1',
      });
    });

    it('should return profile with following=false when user does not follow', async () => {
      mockFollowService.findOne.mockResolvedValue(null);

      const result = await service.getProfile('requester-id', mockUser as any);

      expect(result.following).toBe(false);
    });

    it('should return following=false when requestUserId is null', async () => {
      const result = await service.getProfile(null, mockUser as any);

      expect(result.following).toBe(false);
      expect(mockFollowService.findOne).not.toHaveBeenCalled();
    });
  });

  describe('getJwtInfo', () => {
    it('should decode JWT from valid Authorization header', () => {
      const decoded = { sub: 'user-1', email: 'test@test.com', username: 'testuser', iat: 123, exp: 456 };
      mockJwtService.decode.mockReturnValue(decoded);

      const req = { headers: { authorization: 'Bearer valid-token' } };
      const result = service.getJwtInfo(req);

      expect(result).toEqual(decoded);
      expect(mockJwtService.decode).toHaveBeenCalledWith('valid-token');
    });

    it('should return null when no Authorization header', () => {
      const result = service.getJwtInfo({ headers: {} });
      expect(result).toBeNull();
    });

    it('should return null when Authorization header is malformed', () => {
      const result = service.getJwtInfo({ headers: { authorization: 'InvalidFormat' } });
      expect(result).toBeNull();
    });

    it('should return null when req has no headers', () => {
      const result = service.getJwtInfo({});
      expect(result).toBeNull();
    });
  });
});

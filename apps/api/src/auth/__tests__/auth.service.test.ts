import { describe, it, expect, beforeEach } from 'vitest';
import { Test } from '@nestjs/testing';
import { UnauthorizedException, ConflictException } from '@nestjs/common';
import { AuthService } from '../auth.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [AuthService],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('login', () => {
    it('should return user and token for valid credentials', async () => {
      const result = await service.login({
        email: 'demo@example.com',
        password: 'password123',
      });
      expect(result.user).toEqual({
        id: '1',
        email: 'demo@example.com',
        name: 'Demo User',
      });
      expect(result.token).toBe('mock-jwt-token-1');
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      await expect(
        service.login({ email: 'demo@example.com', password: 'wrong' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('register', () => {
    it('should register a new user and return user with token', async () => {
      const result = await service.register({
        email: 'new@example.com',
        password: 'securepass',
        name: 'New User',
      });
      expect(result.user.email).toBe('new@example.com');
      expect(result.user.name).toBe('New User');
      expect(result.token).toMatch(/^mock-jwt-token-/);
    });

    it('should throw ConflictException for duplicate email', async () => {
      await expect(
        service.register({
          email: 'demo@example.com',
          password: 'password123',
          name: 'Duplicate',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('forgotPassword', () => {
    it('should return a message for any email', async () => {
      const result = await service.forgotPassword({
        email: 'anyone@example.com',
      });
      expect(result.message).toContain('anyone@example.com');
    });
  });
});

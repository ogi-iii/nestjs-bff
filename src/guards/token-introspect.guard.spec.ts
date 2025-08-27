import { TokenIntrospectGuard } from './token-introspect.guard';
import { Reflector } from '@nestjs/core';
import { TokenCacheService } from '../caches/token-cache.service';
import { UnauthorizedException, ExecutionContext } from '@nestjs/common';
import axios from 'axios';
import { OIDC_COOKIES } from '../constants/oidc-cookie.constant';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('TokenIntrospectGuard', () => {
  let guard: TokenIntrospectGuard;
  let reflector: Reflector;
  let tokenCacheService: TokenCacheService;
  let context: ExecutionContext;

  beforeEach(() => {
    reflector = { get: jest.fn() } as any;
    tokenCacheService = { getAccessToken: jest.fn() } as any;
    guard = new TokenIntrospectGuard(reflector, tokenCacheService);

    context = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn(),
      }),
      getHandler: jest.fn(),
    } as any;
  });

  describe('canActivate', () => {
    it('should throw UnauthorizedException if token is not found', async () => {
      const req = { cookies: { [OIDC_COOKIES.BFF_OIDC_SESSION]: 'session' } };
      (context.switchToHttp().getRequest as jest.Mock).mockReturnValue(req);
      (tokenCacheService.getAccessToken as jest.Mock).mockResolvedValue(null);

      await expect(guard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if session cookie is missing', async () => {
      const req = { cookies: {} };
      (context.switchToHttp().getRequest as jest.Mock).mockReturnValue(req);

      await expect(guard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should call authorize with correct params', async () => {
      const req = { cookies: { [OIDC_COOKIES.BFF_OIDC_SESSION]: 'session' } };
      (context.switchToHttp().getRequest as jest.Mock).mockReturnValue(req);
      (tokenCacheService.getAccessToken as jest.Mock).mockResolvedValue(
        'token',
      );
      (reflector.get as jest.Mock).mockReturnValue('endpoint');
      jest.spyOn(guard as any, 'authorize').mockResolvedValue(true);

      const result = await guard.canActivate(context);
      expect(result).toBe(true);
      expect((guard as any).authorize).toHaveBeenCalledWith(
        'token',
        'endpoint',
      );
    });
  });

  describe('extractToken', () => {
    it('should throw UnauthorizedException if cookie is missing', async () => {
      const req = { cookies: {} };
      await expect((guard as any).extractToken(req)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should return token from cache', async () => {
      const req = { cookies: { [OIDC_COOKIES.BFF_OIDC_SESSION]: 'session' } };
      (tokenCacheService.getAccessToken as jest.Mock).mockResolvedValue(
        'token',
      );
      const token = await (guard as any).extractToken(req);
      expect(token).toBe('token');
    });
  });

  describe('authorize', () => {
    beforeEach(() => {
      process.env.KEYCLOAK_CLIENT_ID = 'client';
      process.env.KEYCLOAK_CLIENT_SECRET = 'secret';
    });

    it('should return true if token is active', async () => {
      mockedAxios.post.mockResolvedValue({ data: { active: true } });
      const result = await (guard as any).authorize('token', 'endpoint');
      expect(result).toBe(true);
    });

    it('should throw UnauthorizedException if token is not active', async () => {
      mockedAxios.post.mockResolvedValue({ data: { active: false } });
      await expect(
        (guard as any).authorize('token', 'endpoint'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException on axios error', async () => {
      mockedAxios.post.mockRejectedValue(new Error('Network error'));
      await expect(
        (guard as any).authorize('token', 'endpoint'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});

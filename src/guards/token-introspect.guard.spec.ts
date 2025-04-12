import { ExecutionContext } from '@nestjs/common';
import { TokenIntrospectGuard } from './token-introspect.guard';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('TokenIntrospectGuard', () => {
  let guard: TokenIntrospectGuard;
  const introspectionEndpoint = 'http://example.com/introspect';

  beforeEach(() => {
    guard = new TokenIntrospectGuard(introspectionEndpoint);
  });

  describe('canActivate', () => {
    it('should return true if the token is valid', async () => {
      const context: ExecutionContext = {
        switchToHttp: () => ({
          getRequest: () => ({
            headers: { authorization: 'Bearer valid-token' },
          }),
        }),
      } as ExecutionContext;

      mockedAxios.post.mockResolvedValueOnce({ data: { active: true } });

      const result = await guard.canActivate(context);
      expect(result).toBe(true);
      expect(mockedAxios.post).toHaveBeenCalledWith(
        introspectionEndpoint,
        { token: 'valid-token', token_type_hint: 'access_token' },
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: expect.stringContaining('Basic '),
          }),
        }),
      );
    });

    it('should throw UnauthorizedException if the token is invalid', async () => {
      const context: ExecutionContext = {
        switchToHttp: () => ({
          getRequest: () => ({
            headers: { authorization: 'Bearer invalid-token' },
          }),
        }),
      } as ExecutionContext;

      mockedAxios.post.mockResolvedValueOnce({ data: { active: false } });

      await expect(guard.canActivate(context)).rejects.toThrow(
        'Token was NOT active.',
      );
    });

    it('should throw UnauthorizedException if no token is provided', async () => {
      const context: ExecutionContext = {
        switchToHttp: () => ({
          getRequest: () => ({
            headers: {},
          }),
        }),
      } as ExecutionContext;

      await expect(guard.canActivate(context)).rejects.toThrow(
        'Access token was NOT found.',
      );
    });

    it('should throw UnauthorizedException if the authorization header does not start with "Bearer "', async () => {
      const context: ExecutionContext = {
        switchToHttp: () => ({
          getRequest: () => ({
            headers: { authorization: 'Basic test-token' },
          }),
        }),
      } as ExecutionContext;

      await expect(guard.canActivate(context)).rejects.toThrow(
        'Access token was NOT found.',
      );
    });

    it('should throw UnauthorizedException if axios throws an error', async () => {
      const context: ExecutionContext = {
        switchToHttp: () => ({
          getRequest: () => ({
            headers: { authorization: 'Bearer valid-token' },
          }),
        }),
      } as ExecutionContext;

      const expectedErrorMessage = 'Network error';
      mockedAxios.post.mockRejectedValueOnce(new Error(expectedErrorMessage));

      await expect(guard.canActivate(context)).rejects.toThrow(
        expectedErrorMessage,
      );
    });
  });
});

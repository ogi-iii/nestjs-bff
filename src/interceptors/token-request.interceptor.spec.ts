import { TokenRequestInterceptor } from './token-request.interceptor';
import { CallHandler, ExecutionContext } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { of } from 'rxjs';
import * as jwt from 'jsonwebtoken';
import { TokenCacheService } from '../caches/token-cache.service';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';

jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mock-oidc-session-value'),
}));

describe('TokenRequestInterceptor', () => {
  let interceptor: TokenRequestInterceptor;
  let cacheManagerService: Cache;

  beforeEach(async () => {
    cacheManagerService = {
      set: jest.fn().mockResolvedValue('mock-oidc-session-value'),
      get: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TokenRequestInterceptor,
        TokenCacheService,
        { provide: CACHE_MANAGER, useValue: cacheManagerService },
      ],
    }).compile();

    interceptor = module.get<TokenRequestInterceptor>(TokenRequestInterceptor);
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  it('should set code verifier in query parameter and clear cookies after processing', () => {
    const mockRequest = {
      cookies: {
        NONCE: 'test-nonce',
        CODE_VERIFIER: 'test-code-verifier',
      },
      query: {},
    } as any;

    const mockResponse = {
      cookie: jest.fn(),
    } as any;

    const context: ExecutionContext = {
      switchToHttp: jest.fn(() => ({
        getRequest: () => mockRequest,
        getResponse: () => mockResponse,
      })),
    } as any;

    const mockCallHandler: CallHandler = {
      handle: jest.fn(() =>
        of({
          data: {
            id_token: jwt.sign({ nonce: 'test-nonce' }, 'secret'),
            access_token: 'test-access-token',
          },
        }),
      ),
    };

    interceptor.intercept(context, mockCallHandler).subscribe();

    expect(mockRequest.query).toHaveProperty('code_verifier');
    expect(mockRequest.query.code_verifier).toBe(
      mockRequest.cookies.CODE_VERIFIER,
    );

    expect(mockResponse.cookie).toHaveBeenCalledWith(
      expect.stringMatching(/STATE|NONCE|CODE_VERIFIER/),
      expect.stringMatching(''),
      expect.objectContaining({
        maxAge: 0,
      }),
    );
  });

  it('should throw UnauthorizedException if nothing is found in cookies', () => {
    const mockRequest = {
      cookies: {},
    } as any;

    const context: ExecutionContext = {
      switchToHttp: jest.fn(() => ({
        getRequest: () => mockRequest,
      })),
    } as any;

    const mockCallHandler: CallHandler = {
      handle: jest.fn(() => of('test')),
    };

    expect(() => interceptor.intercept(context, mockCallHandler)).toThrow(
      'Nonce was NOT found.',
    );
  });

  it('should throw UnauthorizedException if nonce is not found in cookies', () => {
    const mockRequest = {
      cookies: {
        CODE_VERIFIER: 'test-code-verifier',
      },
    } as any;

    const context: ExecutionContext = {
      switchToHttp: jest.fn(() => ({
        getRequest: () => mockRequest,
      })),
    } as any;

    const mockCallHandler: CallHandler = {
      handle: jest.fn(() => of('test')),
    };

    expect(() => interceptor.intercept(context, mockCallHandler)).toThrow(
      'Nonce was NOT found.',
    );
  });

  it('should throw UnauthorizedException if code_verifier is not found in cookies', () => {
    const mockRequest = {
      cookies: {
        NONCE: 'test-nonce',
      },
    } as any;

    const context: ExecutionContext = {
      switchToHttp: jest.fn(() => ({
        getRequest: () => mockRequest,
      })),
    } as any;

    const mockCallHandler: CallHandler = {
      handle: jest.fn(() => of('test')),
    };

    expect(() => interceptor.intercept(context, mockCallHandler)).toThrow(
      'PKCE was invalid.',
    );
  });

  it('should throw UnauthorizedException if id token is not found in response body', (done) => {
    const mockRequest = {
      cookies: {
        NONCE: 'test-nonce',
        CODE_VERIFIER: 'test-code-verifier',
      },
      query: {},
    } as any;

    const mockResponse = {
      cookie: jest.fn(),
    } as any;

    const context: ExecutionContext = {
      switchToHttp: jest.fn(() => ({
        getRequest: () => mockRequest,
        getResponse: () => mockResponse,
      })),
    } as any;

    const mockCallHandler: CallHandler = {
      handle: jest.fn(() => of({ data: {} })),
    };

    interceptor.intercept(context, mockCallHandler).subscribe({
      error: (err) => {
        expect(err.message).toBe('ID token was NOT found.');
        done();
      },
    });
  });

  it('should throw UnauthorizedException if nonce in id token does not match expected nonce', (done) => {
    const mockRequest = {
      cookies: {
        NONCE: 'test-nonce',
        CODE_VERIFIER: 'test-code-verifier',
      },
      query: {},
    } as any;

    const mockResponse = {
      cookie: jest.fn(),
    } as any;

    const context: ExecutionContext = {
      switchToHttp: jest.fn(() => ({
        getRequest: () => mockRequest,
        getResponse: () => mockResponse,
      })),
    } as any;

    const mockCallHandler: CallHandler = {
      handle: jest.fn(() =>
        of({
          data: {
            id_token: jwt.sign({ nonce: 'different-nonce' }, 'secret'),
          },
        }),
      ),
    };

    interceptor.intercept(context, mockCallHandler).subscribe({
      error: (err) => {
        expect(err.message).toBe('Nonce was invalid.');
        done();
      },
    });
  });

  it('should throw UnauthorizedException if nonce is missing in id token', (done) => {
    const mockRequest = {
      cookies: {
        NONCE: 'test-nonce',
        CODE_VERIFIER: 'test-code-verifier',
      },
      query: {},
    } as any;

    const mockResponse = {
      cookie: jest.fn(),
    } as any;

    const context: ExecutionContext = {
      switchToHttp: jest.fn(() => ({
        getRequest: () => mockRequest,
        getResponse: () => mockResponse,
      })),
    } as any;

    const mockCallHandler: CallHandler = {
      handle: jest.fn(() =>
        of({
          data: {
            id_token: jwt.sign({}, 'secret'),
          },
        }),
      ),
    };

    interceptor.intercept(context, mockCallHandler).subscribe({
      error: (err) => {
        expect(err.message).toBe('Nonce was NOT found.');
        done();
      },
    });
  });

  it('should throw UnauthorizedException if access token is missing in response body', (done) => {
    const mockRequest = {
      cookies: {
        NONCE: 'test-nonce',
        CODE_VERIFIER: 'test-code-verifier',
      },
      query: {},
    } as any;

    const mockResponse = {
      cookie: jest.fn(),
    } as any;

    const context: ExecutionContext = {
      switchToHttp: jest.fn(() => ({
        getRequest: () => mockRequest,
        getResponse: () => mockResponse,
      })),
    } as any;

    const mockCallHandler: CallHandler = {
      handle: jest.fn(() =>
        of({
          data: {
            id_token: jwt.sign({ nonce: 'test-nonce' }, 'secret'),
          },
        }),
      ),
    };

    interceptor.intercept(context, mockCallHandler).subscribe({
      error: (err) => {
        expect(err.message).toBe('Access token was NOT found.');
        done();
      },
    });
  });

  it('should set oidc-session cookie with correct options and return expected response', (done) => {
    process.env.REDIS_TTL_MILLISECONDS = '10000';
    const mockRequest = {
      cookies: {
        NONCE: 'test-nonce',
        CODE_VERIFIER: 'test-code-verifier',
      },
      query: {},
      secure: true,
    } as any;

    const mockResponse = {
      cookie: jest.fn(),
    } as any;

    const context: ExecutionContext = {
      switchToHttp: jest.fn(() => ({
        getRequest: () => mockRequest,
        getResponse: () => mockResponse,
      })),
    } as any;

    const mockCallHandler: CallHandler = {
      handle: jest.fn(() =>
        of({
          data: {
            id_token: jwt.sign({ nonce: 'test-nonce' }, 'secret'),
            access_token: 'test-access-token',
          },
        }),
      ),
    };
    interceptor.intercept(context, mockCallHandler).subscribe((result) => {
      // Find the call where SESSION cookie is set
      const sessionCookieCall = mockResponse.cookie.mock.calls.find(
        (call: any[]) => call[0].match(/SESSION/),
      );
      expect(sessionCookieCall).toBeDefined();
      expect(sessionCookieCall[1]).toBe('mock-oidc-session-value');
      expect(sessionCookieCall[2]).toEqual(
        expect.objectContaining({
          httpOnly: true,
          sameSite: 'strict',
          secure: true,
          maxAge: 10000,
        }),
      );
      expect(result).toEqual({
        data: { authorization: 'succeeded' },
      });
      done();
    });
  });
});

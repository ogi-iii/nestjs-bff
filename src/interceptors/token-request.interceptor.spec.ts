import { TokenRequestInterceptor } from './token-request.interceptor';
import { CallHandler, ExecutionContext } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { of } from 'rxjs';
import * as jwt from 'jsonwebtoken';

describe('TokenRequestInterceptor', () => {
  let interceptor: TokenRequestInterceptor;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TokenRequestInterceptor],
    }).compile();

    interceptor = module.get<TokenRequestInterceptor>(TokenRequestInterceptor);
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  it('should set code verifier in query parameter and clear cookies after processing', () => {
    const mockRequest = {
      cookies: {
        nonce: 'test-nonce',
        codeVerifier: 'test-code-verifier',
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

    interceptor.intercept(context, mockCallHandler).subscribe();

    expect(mockRequest.query).toHaveProperty('code_verifier');
    expect(mockRequest.query.code_verifier).toBe(
      mockRequest.cookies.codeVerifier,
    );

    expect(mockResponse.cookie).toHaveBeenCalledWith(
      expect.stringMatching(/state|nonce|codeVerifier/),
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
        codeVerifier: 'test-code-verifier',
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
        nonce: 'test-nonce',
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
        nonce: 'test-nonce',
        codeVerifier: 'test-code-verifier',
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
        expect(err.message).toBe('ID Token was NOT found.');
        done();
      },
    });
  });

  it('should throw UnauthorizedException if nonce in id token does not match expected nonce', (done) => {
    const mockRequest = {
      cookies: {
        nonce: 'test-nonce',
        codeVerifier: 'test-code-verifier',
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
});

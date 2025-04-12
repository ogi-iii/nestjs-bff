import { AuthenticationRequestInterceptor } from './authentication-request.interceptor';
import { CallHandler, ExecutionContext } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { of } from 'rxjs';

describe('AuthenticationRequestInterceptor', () => {
  let interceptor: AuthenticationRequestInterceptor;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthenticationRequestInterceptor],
    }).compile();

    interceptor = module.get<AuthenticationRequestInterceptor>(
      AuthenticationRequestInterceptor,
    );
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  it('should set state, nonce, and PKCE values in query params and cookies', () => {
    const mockRequest = {
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
      handle: jest.fn(() => of('test')),
    };

    interceptor.intercept(context, mockCallHandler).subscribe();

    expect(mockRequest.query).toHaveProperty('state');
    expect(mockRequest.query).toHaveProperty('nonce');
    expect(mockRequest.query).toHaveProperty('code_challenge');
    expect(mockRequest.query).toHaveProperty('code_challenge_method', 'S256');

    expect(mockResponse.cookie).toHaveBeenCalledWith(
      expect.stringMatching(/STATE|NONCE|CODE_VERIFIER/),
      expect.any(String),
      expect.objectContaining({
        httpOnly: true,
        sameSite: 'strict',
        secure: true,
        maxAge: 300 * 1000,
      }),
    );
  });

  it('should generate unique state, nonce, and PKCE values for each request', () => {
    const mockRequest1 = { query: {}, secure: true } as any;
    const mockResponse1 = { cookie: jest.fn() } as any;

    const mockRequest2 = { query: {}, secure: true } as any;
    const mockResponse2 = { cookie: jest.fn() } as any;

    const context1: ExecutionContext = {
      switchToHttp: jest.fn(() => ({
        getRequest: () => mockRequest1,
        getResponse: () => mockResponse1,
      })),
    } as any;

    const context2: ExecutionContext = {
      switchToHttp: jest.fn(() => ({
        getRequest: () => mockRequest2,
        getResponse: () => mockResponse2,
      })),
    } as any;

    const mockCallHandler: CallHandler = {
      handle: jest.fn(() => of('test')),
    };

    interceptor.intercept(context1, mockCallHandler).subscribe();
    interceptor.intercept(context2, mockCallHandler).subscribe();

    expect(mockRequest1.query.state).not.toBe(mockRequest2.query.state);
    expect(mockRequest1.query.nonce).not.toBe(mockRequest2.query.nonce);
    expect(mockRequest1.query.code_challenge).not.toBe(
      mockRequest2.query.code_challenge,
    );
  });

  it('should handle secure flag in cookies based on request security', () => {
    const mockRequest = {
      query: {},
      secure: false,
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
      handle: jest.fn(() => of('test')),
    };

    interceptor.intercept(context, mockCallHandler).subscribe();

    expect(mockResponse.cookie).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(String),
      expect.objectContaining({
        secure: false,
      }),
    );
  });
});

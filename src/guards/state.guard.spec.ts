import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext } from '@nestjs/common';
import { StateGuard } from './state.guard';

describe('StateGuard', () => {
  let guard: StateGuard;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StateGuard],
    }).compile();

    guard = module.get<StateGuard>(StateGuard);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should return true for canActivate', () => {
    const context: ExecutionContext = {
      switchToHttp: () => ({
        getRequest: () => ({
          query: { state: 'valid-state' },
          cookies: { state: 'valid-state' },
        }),
      }),
    } as ExecutionContext;
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should throw UnauthorizedException if state is not found in query', () => {
    const context: ExecutionContext = {
      switchToHttp: () => ({
        getRequest: () => ({
          query: {},
          cookies: { state: 'valid-state' },
        }),
      }),
    } as ExecutionContext;
    expect(() => guard.canActivate(context)).toThrow('State was NOT found.');
  });

  it('should throw UnauthorizedException if state is not found in cookie', () => {
    const context: ExecutionContext = {
      switchToHttp: () => ({
        getRequest: () => ({
          query: { state: 'valid-state' },
          cookies: {},
        }),
      }),
    } as ExecutionContext;
    expect(() => guard.canActivate(context)).toThrow('State was NOT found.');
  });

  it('should throw UnauthorizedException if state is invalid between in query and cookie', () => {
    const context: ExecutionContext = {
      switchToHttp: () => ({
        getRequest: () => ({
          query: { state: 'invalid-state' },
          cookies: { state: 'valid-state' },
        }),
      }),
    } as ExecutionContext;
    expect(() => guard.canActivate(context)).toThrow('State was invalid.');
  });
});

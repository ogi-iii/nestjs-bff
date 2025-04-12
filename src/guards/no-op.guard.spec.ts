import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext } from '@nestjs/common';
import { NoOpGuard } from './no-op.guard';

describe('StateGuard', () => {
  let guard: NoOpGuard;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NoOpGuard],
    }).compile();

    guard = module.get<NoOpGuard>(NoOpGuard);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should return true for canActivate', () => {
    const context: ExecutionContext = {} as ExecutionContext;
    expect(guard.canActivate(context)).toBe(true);
  });
});

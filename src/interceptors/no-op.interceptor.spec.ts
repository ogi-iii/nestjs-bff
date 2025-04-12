import { NoOpInterceptor } from './no-op.interceptor';
import { CallHandler, ExecutionContext } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { of } from 'rxjs';

describe('NoOpInterceptor', () => {
  let interceptor: NoOpInterceptor;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NoOpInterceptor],
    }).compile();

    interceptor = module.get<NoOpInterceptor>(NoOpInterceptor);
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  it('should pass through the observable without modification', (done) => {
    const context: ExecutionContext = {} as ExecutionContext;
    const mockCallHandler: CallHandler = {
      handle: jest.fn(() => of('test')),
    };

    interceptor.intercept(context, mockCallHandler).subscribe((result) => {
      expect(result).toBe('test');
      done(); // wait until callback is called
    });

    expect(mockCallHandler.handle).toHaveBeenCalled();
  });
});

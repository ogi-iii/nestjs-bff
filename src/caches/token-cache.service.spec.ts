import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Test, TestingModule } from '@nestjs/testing';
import { TokenCacheService } from './token-cache.service';
import { Cache } from 'cache-manager';

jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mocked-uuid'),
}));

describe('TokenCacheService', () => {
  let service: TokenCacheService;
  let cacheManagerService: Cache;

  beforeEach(async () => {
    cacheManagerService = {
      set: jest.fn(),
      get: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TokenCacheService,
        { provide: CACHE_MANAGER, useValue: cacheManagerService },
      ],
    }).compile();

    service = module.get<TokenCacheService>(TokenCacheService);
    process.env.REDIS_TTL_MILLISECONDS = '1000';
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('set', () => {
    it('should store access token and return session cookie value', async () => {
      (cacheManagerService.set as jest.Mock).mockResolvedValue(undefined);

      const result = await service.set(
        'access-token',
        parseInt(process.env.REDIS_TTL_MILLISECONDS),
      );
      expect(result).toBe('mocked-uuid');
      expect(cacheManagerService.set).toHaveBeenCalledWith(
        'mocked-uuid',
        'access-token',
        1000,
      );
    });
  });

  describe('getAccessToken', () => {
    it('should get access token from cache', async () => {
      (cacheManagerService.get as jest.Mock).mockResolvedValue('access-token');
      const result = await service.getAccessToken('mocked-uuid');
      expect(result).toBe('access-token');
      expect(cacheManagerService.get).toHaveBeenCalledWith('mocked-uuid');
    });

    it('should return undefined if token not found', async () => {
      (cacheManagerService.get as jest.Mock).mockResolvedValue(undefined);
      const result = await service.getAccessToken('unknown-uuid');
      expect(result).toBeUndefined();
      expect(cacheManagerService.get).toHaveBeenCalledWith('unknown-uuid');
    });
  });
});

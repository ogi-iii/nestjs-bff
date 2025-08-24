import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { v4 as uuidV4 } from 'uuid';

/**
 * Access Token Cache Service
 */
@Injectable()
export class TokenCacheService {
  constructor(@Inject(CACHE_MANAGER) private cacheManagerService: Cache) {}

  /**
   * Set the access token in the cache using session cookie value as the key.
   *
   * @param accessToken Target access token which is stored in the cache.
   * @returns Session cookie value which is the key to get the access token from cache.
   */
  async set(accessToken: string): Promise<string> {
    const sessionCookieValue = uuidV4();
    await this.cacheManagerService.set(
      sessionCookieValue,
      accessToken,
      parseInt(process.env.REDIS_TTL_MILLISECONDS),
    ); // This setter method returns the stored access token.
    return sessionCookieValue;
  }

  /**
   * Get the access token from the cache using session cookie value as the key.
   *
   * @param sessionCookieValue Session cookie value which is the key to get the access token from cache.
   * @returns Target access token which is stored in the cache.
   */
  async getAccessToken(sessionCookieValue: string): Promise<string> {
    return await this.cacheManagerService.get(sessionCookieValue);
  }
}

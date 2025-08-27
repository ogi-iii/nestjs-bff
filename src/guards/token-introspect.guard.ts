import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import axios from 'axios';
import { TokenCacheService } from '../caches/token-cache.service';
import { OIDCMetadata } from '../decorators/oidc-metadata.decorator';
import { OIDC_COOKIES } from '../constants/oidc-cookie.constant';

/**
 * Token Introspection Guard for Authorization
 */
@Injectable()
export class TokenIntrospectGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly tokenCacheService: TokenCacheService,
  ) {}

  /**
   * Validate request in the target context by authorization.
   *
   * @param context Current execution context. Provides access to details about the current request pipeline.
   * @returns Value indicating whether or not the current request is allowed to proceed.
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = await this.extractToken(request);
    if (!token) {
      throw new UnauthorizedException('Access token was NOT found.');
    }
    const introspectionEndpoint = this.reflector.get(
      OIDCMetadata,
      context.getHandler(),
    );
    return await this.authorize(token, introspectionEndpoint);
  }

  /**
   * Extract access token from cache manager.
   *
   * @param request Http request.
   * @returns Access token.
   */
  private async extractToken(request: Request): Promise<string> {
    const sessionCookieValue = request.cookies[OIDC_COOKIES.BFF_OIDC_SESSION];
    if (!sessionCookieValue) {
      throw new UnauthorizedException('BFF_OIDC_SESSION cookie was NOT found.');
    }
    return await this.tokenCacheService.getAccessToken(sessionCookieValue);
  }

  /**
   * Authorize by token introspection.
   *
   * @param token Access token.
   * @param introspectionEndpoint Token introspection endpoint.
   * @returns Authorization result.
   */
  private async authorize(
    token: string,
    introspectionEndpoint: string,
  ): Promise<boolean> {
    try {
      const credentials = btoa(
        `${process.env.KEYCLOAK_CLIENT_ID}:${process.env.KEYCLOAK_CLIENT_SECRET}`,
      );
      const response = await axios.post(
        introspectionEndpoint,
        {
          token,
          token_type_hint: 'access_token',
        },
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: `Basic ${credentials}`,
          },
        },
      );
      if (!response.data.active) {
        throw new UnauthorizedException('Token was NOT active.');
      }
      return response.data.active;
    } catch (err) {
      throw new UnauthorizedException(err);
    }
  }
}

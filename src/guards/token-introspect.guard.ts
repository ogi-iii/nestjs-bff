import {
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import axios from 'axios';
import { config } from 'dotenv';

/**
 * Token Introspection Guard for Authorization
 */
export class TokenIntrospectGuard implements CanActivate {
  constructor(private readonly introspectionEndpoint: string) {}

  /**
   * Validate request in the target context by authorization.
   *
   * @param context Current execution context. Provides access to details about the current request pipeline.
   * @returns Value indicating whether or not the current request is allowed to proceed.
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractToken(request);
    if (!token) {
      throw new UnauthorizedException('Access token was NOT found.');
    }
    return await this.authorize(token);
  }

  /**
   * Extract access token from http request header.
   *
   * @param request Http request.
   * @returns Access token.
   */
  private extractToken(request: Request): string {
    const authHeader = request.headers['authorization'];
    const tokenPrefix = 'Bearer ';
    return authHeader && authHeader.startsWith(tokenPrefix)
      ? authHeader.substring(tokenPrefix.length)
      : undefined;
  }

  /**
   * Authorize by token introspection.
   *
   * @param token Access token.
   * @returns Authorization result.
   */
  private async authorize(token: string): Promise<boolean> {
    try {
      config();
      const response = await axios.post(
        this.introspectionEndpoint,
        {
          token,
          client_id: process.env.AUTH_CLIENT_ID,
          client_secret: process.env.AUTH_CLIENT_SECRET,
          token_hint: 'access_token',
        },
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
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

import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  UnauthorizedException,
} from '@nestjs/common';
import { CookieOptions, Request, Response } from 'express';
import { mergeMap, Observable } from 'rxjs';
import * as jwt from 'jsonwebtoken';
import { OIDC_COOKIES } from '../constants/oidc-cookie.constant';
import { TokenCacheService } from '../caches/token-cache.service';

/**
 * Token Request Interceptor to handle the value of nonce and PKCE for Authorization Code Flow
 */
@Injectable()
export class TokenRequestInterceptor implements NestInterceptor {
  private NONCE_NOT_FOUND_ERROR_MESSAGE: string = 'Nonce was NOT found.';

  constructor(private readonly tokenCacheService: TokenCacheService) {}

  /**
   * Check whether the values of nonce and PKCE are valid in the target context on authorization code flow.
   *
   * @param context an `ExecutionContext` object providing methods to access the
   * route handler and class about to be invoked.
   * @param next a reference to the `CallHandler`, which provides access to an
   * `Observable` representing the response stream from the route handler.
   */
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const cookies = request.cookies;
    const expectedNonce = cookies[OIDC_COOKIES.NONCE];
    if (!expectedNonce) {
      throw new UnauthorizedException(this.NONCE_NOT_FOUND_ERROR_MESSAGE);
    }
    const codeVerifier = cookies[OIDC_COOKIES.CODE_VERIFIER];
    if (!codeVerifier) {
      throw new UnauthorizedException('PKCE was invalid.');
    }
    const queryParams = request.query;
    queryParams.code_verifier = codeVerifier;

    const response = context.switchToHttp().getResponse<Response>();
    const cookieOptions: CookieOptions = {
      maxAge: 0, // delete immediately
    };
    const blankValue = '';
    response.cookie(OIDC_COOKIES.STATE, blankValue, cookieOptions);
    response.cookie(OIDC_COOKIES.NONCE, blankValue, cookieOptions);
    response.cookie(OIDC_COOKIES.CODE_VERIFIER, blankValue, cookieOptions);

    return next.handle().pipe(
      mergeMap(async (responseBody) => {
        const idToken = responseBody.data?.id_token;
        if (!idToken) {
          throw new UnauthorizedException('ID token was NOT found.');
        }
        const decodedIdToken = jwt.decode(idToken) as { nonce?: string };
        if (!decodedIdToken?.nonce) {
          throw new UnauthorizedException(this.NONCE_NOT_FOUND_ERROR_MESSAGE);
        }
        if (decodedIdToken.nonce !== expectedNonce) {
          throw new UnauthorizedException('Nonce was invalid.');
        }
        const accessToken = responseBody.data?.access_token;
        if (!accessToken) {
          throw new UnauthorizedException('Access token was NOT found.');
        }
        const oidcSessionValue = await this.tokenCacheService.set(
          accessToken,
          parseInt(process.env.REDIS_TTL_MILLISECONDS),
        );
        const oidcSessionCookieOptions: CookieOptions = {
          httpOnly: true,
          sameSite: 'strict',
          secure: request.secure,
          maxAge: parseInt(process.env.REDIS_TTL_MILLISECONDS),
        };
        response.cookie(
          OIDC_COOKIES.SESSION,
          oidcSessionValue,
          oidcSessionCookieOptions,
        );
        return {
          ...responseBody,
          data: { authorization: 'succeeded' },
        };
      }),
    );
  }
}

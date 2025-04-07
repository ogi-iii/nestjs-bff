import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { BinaryToTextEncoding, createHash, randomBytes } from 'crypto';
import { Request, Response } from 'express';
import { Observable } from 'rxjs';

/**
 * State, nonce and PKCE Interceptor to set the values for Authorization Code Flow
 */
@Injectable()
export class SetStateNoncePkceInterceptor implements NestInterceptor {
  private CODE_CHALLENGE_METHOD: string = 'S256';
  private HASH_ALGORITHM: string = 'sha256';
  private ENCODING: string = 'base64url';

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const state = this.generateRandomValue();
    const nonce = this.generateRandomValue();
    const codeVerifier = this.generateRandomValue();
    const codeChallenge = createHash(this.HASH_ALGORITHM)
      .update(codeVerifier)
      .digest(this.ENCODING as BinaryToTextEncoding);

    const request = context.switchToHttp().getRequest<Request>();
    const queryParams = request.query;
    queryParams.state = state;
    queryParams.nonce = nonce;
    queryParams.code_challenge = codeChallenge;
    queryParams.code_challenge_method = this.CODE_CHALLENGE_METHOD;

    const response = context.switchToHttp().getResponse<Response>();
    const cookieOptions = {
      httpOnly: true,
      maxAge: 600 * 1000, // 10 mins
    };
    response.cookie('state', state, cookieOptions);
    response.cookie('nonce', nonce, cookieOptions);
    response.cookie('codeVerifier', codeVerifier, cookieOptions);

    return next.handle();
  }

  /**
   * Generate the 32 bytes random value as url encoded string.
   *
   * @returns Generated random string.
   */
  private generateRandomValue(): string {
    return randomBytes(32).toString(this.ENCODING as BufferEncoding);
  }
}

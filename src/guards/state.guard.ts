import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { OIDC_COOKIES } from '../constants/oidc-cookie.constant';

/**
 * State Guard for Authorization Code Flow
 */
@Injectable()
export class StateGuard implements CanActivate {
  /**
   * Validate token request in the target context on authorization code flow.
   *
   * @param context Current execution context. Provides access to details about the current request pipeline.
   * @returns Value indicating whether or not the current request is allowed to proceed.
   */
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const queryParams = request.query;
    const stateCookie = request.cookies[OIDC_COOKIES.STATE];
    if (!queryParams.state || !stateCookie) {
      throw new UnauthorizedException('State was NOT found.');
    }
    const stateParameter = queryParams.state.toString();
    if (stateCookie !== stateParameter) {
      throw new UnauthorizedException('State was invalid.');
    }
    return true;
  }
}

import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { createHash, randomBytes } from 'crypto';
import { Request } from 'express';

/**
 * State and PKCE Guard for Authorization Code Flow
 */
@Injectable()
export class StatePkceGuard implements CanActivate {
  private stateSet: Set<string>;
  private stateCodeVerifierMap: Map<string, string>;

  constructor() {
    this.stateSet = new Set<string>();
    this.stateCodeVerifierMap = new Map<string, string>();
  }

  /**
   * Validate request in the target context on authorization code flow.
   *
   * @param context Current execution context. Provides access to details about the current request pipeline.
   * @returns Value indicating whether or not the current request is allowed to proceed.
   */
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const queryParams = request.query;
    if (!queryParams.state) {
      throw new UnauthorizedException('State was NOT found.');
    }
    const stateParameter = queryParams.state.toString();

    // for auth request
    if (!queryParams.code) {
      const codeChallenge = this.saveStateAndPKCE(stateParameter);
      queryParams.code_challenge = codeChallenge;
      queryParams.code_challenge_method = 'S256';
      return true;
    }

    // for token request
    this.authorize(stateParameter);
    if (!this.stateCodeVerifierMap.has(stateParameter)) {
      throw new UnauthorizedException('PKCE was invalid.');
    }
    queryParams.code_verifier = this.stateCodeVerifierMap.get(stateParameter);
    return this.stateCodeVerifierMap.delete(stateParameter);
  }

  /**
   * Save state and PKCE values in the guard instance.
   *
   * @param stateParameter State value in the query parameter.
   * @returns Code challenge value for PKCE.
   */
  private saveStateAndPKCE(stateParameter: string) {
    this.stateSet.add(stateParameter);

    const codeVerifier = this.generateRandomValue();
    this.stateCodeVerifierMap.set(stateParameter, codeVerifier);
    const codeChallenge = createHash('sha256')
      .update(codeVerifier)
      .digest('base64url');

    return codeChallenge;
  }

  /**
   * Generate the 32 bytes random value as url encoded string.
   *
   * @returns Generated random string.
   */
  private generateRandomValue(): string {
    return randomBytes(32).toString('base64url');
  }

  /**
   * Authorize by state parameter.
   *
   * @param stateParameter State value in the query parameter.
   * @returns Authorization result.
   */
  private authorize(stateParameter: string) {
    if (!this.stateSet.has(stateParameter)) {
      throw new UnauthorizedException('State was invalid.');
    }
    return this.stateSet.delete(stateParameter);
  }
}

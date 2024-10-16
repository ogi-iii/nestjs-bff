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
      throw new UnauthorizedException('State value was NOT found.');
    }
    const hasCodeChallengeParams =
      queryParams.code_challenge && queryParams.code_challenge_method;
    if (!hasCodeChallengeParams && !request.body.code_verifier) {
      throw new UnauthorizedException('PKCE values were NOT found.');
    }

    // for auth request
    if (hasCodeChallengeParams) {
      const { state, codeChallenge } = this.saveStateAndPKCE();
      queryParams.state = state;
      queryParams.code_challenge = codeChallenge;
      queryParams.code_challenge_method = 'S256';
      return true;
    }

    // for token request
    const stateParameter = queryParams.state.toString();
    this.authorize(stateParameter);
    if (!this.stateCodeVerifierMap.has(stateParameter)) {
      throw new UnauthorizedException('PKCE values were invalid.');
    }
    request.body.code_verifier = this.stateCodeVerifierMap.get(stateParameter);
    return this.stateCodeVerifierMap.delete(stateParameter);
  }

  /**
   * Save state and pkce values in the guard instance.
   *
   * @returns Saved state and pkce values.
   */
  private saveStateAndPKCE() {
    const state = this.generateRandomValue();
    this.stateSet.add(state);

    const codeVerifier = this.generateRandomValue();
    this.stateCodeVerifierMap.set(state, codeVerifier);

    const codeChallenge = createHash('sha256')
      .update(codeVerifier)
      .digest('base64url');

    return { state, codeChallenge };
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
      throw new UnauthorizedException('State value was invalid.');
    }
    return this.stateSet.delete(stateParameter);
  }
}

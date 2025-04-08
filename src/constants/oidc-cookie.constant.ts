export const OIDC_COOKIES = {
  STATE: 'state',
  NONCE: 'nonce',
  CODE_VERIFIER: 'codeVerifier',
} as const;

export type OidcCookies = (typeof OIDC_COOKIES)[keyof typeof OIDC_COOKIES];

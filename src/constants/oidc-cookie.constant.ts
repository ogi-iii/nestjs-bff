export const OIDC_COOKIES = {
  STATE: 'STATE',
  NONCE: 'NONCE',
  CODE_VERIFIER: 'CODE_VERIFIER',
  BFF_OIDC_SESSION: 'BFF_OIDC_SESSION',
} as const;

export type OidcCookies = (typeof OIDC_COOKIES)[keyof typeof OIDC_COOKIES];

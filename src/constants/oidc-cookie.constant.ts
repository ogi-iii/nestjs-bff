export const OIDC_COOKIES = {
  STATE: 'STATE',
  NONCE: 'NONCE',
  CODE_VERIFIER: 'CODE_VERIFIER',
} as const;

export type OidcCookies = (typeof OIDC_COOKIES)[keyof typeof OIDC_COOKIES];

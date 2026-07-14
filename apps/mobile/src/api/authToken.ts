/**
 * Decoupled token holder.
 *
 * The axios client needs the current tokens to attach/refresh them, but the
 * auth store imports the API endpoints (which import the client) — so a direct
 * `client → store` import would create a cycle. This module breaks it: the
 * store writes tokens here on login/logout/hydrate/refresh, the client reads
 * them and registers a refresh handler implemented by the store.
 */
let accessToken: string | null = null;
let refreshToken: string | null = null;

export function getAuthToken(): string | null {
  return accessToken;
}

export function getRefreshToken(): string | null {
  return refreshToken;
}

export function setTokens(access: string | null, refresh: string | null): void {
  accessToken = access;
  refreshToken = refresh;
}

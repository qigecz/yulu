import Constants from 'expo-constants';

/**
 * App runtime config, sourced from app.json `expo.extra`.
 * Switch `useMock` to false (and point `apiBaseUrl` at a running backend)
 * once PostgreSQL + PostGIS + the API are available.
 */
type Extra = {
  apiBaseUrl?: string;
  useMock?: boolean;
  mapboxAccessToken?: string;
};

const extra = (Constants.expoConfig?.extra ?? {}) as Extra;

// eslint-disable-next-line no-console
console.log('YULU_CONFIG', JSON.stringify({ hasExpoConfig: !!Constants.expoConfig, extra, USE_MOCK: (extra.useMock ?? true) }));

export const API_BASE_URL: string =
  extra.apiBaseUrl ?? 'http://localhost:3001/api';

// Mock data is the default data source so the app runs without a backend.
export const USE_MOCK: boolean = extra.useMock ?? true;

// Mapbox public access token. Set `expo.extra.mapboxAccessToken` in app.json
// to render real map tiles; without it the base map is blank (pins and route
// lines still render). Requires a development build (`expo prebuild`).
export const MAPBOX_TOKEN: string = extra.mapboxAccessToken ?? '';

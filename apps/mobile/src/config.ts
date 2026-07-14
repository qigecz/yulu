import Constants from 'expo-constants';

/**
 * App runtime config, sourced from app.json `expo.extra`.
 * Switch `useMock` to false (and point `apiBaseUrl` at a running backend)
 * once PostgreSQL + PostGIS + the API are available.
 */
type Extra = {
  apiBaseUrl?: string;
  useMock?: boolean;
};

const extra = (Constants.expoConfig?.extra ?? {}) as Extra;

export const API_BASE_URL: string =
  extra.apiBaseUrl ?? 'http://localhost:3001/api';

// Mock data is the default data source so the app runs without a backend.
export const USE_MOCK: boolean = extra.useMock ?? true;

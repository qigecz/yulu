import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi, type AuthResponse } from '../api/endpoints';
import { setTokens, getRefreshToken } from '../api/authToken';
import { USE_MOCK } from '../config';
import { mockUser } from '../mock/data';
import type { User } from '@yulu/shared';

const TOKEN_KEY = '@yulu/access_token';
const REFRESH_KEY = '@yulu/refresh_token';
const USER_KEY = '@yulu/user';

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  status: AuthStatus;
  login: (phone: string, password: string) => Promise<void>;
  register: (phone: string, password: string, nickname: string) => Promise<void>;
  logout: () => Promise<void>;
  /** Restore session from storage (or seed mock user in mock mode). */
  hydrate: () => Promise<void>;
}

async function persistSession(res: AuthResponse): Promise<User> {
  const me = await authApi.me().catch(() => null);
  const user: User =
    me ?? {
      // Fallback: auth response only carries {id, nickname}
      ...mockUserShape(res),
    };
  await AsyncStorage.multiSet([
    [TOKEN_KEY, res.accessToken],
    [REFRESH_KEY, res.refreshToken],
    [USER_KEY, JSON.stringify(user)],
  ]);
  setTokens(res.accessToken, res.refreshToken);
  return user;
}

/** Minimal User from an auth response when /me is unavailable. */
function mockUserShape(res: AuthResponse): User {
  return {
    id: res.user.id,
    nickname: res.user.nickname,
    spotsCount: 0,
    routesCount: 0,
    likesCount: 0,
    followersCount: 0,
    createdAt: '',
    updatedAt: '',
  };
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  status: 'loading',

  login: async (phone, password) => {
    const res = await authApi.login({ phone, password });
    const user = await persistSession(res);
    set({ user, accessToken: res.accessToken, refreshToken: res.refreshToken, status: 'authenticated' });
  },

  register: async (phone, password, nickname) => {
    const res = await authApi.register({ phone, password, nickname });
    const user = await persistSession(res);
    set({ user, accessToken: res.accessToken, refreshToken: res.refreshToken, status: 'authenticated' });
  },

  logout: async () => {
    await AsyncStorage.multiRemove([TOKEN_KEY, REFRESH_KEY, USER_KEY]);
    setTokens(null, null);
    set({ user: null, accessToken: null, refreshToken: null, status: 'unauthenticated' });
  },

  hydrate: async () => {
    // Mock mode: seed a mock user so the app is explorable without a backend.
    if (USE_MOCK) {
      const mockWithId: User = { ...mockUser };
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(mockWithId));
      setTokens('mock', 'mock');
      set({ user: mockWithId, accessToken: 'mock', refreshToken: 'mock', status: 'authenticated' });
      return;
    }

    const [token, refresh, userRaw] = await AsyncStorage.multiGet([TOKEN_KEY, REFRESH_KEY, USER_KEY]);
    const accessToken = token[1];
    const refreshToken = refresh[1];
    const userJson = userRaw[1];

    if (accessToken && userJson) {
      setTokens(accessToken, refreshToken);
      set({
        user: JSON.parse(userJson) as User,
        accessToken,
        refreshToken,
        status: 'authenticated',
      });
      return;
    }
    set({ status: 'unauthenticated' });
  },
}));

/**
 * Silent refresh: called by the API client when a 401 is received. Exchanges
 * the refresh token for a new access token, persists it, and returns it so the
 * client can retry the original request. Throws if there's no usable refresh
 * token or the refresh call fails — the client then forces logout.
 */
export async function refreshAccessToken(): Promise<string> {
  const refresh = getRefreshToken();
  if (!refresh || refresh === 'mock') {
    throw new Error('No refresh token');
  }
  const { accessToken } = await authApi.refresh(refresh);
  await AsyncStorage.setItem(TOKEN_KEY, accessToken);
  const currentRefresh = useAuthStore.getState().refreshToken ?? refresh;
  setTokens(accessToken, currentRefresh);
  useAuthStore.setState({ accessToken });
  return accessToken;
}

/** Called by the API client on unrecoverable 401: drop session and force re-auth. */
export function forceLogout(): void {
  void useAuthStore.getState().logout();
}

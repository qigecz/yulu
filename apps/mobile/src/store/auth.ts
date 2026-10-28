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
/** Mock 模式登出标记：置位后 hydrate 停在登录页（便于体验登录/注册流程）。 */
const MOCK_OUT_KEY = '@yulu/mock_logged_out';

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
  /** Replace the cached user (edit-profile save) and persist to storage. */
  setUser: (user: User) => Promise<void>;
  /** Safety net: if hydrate never resolves, leave the loading screen anyway. */
  forceBootBail: () => void;
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

/** Mock 模式登录：seed mock 用户（可覆盖昵称），清除登出标记。 */
async function mockLogin(overrides?: { nickname?: string }): Promise<void> {
  const user: User = { ...mockUser, ...(overrides?.nickname ? { nickname: overrides.nickname } : {}) };
  await AsyncStorage.multiSet([
    [USER_KEY, JSON.stringify(user)],
    [MOCK_OUT_KEY, '0'],
  ]).catch(() => {});
  setTokens('mock', 'mock');
  useAuthStore.setState({ user, accessToken: 'mock', refreshToken: 'mock', status: 'authenticated' });
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  status: 'loading',

  login: async (phone, password) => {
    // Mock 模式：不做网络请求，直接以 mock 用户进入（清除登出标记）。
    if (USE_MOCK) {
      await mockLogin();
      return;
    }
    const res = await authApi.login({ phone, password });
    const user = await persistSession(res);
    set({ user, accessToken: res.accessToken, refreshToken: res.refreshToken, status: 'authenticated' });
  },

  register: async (phone, password, nickname) => {
    // Mock 模式：注册即进入，昵称写进 mock 用户。
    if (USE_MOCK) {
      await mockLogin({ nickname });
      return;
    }
    const res = await authApi.register({ phone, password, nickname });
    const user = await persistSession(res);
    set({ user, accessToken: res.accessToken, refreshToken: res.refreshToken, status: 'authenticated' });
  },

  setUser: async (user) => {
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(user)).catch(() => {});
    set({ user });
  },

  logout: async () => {
    // Mock 模式：记录登出标记，下次启动停在登录页（可重新演示登录/注册）。
    if (USE_MOCK) {
      await AsyncStorage.setItem(MOCK_OUT_KEY, '1').catch(() => {});
    }
    await AsyncStorage.multiRemove([TOKEN_KEY, REFRESH_KEY, USER_KEY]);
    setTokens(null, null);
    set({ user: null, accessToken: null, refreshToken: null, status: 'unauthenticated' });
  },

  hydrate: async () => {
    try {
      // Mock mode: seed a mock user so the app is explorable without a backend.
      if (USE_MOCK) {
        // 用户主动登出过 → 停在登录页（登录/注册流程可在 mock 下完整体验）。
        const loggedOut = await AsyncStorage.getItem(MOCK_OUT_KEY).catch(() => null);
        if (loggedOut === '1') {
          set({ status: 'unauthenticated' });
          return;
        }
        const mockWithId: User = { ...mockUser };
        await AsyncStorage.setItem(USER_KEY, JSON.stringify(mockWithId)).catch(() => {});
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
    } catch (e) {
      // Storage failures (or anything else) must never strand the app on the
      // loading screen. In mock mode drop straight into the mock user; else go
      // to login so the UI is always reachable.
      if (USE_MOCK) {
        const mockWithId: User = { ...mockUser };
        setTokens('mock', 'mock');
        set({ user: mockWithId, accessToken: 'mock', refreshToken: 'mock', status: 'authenticated' });
      } else {
        set({ status: 'unauthenticated' });
      }
      // eslint-disable-next-line no-console
      console.warn('[auth] hydrate failed, using fallback:', e);
    }
  },

  forceBootBail: () => {
    // Only meaningful if still loading.
    if (useAuthStore.getState().status !== 'loading') return;
    if (USE_MOCK) {
      const mockWithId: User = { ...mockUser };
      setTokens('mock', 'mock');
      set({ user: mockWithId, accessToken: 'mock', refreshToken: 'mock', status: 'authenticated' });
    } else {
      set({ status: 'unauthenticated' });
    }
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

import { apiClient } from './client';
import { toSpot, toRoute, toFeed, toTutorial, toUser, toUserProfile, toComment } from './transforms';
import type { Spot, Route, Feed, Tutorial, User, UserProfile, Comment, Weather, CommentTargetType, SearchResults } from '@yulu/shared';

type Row = Record<string, any>;

/** Auth response shape from POST /auth/register and /auth/login. */
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: { id: string; nickname: string };
}

export const authApi = {
  register: async (input: { phone: string; password: string; nickname: string }) => {
    const { data } = await apiClient.post<AuthResponse>('/auth/register', input);
    return data;
  },
  login: async (input: { phone: string; password: string }) => {
    const { data } = await apiClient.post<AuthResponse>('/auth/login', input);
    return data;
  },
  me: async () => {
    const { data } = await apiClient.get<User>('/auth/me');
    // GET /me returns snake_case columns; normalize.
    return toUser(data as any);
  },
  refresh: async (refreshToken: string) => {
    const { data } = await apiClient.post<{ accessToken: string }>('/auth/refresh', { refreshToken });
    return data;
  },
};

export interface NearbySpotsParams {
  lat?: number;
  lng?: number;
  radius?: number;
  species?: string;
  method?: string;
}

export interface CreateSpotInput {
  name: string;
  description?: string;
  latitude: number;
  longitude: number;
  fishSpecies: string[];
  fishingMethod?: string;
  waterDepth?: string;
  bottomType?: string;
  tags: string[];
  images: string[];
}

export const spotsApi = {
  nearby: async (params: NearbySpotsParams = {}) => {
    const { data } = await apiClient.get<{ data: Row[] }>('/spots', { params });
    return data.data.map(toSpot);
  },
  detail: async (id: string) => {
    const { data } = await apiClient.get<Row>(`/spots/${id}`);
    return toSpot(data as any);
  },
  create: async (input: CreateSpotInput) => {
    const { data } = await apiClient.post<Row>('/spots', input);
    return toSpot(data as any);
  },
  like: async (id: string) => {
    const { data } = await apiClient.post<{ liked: boolean; likesCount: number }>(`/spots/${id}/like`);
    return data;
  },
};

export const routesApi = {
  list: async () => {
    const { data } = await apiClient.get<{ data: Row[] }>('/routes');
    return data.data.map(toRoute);
  },
  detail: async (id: string) => {
    const { data } = await apiClient.get<Row>(`/routes/${id}`);
    return toRoute(data as any);
  },
  download: async (id: string) => {
    await apiClient.post(`/routes/${id}/download`);
  },
};

export const tutorialsApi = {
  list: async (params: { type?: string; category?: string } = {}) => {
    const { data } = await apiClient.get<{ data: Row[] }>('/tutorials', { params });
    return data.data.map(toTutorial);
  },
};

export interface CreateFeedInput {
  content: string;
  location?: string;
  spotId?: string;
  images: string[];
}

export const feedsApi = {
  list: async (limit = 20) => {
    const { data } = await apiClient.get<{ data: Row[] }>('/feeds', { params: { limit } });
    return data.data.map(toFeed);
  },
  create: async (input: CreateFeedInput) => {
    const { data } = await apiClient.post<Row>('/feeds', input);
    return toFeed(data as any);
  },
  like: async (id: string) => {
    const { data } = await apiClient.post<{ liked: boolean; likesCount: number }>(`/feeds/${id}/like`);
    return data;
  },
};

export type FavoriteType = 'spot' | 'feed';

export const favoritesApi = {
  add: async (targetType: FavoriteType, targetId: string) => {
    await apiClient.post('/favorites', { targetType, targetId });
  },
  remove: async (targetType: FavoriteType, targetId: string) => {
    await apiClient.delete(`/favorites/${targetType}/${targetId}`);
  },
  listSpots: async () => {
    const { data } = await apiClient.get<{ data: Row[] }>('/favorites', { params: { type: 'spot' } });
    return data.data.map(toSpot);
  },
  listFeeds: async () => {
    const { data } = await apiClient.get<{ data: Row[] }>('/favorites', { params: { type: 'feed' } });
    return data.data.map(toFeed);
  },
};

export const weatherApi = {
  get: async (params: { lat?: number; lng?: number } = {}) => {
    const { data } = await apiClient.get<Weather>('/weather', { params });
    // Weather endpoint already returns camelCase.
    return data;
  },
};

export const uploadsApi = {
  /** Upload images (local file URIs) → returns public URLs. */
  upload: async (uris: string[]): Promise<string[]> => {
    const form = new FormData();
    for (const uri of uris) {
      const name = uri.split('/').pop() || 'photo.jpg';
      form.append('images', { uri, name, type: 'image/jpeg' } as any);
    }
    const { data } = await apiClient.post<{ urls: string[] }>('/uploads', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data.urls;
  },
};

export const usersApi = {
  get: async (id: string) => {
    const { data } = await apiClient.get<Row>(`/users/${id}`);
    return toUserProfile(data as any);
  },
  follow: async (id: string) => {
    await apiClient.post(`/users/${id}/follow`);
  },
  unfollow: async (id: string) => {
    await apiClient.delete(`/users/${id}/follow`);
  },
  feeds: async (id: string) => {
    const { data } = await apiClient.get<{ data: Row[] }>(`/users/${id}/feeds`);
    return data.data.map(toFeed);
  },
  /** Register the device's Expo push token so the server can send pushes. */
  registerPushToken: async (token: string, platform: 'ios' | 'android' | 'web') => {
    await apiClient.post('/users/push-token', { token, platform });
  },
};

export const commentsApi = {
  list: async (targetType: CommentTargetType, targetId: string) => {
    const { data } = await apiClient.get<{ data: Row[] }>('/comments', { params: { targetType, targetId } });
    return data.data.map(toComment);
  },
  create: async (input: { targetType: CommentTargetType; targetId: string; content: string }) => {
    const { data } = await apiClient.post<Row>('/comments', input);
    return toComment(data as any);
  },
};

// Re-export types for convenience
export type { Spot, Route, Feed, Tutorial, User };

export const searchApi = {
  /** Global grouped search across spots / routes / tutorials. */
  search: async (q: string): Promise<SearchResults> => {
    const { data } = await apiClient.get<{
      spots: Row[];
      routes: Row[];
      tutorials: Row[];
    }>('/search', { params: { q } });
    return {
      spots: data.spots.map(toSpot),
      routes: data.routes.map(toRoute),
      tutorials: data.tutorials.map(toTutorial),
    };
  },
};

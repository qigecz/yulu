import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { USE_MOCK } from '../config';
import {
  spotsApi,
  routesApi,
  tutorialsApi,
  feedsApi,
  weatherApi,
  favoritesApi,
  usersApi,
  commentsApi,
  type CreateSpotInput,
  type CreateFeedInput,
  type FavoriteType,
} from '../api/endpoints';
import {
  mockSpots,
  mockRoutes,
  mockTutorials,
  mockFeeds,
  mockWeather,
  mockUser,
} from '../mock/data';
import { useAuthStore } from '../store/auth';
import type { Spot, Route, Feed, Tutorial, Weather, User, UserProfile, Comment, CommentTargetType } from '@yulu/shared';

/**
 * Data hooks. Each queryFn branches on USE_MOCK:
 *  - true  → return mock data (app runs with no backend)
 *  - false → call the real API (transforms map snake_case → shared types)
 *
 * The returned values always conform to @yulu/shared types, so screens stay
 * identical regardless of the data source.
 */

const nearbySpotsKey = (lat?: number, lng?: number) => ['spots', 'nearby', lat, lng] as const;

export function useNearbySpots(lat?: number, lng?: number) {
  return useQuery<Spot[]>({
    queryKey: nearbySpotsKey(lat, lng),
    queryFn: async () =>
      USE_MOCK ? mockSpots : spotsApi.nearby({ lat, lng }),
    staleTime: 60_000,
  });
}

export function useRoutes() {
  return useQuery<Route[]>({
    queryKey: ['routes'],
    queryFn: async () => (USE_MOCK ? mockRoutes : routesApi.list()),
    staleTime: 60_000,
  });
}

export function useRouteDetail(id: string | null) {
  return useQuery<Route>({
    queryKey: ['routes', id],
    queryFn: async () =>
      USE_MOCK ? mockRoutes[0] : routesApi.detail(id as string),
    enabled: !!id,
  });
}

export function useTutorials() {
  return useQuery<Tutorial[]>({
    queryKey: ['tutorials'],
    queryFn: async () => (USE_MOCK ? mockTutorials : tutorialsApi.list()),
    staleTime: 60_000,
  });
}

export function useFeeds() {
  return useQuery<Feed[]>({
    queryKey: ['feeds'],
    queryFn: async () => (USE_MOCK ? mockFeeds : feedsApi.list()),
    staleTime: 30_000,
  });
}

export function useWeather(lat?: number, lng?: number) {
  return useQuery<Weather>({
    queryKey: ['weather', lat, lng],
    queryFn: async () =>
      USE_MOCK ? mockWeather : weatherApi.get({ lat, lng }),
    staleTime: 10 * 60_000,
  });
}

export function useMe(user: User | null) {
  // In mock mode the auth store already provides mockUser; otherwise we keep
  // whatever the store hydrated. This hook exists so screens can request the
  // current user uniformly and refresh profile data later.
  return useQuery<User>({
    queryKey: ['me'],
    queryFn: async () => user ?? mockUser,
    enabled: !!user,
    initialData: user ?? undefined,
  });
}

/**
 * Mutations (UGC). Each works in both modes:
 *  - Mock: synthesizes a locally-typed object, pushes it into the mock array
 *    and updates the React Query cache so the new item shows immediately.
 *  - Real: calls the backend, then invalidates the relevant list query.
 */
function makeId(prefix: string): string {
  return `${prefix}${Math.floor(Date.now() / 1000)}${Math.floor(Math.random() * 1000)}`;
}

export function useCreateSpot() {
  const qc = useQueryClient();
  const user = useAuthStore((s) => s.user);

  return useMutation<Spot, Error, CreateSpotInput>({
    mutationFn: async (input) => {
      if (USE_MOCK) {
        const now = new Date().toISOString();
        const spot: Spot = {
          id: makeId('s'),
          name: input.name,
          description: input.description,
          latitude: input.latitude,
          longitude: input.longitude,
          fishSpecies: input.fishSpecies,
          fishingMethod: input.fishingMethod,
          waterDepth: input.waterDepth,
          bottomType: input.bottomType,
          tags: input.tags,
          uploaderId: user?.id ?? 'u1',
          uploader: user ? { id: user.id, nickname: user.nickname, avatarUrl: user.avatarUrl } : undefined,
          images: input.images,
          likesCount: 0,
          downloadsCount: 0,
          distance: 0,
          createdAt: now,
          updatedAt: now,
        };
        mockSpots.unshift(spot);
        return spot;
      }
      return spotsApi.create(input);
    },
    onSuccess: (spot) => {
      if (USE_MOCK) {
        qc.setQueryData<Spot[]>(['spots', 'nearby', undefined, undefined], (old) =>
          old ? [spot, ...old] : [spot],
        );
      }
      qc.invalidateQueries({ queryKey: ['spots'] });
    },
  });
}

export function useCreateFeed() {
  const qc = useQueryClient();
  const user = useAuthStore((s) => s.user);

  return useMutation<Feed, Error, CreateFeedInput>({
    mutationFn: async (input) => {
      if (USE_MOCK) {
        const feed: Feed = {
          id: makeId('f'),
          userId: user?.id ?? 'u1',
          user: user ? { id: user.id, nickname: user.nickname, avatarUrl: user.avatarUrl } : { id: 'u1', nickname: '钓友' },
          content: input.content,
          location: input.location,
          images: input.images,
          spotId: input.spotId,
          likesCount: 0,
          createdAt: new Date().toISOString(),
        };
        mockFeeds.unshift(feed);
        return feed;
      }
      return feedsApi.create(input);
    },
    onSuccess: (feed) => {
      if (USE_MOCK) {
        qc.setQueryData<Feed[]>(['feeds'], (old) => (old ? [feed, ...old] : [feed]));
      }
      qc.invalidateQueries({ queryKey: ['feeds'] });
    },
  });
}

/* ------------------------------------------------------------------ */
/* Social: likes + favorites                                           */
/* ------------------------------------------------------------------ */

/** Helper: flip a feed in a cached feeds array (used by like/favorite). */
function patchFeedInCache(qc: ReturnType<typeof useQueryClient>, id: string, patch: Partial<Feed>) {
  qc.setQueryData<Feed[]>(['feeds'], (old) =>
    old ? old.map((f) => (f.id === id ? { ...f, ...patch } : f)) : old,
  );
  if (USE_MOCK) {
    const f = mockFeeds.find((x) => x.id === id);
    if (f) Object.assign(f, patch);
  }
}

function patchSpotInCache(qc: ReturnType<typeof useQueryClient>, id: string, patch: Partial<Spot>) {
  // Spots list cache key is ['spots','nearby',undefined,undefined]
  qc.setQueryData<Spot[]>(['spots', 'nearby', undefined, undefined], (old) =>
    old ? old.map((s) => (s.id === id ? { ...s, ...patch } : s)) : old,
  );
  if (USE_MOCK) {
    const s = mockSpots.find((x) => x.id === id);
    if (s) Object.assign(s, patch);
  }
}

export function useToggleFeedLike() {
  const qc = useQueryClient();
  return useMutation<{ liked: boolean; likesCount: number }, Error, { id: string; liked: boolean }>({
    mutationFn: async ({ id, liked }) => {
      if (USE_MOCK) {
        const f = mockFeeds.find((x) => x.id === id);
        const next = !liked;
        const likesCount = Math.max((f?.likesCount ?? 0) + (next ? 1 : -1), 0);
        return { liked: next, likesCount };
      }
      return feedsApi.like(id);
    },
    onMutate: async ({ id, liked }) => {
      const next = !liked;
      patchFeedInCache(qc, id, {
        liked: next,
        likesCount: Math.max((qc.getQueryData<Feed[]>(['feeds'])?.find((f) => f.id === id)?.likesCount ?? 0) + (next ? 1 : -1), 0),
      });
    },
    onSettled: () => {
      if (!USE_MOCK) qc.invalidateQueries({ queryKey: ['feeds'] });
    },
  });
}

export function useToggleSpotLike() {
  const qc = useQueryClient();
  return useMutation<{ liked: boolean; likesCount: number }, Error, { id: string; liked: boolean }>({
    mutationFn: async ({ id, liked }) => {
      if (USE_MOCK) {
        const s = mockSpots.find((x) => x.id === id);
        const next = !liked;
        const likesCount = Math.max((s?.likesCount ?? 0) + (next ? 1 : -1), 0);
        return { liked: next, likesCount };
      }
      return spotsApi.like(id);
    },
    onMutate: async ({ id, liked }) => {
      const next = !liked;
      const list = qc.getQueryData<Spot[]>(['spots', 'nearby', undefined, undefined]);
      const cur = list?.find((s) => s.id === id)?.likesCount ?? 0;
      patchSpotInCache(qc, id, {
        liked: next,
        likesCount: Math.max(cur + (next ? 1 : -1), 0),
      });
    },
    onSettled: () => {
      if (!USE_MOCK) qc.invalidateQueries({ queryKey: ['spots'] });
    },
  });
}

export function useToggleFavorite() {
  const qc = useQueryClient();
  return useMutation<void, Error, { type: FavoriteType; id: string; favorited: boolean }>({
    mutationFn: async ({ type, id, favorited }) => {
      if (USE_MOCK) return;
      if (favorited) await favoritesApi.remove(type, id);
      else await favoritesApi.add(type, id);
    },
    onMutate: ({ type, id, favorited }) => {
      const next = !favorited;
      if (type === 'feed') patchFeedInCache(qc, id, { favorited: next });
      else patchSpotInCache(qc, id, { favorited: next });
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['favorites'] });
    },
  });
}

export function useFavoriteSpots() {
  return useQuery<Spot[]>({
    queryKey: ['favorites', 'spot'],
    queryFn: async () => (USE_MOCK ? mockSpots.slice(0, 1) : favoritesApi.listSpots()),
    enabled: !USE_MOCK,
    staleTime: 30_000,
  });
}

export function useFavoriteFeeds() {
  return useQuery<Feed[]>({
    queryKey: ['favorites', 'feed'],
    queryFn: async () => (USE_MOCK ? mockFeeds.slice(0, 1) : favoritesApi.listFeeds()),
    enabled: !USE_MOCK,
    staleTime: 30_000,
  });
}

/* ------------------------------------------------------------------ */
/* Social round 2: follows + comments                                  */
/* ------------------------------------------------------------------ */

export function useUser(id: string | null) {
  return useQuery<UserProfile>({
    queryKey: ['user', id],
    queryFn: async () => {
      // Mock mode: synthesize a profile from mock users (no backend).
      if (USE_MOCK) {
        return { ...mockUser, id: id ?? mockUser.id, isFollowing: false };
      }
      return usersApi.get(id as string);
    },
    enabled: !!id,
  });
}

export function useUserFeeds(id: string | null) {
  return useQuery<Feed[]>({
    queryKey: ['user', id, 'feeds'],
    queryFn: async () => (USE_MOCK ? mockFeeds.filter((f) => f.userId === id) : usersApi.feeds(id as string)),
    enabled: !!id,
  });
}

export function useToggleFollow() {
  const qc = useQueryClient();
  return useMutation<{ following: boolean }, Error, { id: string; following: boolean }>({
    mutationFn: async ({ id, following }) => {
      if (USE_MOCK) return { following: !following };
      if (following) await usersApi.unfollow(id);
      else await usersApi.follow(id);
      return { following: !following };
    },
    onMutate: ({ id, following }) => {
      const next = !following;
      qc.setQueryData<UserProfile>(['user', id], (old) =>
        old
          ? {
              ...old,
              isFollowing: next,
              followersCount: Math.max(old.followersCount + (next ? 1 : -1), 0),
            }
          : old,
      );
    },
    onSettled: () => {
      if (!USE_MOCK) qc.invalidateQueries({ queryKey: ['user'] });
    },
  });
}

export function useFeedComments(feedId: string | null) {
  return useQuery<Comment[]>({
    queryKey: ['comments', 'feed', feedId],
    queryFn: async () => (USE_MOCK ? [] : commentsApi.list('feed', feedId as string)),
    enabled: !!feedId,
  });
}

export function useAddComment() {
  const qc = useQueryClient();
  const user = useAuthStore((s) => s.user);
  return useMutation<Comment, Error, { targetType: CommentTargetType; targetId: string; content: string }>({
    mutationFn: async (input) => {
      const comment: Comment = {
        id: makeId('c'),
        userId: user?.id ?? 'u1',
        user: user ? { id: user.id, nickname: user.nickname, avatarUrl: user.avatarUrl } : { id: 'u1', nickname: '钓友' },
        targetType: input.targetType,
        targetId: input.targetId,
        content: input.content,
        createdAt: new Date().toISOString(),
      };
      if (USE_MOCK) return comment;
      return commentsApi.create(input);
    },
    onSuccess: (comment) => {
      qc.setQueryData<Comment[]>(['comments', comment.targetType, comment.targetId], (old) =>
        old ? [...old, comment] : [comment],
      );
    },
  });
}

import type { Spot, Route, Feed, Tutorial, User, UserProfile, Comment, RouteSpot } from '@yulu/shared';

/**
 * The API returns raw PostgreSQL rows in snake_case with flattened relation
 * columns (e.g. `uploader_name`). These mappers convert rows into the camelCase
 * shapes declared in @yulu/shared so the rest of the app can keep consuming
 * the shared types unchanged.
 *
 * Input is intentionally `any` (raw DB rows); output is strongly typed.
 */
type Row = Record<string, any>;

const num = (v: any, fallback = 0): number =>
  typeof v === 'number' ? v : typeof v === 'string' && v !== '' ? Number(v) : fallback;

export function toSpot(row: Row): Spot {
  return {
    id: String(row.id),
    name: row.name,
    description: row.description ?? undefined,
    // Spots list endpoint currently exposes no lat/lng (PostGIS geometry only);
    // default to 0 — display screens don't need coordinates yet.
    latitude: num(row.latitude),
    longitude: num(row.longitude),
    fishSpecies: row.fish_species ?? [],
    fishingMethod: row.fishing_method ?? undefined,
    waterDepth: row.water_depth ?? undefined,
    bottomType: row.bottom_type ?? undefined,
    tags: row.tags ?? [],
    uploaderId: String(row.uploader_id ?? row.uploaderId ?? ''),
    uploader: row.uploader_name
      ? { id: String(row.uploader_id), nickname: row.uploader_name, avatarUrl: row.uploader_avatar }
      : undefined,
    images: row.images ?? [],
    likesCount: num(row.likes_count),
    downloadsCount: num(row.downloads_count),
    distance: row.distance != null ? num(row.distance) : undefined,
    liked: row.liked === true,
    favorited: row.favorited === true,
    createdAt: row.created_at ?? '',
    updatedAt: row.updated_at ?? '',
  };
}

export function toRoute(row: Row): Route {
  const spots: RouteSpot[] = Array.isArray(row.spots)
    ? row.spots.map((rs: Row) => ({
        spot: toSpot(rs),
        sortOrder: num(rs.sort_order ?? rs.sortOrder),
        distance: num(rs.distance),
      }))
    : [];
  return {
    id: String(row.id),
    name: row.name,
    description: row.description ?? undefined,
    totalDistance: row.total_distance != null ? num(row.total_distance) : undefined,
    bestSeason: row.best_season ?? undefined,
    tags: row.tags ?? [],
    uploaderId: String(row.uploader_id ?? row.uploaderId ?? ''),
    uploader: row.uploader_name
      ? { id: String(row.uploader_id), nickname: row.uploader_name, avatarUrl: row.uploader_avatar }
      : undefined,
    downloadsCount: num(row.downloads_count),
    likesCount: num(row.likes_count),
    featured: Boolean(row.featured),
    spots,
    createdAt: row.created_at ?? '',
    updatedAt: row.updated_at ?? '',
  };
}

export function toFeed(row: Row): Feed {
  return {
    id: String(row.id),
    userId: String(row.user_id ?? row.userId ?? ''),
    user: row.user_name
      ? { id: String(row.user_id), nickname: row.user_name, avatarUrl: row.user_avatar }
      : undefined,
    content: row.content,
    location: row.location ?? undefined,
    images: row.images ?? [],
    spotId: row.spot_id ? String(row.spot_id) : undefined,
    likesCount: num(row.likes_count),
    liked: row.liked === true,
    favorited: row.favorited === true,
    createdAt: row.created_at ?? '',
  };
}

export function toTutorial(row: Row): Tutorial {
  return {
    id: String(row.id),
    type: row.type,
    title: row.title,
    content: row.content ?? undefined,
    coverUrl: row.cover_url ?? undefined,
    videoUrl: row.video_url ?? undefined,
    duration: row.duration ?? undefined,
    readTime: row.read_time ?? undefined,
    category: row.category ?? undefined,
    tags: row.tags ?? [],
    authorId: String(row.author_id ?? row.authorId ?? ''),
    author: row.author_name
      ? { id: String(row.author_id), nickname: row.author_name, avatarUrl: row.author_avatar }
      : undefined,
    viewsCount: num(row.views_count),
    likesCount: num(row.likes_count),
    featured: Boolean(row.featured),
    publishedAt: row.published_at ?? undefined,
    createdAt: row.created_at ?? '',
    updatedAt: row.updated_at ?? '',
  };
}

export function toUser(row: Row): User {
  return {
    id: String(row.id),
    phone: row.phone,
    email: row.email,
    nickname: row.nickname,
    avatarUrl: row.avatar_url ?? undefined,
    bio: row.bio ?? undefined,
    spotsCount: num(row.spots_count),
    routesCount: num(row.routes_count),
    likesCount: num(row.likes_count),
    followersCount: num(row.followers_count),
    followingCount: row.following_count != null ? num(row.following_count) : undefined,
    createdAt: row.created_at ?? '',
    updatedAt: row.updated_at ?? '',
  };
}

/** Profile (GET /users/:id) adds the personalized isFollowing flag. */
export function toUserProfile(row: Row): UserProfile {
  return { ...toUser(row), isFollowing: row.is_following === true };
}

export function toComment(row: Row): Comment {
  return {
    id: String(row.id),
    userId: String(row.user_id ?? row.userId),
    user: row.user_name
      ? { id: String(row.user_id ?? row.userId), nickname: row.user_name, avatarUrl: row.user_avatar }
      : row.user,
    targetType: row.target_type,
    targetId: String(row.target_id ?? row.targetId),
    content: row.content,
    createdAt: row.created_at ?? '',
  };
}

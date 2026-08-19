export interface Spot {
  id: string;
  name: string;
  description?: string;
  latitude: number;
  longitude: number;
  fishSpecies: string[];
  fishingMethod?: string;
  waterDepth?: string;
  bottomType?: string;
  tags: string[];
  uploaderId: string;
  uploader?: { id: string; nickname: string; avatarUrl?: string };
  images: string[];
  likesCount: number;
  downloadsCount: number;
  distance?: number;
  /** Whether the current user liked this spot. */
  liked?: boolean;
  /** Whether the current user favorited this spot. */
  favorited?: boolean;
  createdAt: string;
  updatedAt: string;
  /* ── detail-page fields (spot-detail screen) ── */
  /** Region label like "杭州 · 淳安". */
  region?: string;
  /** Aggregate rating 0–5. */
  rating?: number;
  ratingCount?: number;
  /** Anglers fishing here today (community-reported). */
  anglersToday?: number;
  /** Main target species, shown in the stats row (defaults to fishSpecies[0]). */
  mainSpecies?: string;
  /** Current water temperature in °C. */
  waterTemp?: number;
  /** Catch rate over the last 7 days, 0–100 (%). */
  catchRate7d?: number;
  /** Info key-values rendered in the 详情 tab. */
  info?: { label: string; value: string }[];
  /** Hourly catch distribution for the best-time bar chart (6 buckets). */
  catchByHour?: number[];
  /** Featured route summary for the download card. */
  featuredRoute?: { id: string; name: string; spotsCount: number; totalDistance: number; downloads: number; uploader: string };
  /** In-bay pit list for the 坑点 tab. */
  pits?: { name: string; desc: string }[];
}

export interface SpotFilter {
  latitude: number;
  longitude: number;
  radius?: number;
  species?: string;
  method?: string;
  tags?: string[];
}

/** User review of a spot (评价 tab). */
export interface SpotReview {
  id: string;
  spotId: string;
  user: { id: string; nickname: string };
  rating: number;
  text: string;
  tags?: string[];
  createdAt: string;
}

import { Spot } from './spot';

export interface Route {
  id: string;
  name: string;
  description?: string;
  totalDistance?: number;
  bestSeason?: string;
  tags: string[];
  uploaderId: string;
  uploader?: { id: string; nickname: string; avatarUrl?: string };
  downloadsCount: number;
  likesCount: number;
  featured: boolean;
  spots: RouteSpot[];
  createdAt: string;
  updatedAt: string;
  /* ── detail-page fields (route-detail screen) ── */
  /** Region label like "北京 · 密云水库". */
  region?: string;
  /** Short tags row on the title card (e.g. 环线 / 岸钓+船钓 / 中等难度). */
  routeTags?: { label: string; plain?: boolean }[];
  /** Start/end + path description under the title. */
  startEnd?: string;
  /** Estimated duration in hours. */
  durationHours?: number;
  /** Cumulative elevation gain in meters. */
  elevationGain?: number;
  /** Rating 0–5 and count. */
  rating?: number;
  ratingCount?: number;
  /** Author card extras. */
  authorBadge?: string;
  authorShares?: number;
  authorDownloads?: number;
  /** Info key-values for the 概览 tab. */
  info?: { label: string; value: string }[];
  /** Elevation profile samples (meters), rendered left→right. */
  elevation?: number[];
  /** Max elevation point note. */
  elevationNote?: string;
  /** Supply & safety key-values. */
  supplyInfo?: { label: string; value: string }[];
  /** Warning note in the 概览 tab. */
  warning?: string;
  /** Ordered sequence for the 坑点序列 tab. */
  sequence?: { title: string; tag?: string; desc: string; dist: string; kind?: 'start' | 'end' | 'mid' }[];
  /** Offline package size in MB (download bar). */
  offlineMb?: number;
}

export interface RouteSpot {
  spot: Spot;
  sortOrder: number;
  distance: number;
}

export interface RouteFilter {
  latitude?: number;
  longitude?: number;
  tags?: string[];
  featured?: boolean;
}

/** User review of a route (评价 tab). */
export interface RouteReview {
  id: string;
  routeId: string;
  user: { id: string; nickname: string };
  rating: number;
  text: string;
  tags?: string[];
  createdAt: string;
}

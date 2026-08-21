export interface Feed {
  id: string;
  userId: string;
  user?: { id: string; nickname: string; avatarUrl?: string };
  content: string;
  location?: string;
  images: string[];
  spotId?: string;
  spot?: { id: string; name: string };
  likesCount: number;
  /** Whether the current user liked this feed (personalized). */
  liked?: boolean;
  /** Whether the current user favorited this feed. */
  favorited?: boolean;
  createdAt: string;
  /* ── detail-page fields (post-detail screen) ── */
  /** Precise location line under the body text. */
  locationDetail?: string;
  /** Author extras for the author row. */
  authorBadge?: string;
  authorFollowers?: number;
  /** Photo captions for the 3-up grid when images are placeholders. */
  photoLabels?: string[];
  /** Catch stats strip. */
  catchStats?: { fish?: string; maxLenCm?: number; hours?: number };
  /** Linked route card. */
  linkedRoute?: { id: string; name: string; spotsCount: number; totalDistance: number };
  /** Comment/share counts for the action row. */
  commentsCount?: number;
  sharesCount?: number;
}

/** Flat comment with an optional author reply (楼中楼). */
export interface PostComment {
  id: string;
  feedId: string;
  user: { id: string; nickname: string };
  content: string;
  likesCount: number;
  createdAt: string;
  /** Author's inline reply rendered nested under the comment. */
  reply?: { content: string };
}

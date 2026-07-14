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
}

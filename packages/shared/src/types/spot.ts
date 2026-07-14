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
  /** Whether the current user liked this spot (personalized). */
  liked?: boolean;
  /** Whether the current user favorited this spot. */
  favorited?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SpotFilter {
  latitude: number;
  longitude: number;
  radius?: number;
  species?: string;
  method?: string;
  tags?: string[];
}

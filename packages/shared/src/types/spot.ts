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

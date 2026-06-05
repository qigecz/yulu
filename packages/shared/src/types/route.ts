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

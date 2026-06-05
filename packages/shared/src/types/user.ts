export interface User {
  id: string;
  phone?: string;
  email?: string;
  nickname: string;
  avatarUrl?: string;
  bio?: string;
  spotsCount: number;
  routesCount: number;
  likesCount: number;
  followersCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile extends User {
  isFollowing?: boolean;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthUser {
  id: string;
  nickname: string;
  avatarUrl?: string;
}

export interface User {
  id: string;
  phone?: string;
  email?: string;
  nickname: string;
  avatarUrl?: string;
  bio?: string;
  /** 常驻地（如「浙江 · 千岛湖」），编辑资料维护。 */
  location?: string;
  /** 钓龄档位：lt1 / 1to3 / 3to5 / gt5。 */
  fishingExperience?: 'lt1' | '1to3' | '3to5' | 'gt5';
  /** 常用钓法（路亚 / 台钓 / 筏钓…，多选）。 */
  fishingMethods?: string[];
  /** 主打鱼种（多选）。 */
  targetSpecies?: string[];
  spotsCount: number;
  routesCount: number;
  likesCount: number;
  followersCount: number;
  /** Derived count of users this user follows (profile endpoint). */
  followingCount?: number;
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

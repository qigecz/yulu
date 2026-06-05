export type TutorialType = 'video' | 'article';
export type TutorialCategory = '路亚' | '台钓' | '传统钓' | '坑点技巧';

export interface Tutorial {
  id: string;
  type: TutorialType;
  title: string;
  content?: string;
  coverUrl?: string;
  videoUrl?: string;
  duration?: string;
  readTime?: string;
  category?: TutorialCategory;
  tags: string[];
  authorId: string;
  author?: { id: string; nickname: string; avatarUrl?: string };
  viewsCount: number;
  likesCount: number;
  featured: boolean;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TutorialFilter {
  type?: TutorialType;
  category?: TutorialCategory;
}

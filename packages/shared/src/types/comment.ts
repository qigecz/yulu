export type CommentTargetType = 'feed' | 'spot';

export interface Comment {
  id: string;
  userId: string;
  user?: { id: string; nickname: string; avatarUrl?: string };
  targetType: CommentTargetType;
  targetId: string;
  content: string;
  createdAt: string;
}

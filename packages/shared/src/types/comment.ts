export type CommentTargetType = 'feed' | 'spot';

export interface Comment {
  id: string;
  userId: string;
  user?: { id: string; nickname: string; avatarUrl?: string };
  targetType: CommentTargetType;
  targetId: string;
  content: string;
  createdAt: string;
  /** 被回复的评论 id（顶层为 null/缺省），前端按它组装楼层。 */
  parentId?: string | null;
}

import { Router, Response } from 'express';
import { z } from 'zod';
import { query } from '../config/database';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { notifyUser, getUserNickname } from '../services/notifications';

const router = Router();

const createCommentSchema = z.object({
  targetType: z.enum(['feed', 'spot']),
  targetId: z.string().uuid(),
  content: z.string().min(1).max(1000),
  /** 回复的目标评论 id（顶层评论不传）。 */
  parentId: z.string().uuid().optional(),
});

/** List comments for a target, newest last (chronological). parent_id 用于前端组装楼层。 */
router.get('/', async (req, res: Response) => {
  const targetType = req.query.targetType as string;
  const targetId = req.query.targetId as string;
  if (targetType !== 'feed' && targetType !== 'spot') {
    return res.status(400).json({ error: 'targetType 仅支持 feed/spot' });
  }
  const result = await query(
    `SELECT c.id, c.content, c.created_at, c.parent_id, u.id as user_id, u.nickname as user_name, u.avatar_url as user_avatar
     FROM comments c JOIN users u ON c.user_id = u.id
     WHERE c.target_type = $1 AND c.target_id = $2
     ORDER BY c.created_at ASC LIMIT 100`,
    [targetType, targetId],
  );
  res.json({ data: result.rows });
});

router.post('/', authMiddleware, validate(createCommentSchema), async (req: AuthRequest, res: Response) => {
  const { targetType, targetId, content, parentId } = req.body;
  // 回复的目标评论必须存在且属于同一目标。
  if (parentId) {
    const parent = await query(
      `SELECT id FROM comments WHERE id = $1 AND target_type = $2 AND target_id = $3`,
      [parentId, targetType, targetId],
    );
    if (parent.rows.length === 0) {
      return res.status(400).json({ error: '被回复的评论不存在' });
    }
  }
  const result = await query(
    `INSERT INTO comments (user_id, target_type, target_id, content, parent_id) VALUES ($1, $2, $3, $4, $5)
     RETURNING id, content, created_at, parent_id`,
    [req.userId, targetType, targetId, content, parentId ?? null],
  );
  const row = result.rows[0];
  // 通知目标主人（回复时通知父评论作者），跳过自己。
  void (async () => {
    let notifyUserId: string | undefined;
    if (parentId) {
      const parentQ = await query(`SELECT user_id FROM comments WHERE id = $1`, [parentId]);
      notifyUserId = parentQ.rows[0]?.user_id;
    } else {
      const ownerQ =
        targetType === 'feed'
          ? await query('SELECT user_id FROM feeds WHERE id = $1', [targetId])
          : await query('SELECT uploader_id FROM spots WHERE id = $1', [targetId]);
      notifyUserId = ownerQ.rows[0]?.user_id ?? ownerQ.rows[0]?.uploader_id;
    }
    if (!notifyUserId || notifyUserId === req.userId) return;
    const actor = await getUserNickname(req.userId!);
    void notifyUser(notifyUserId, req.userId, {
      type: 'comment',
      title: parentId ? `${actor} 回复了你` : `${actor} 评论了你`,
      body: content.length > 40 ? `${content.slice(0, 40)}…` : content,
      data: { type: targetType, targetId },
    });
  })();
  res.status(201).json({
    ...row,
    user: { id: req.userId },
  });
});

export default router;

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
});

/** List comments for a target, newest last (chronological). */
router.get('/', async (req, res: Response) => {
  const targetType = req.query.targetType as string;
  const targetId = req.query.targetId as string;
  if (targetType !== 'feed' && targetType !== 'spot') {
    return res.status(400).json({ error: 'targetType 仅支持 feed/spot' });
  }
  const result = await query(
    `SELECT c.id, c.content, c.created_at, u.id as user_id, u.nickname as user_name, u.avatar_url as user_avatar
     FROM comments c JOIN users u ON c.user_id = u.id
     WHERE c.target_type = $1 AND c.target_id = $2
     ORDER BY c.created_at ASC LIMIT 100`,
    [targetType, targetId],
  );
  res.json({ data: result.rows });
});

router.post('/', authMiddleware, validate(createCommentSchema), async (req: AuthRequest, res: Response) => {
  const { targetType, targetId, content } = req.body;
  const result = await query(
    `INSERT INTO comments (user_id, target_type, target_id, content) VALUES ($1, $2, $3, $4)
     RETURNING id, content, created_at`,
    [req.userId, targetType, targetId, content],
  );
  const row = result.rows[0];
  // Notify the target owner of the comment (skips if owner is the actor).
  void (async () => {
    const ownerQ =
      targetType === 'feed'
        ? await query('SELECT user_id FROM feeds WHERE id = $1', [targetId])
        : await query('SELECT uploader_id FROM spots WHERE id = $1', [targetId]);
    const ownerId = ownerQ.rows[0]?.user_id ?? ownerQ.rows[0]?.uploader_id;
    if (!ownerId) return;
    const actor = await getUserNickname(req.userId!);
    void notifyUser(ownerId, req.userId, {
      type: 'comment',
      title: `${actor} 评论了你`,
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

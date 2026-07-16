import { Router, Response } from 'express';
import { query } from '../config/database';
import { authMiddleware, optionalAuth, AuthRequest } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createFeedSchema } from '@yulu/shared/validators/feed';
import { notifyUser, getUserNickname } from '../services/notifications';

const router = Router();

router.get('/', optionalAuth, async (req: AuthRequest, res: Response) => {
  const limit = parseInt(req.query.limit as string) || 20;
  const userId = req.userId ?? null;
  const result = await query(
    `SELECT f.*, u.nickname as user_name, u.avatar_url as user_avatar,
       (fl.user_id IS NOT NULL) AS liked,
       (fav.user_id IS NOT NULL) AS favorited
     FROM feeds f
     JOIN users u ON f.user_id = u.id
     LEFT JOIN feed_likes fl ON fl.feed_id = f.id AND fl.user_id = $2
     LEFT JOIN favorites fav ON fav.target_id = f.id AND fav.target_type = 'feed' AND fav.user_id = $2
     ORDER BY f.created_at DESC LIMIT $1`,
    [limit, userId]
  );
  res.json({ data: result.rows });
});

router.post('/', authMiddleware, validate(createFeedSchema), async (req: AuthRequest, res: Response) => {
  const { content, location, spotId, images } = req.body;
  const result = await query(
    `INSERT INTO feeds (user_id, content, location, spot_id, images) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [req.userId, content, location, spotId, images ?? []]
  );
  res.status(201).json(result.rows[0]);
});

/** Toggle like on a feed. Returns the new state. */
router.post('/:id/like', authMiddleware, async (req: AuthRequest, res: Response) => {
  const existing = await query('SELECT 1 FROM feed_likes WHERE user_id = $1 AND feed_id = $2', [req.userId, req.params.id]);
  let liked: boolean;
  if (existing.rows.length > 0) {
    await query('DELETE FROM feed_likes WHERE user_id = $1 AND feed_id = $2', [req.userId, req.params.id]);
    await query('UPDATE feeds SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = $1', [req.params.id]);
    liked = false;
  } else {
    await query('INSERT INTO feed_likes (user_id, feed_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [req.userId, req.params.id]);
    await query('UPDATE feeds SET likes_count = likes_count + 1 WHERE id = $1', [req.params.id]);
    liked = true;
  }
  const count = await query('SELECT likes_count FROM feeds WHERE id = $1', [req.params.id]);
  if (liked) {
    // Notify the feed owner (skips if owner is the actor). Fire-and-forget.
    void (async () => {
      const owner = await query('SELECT user_id FROM feeds WHERE id = $1', [req.params.id]);
      const ownerId = owner.rows[0]?.user_id;
      if (!ownerId) return;
      const actor = await getUserNickname(req.userId!);
      void notifyUser(ownerId, req.userId, {
        type: 'like-feed',
        title: '有人赞了你的动态',
        body: `${actor} 赞了你的动态`,
        data: { type: 'feed', targetId: req.params.id },
      });
    })();
  }
  res.json({ liked, likesCount: count.rows[0]?.likes_count ?? 0 });
});

export default router;

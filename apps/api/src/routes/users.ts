import { Router, Response } from 'express';
import { query } from '../config/database';
import { authMiddleware, optionalAuth, AuthRequest } from '../middleware/auth';

const router = Router();

/** User profile with personalized follow state and following count. */
router.get('/:id', optionalAuth, async (req: AuthRequest, res: Response) => {
  const result = await query(
    `SELECT u.id, u.nickname, u.avatar_url, u.bio,
       u.spots_count, u.routes_count, u.likes_count, u.followers_count,
       (SELECT COUNT(*) FROM follows WHERE follower_id = u.id) AS following_count,
       (f.follower_id IS NOT NULL) AS is_following
     FROM users u
     LEFT JOIN follows f ON f.following_id = u.id AND f.follower_id = $2
     WHERE u.id = $1`,
    [req.params.id, req.userId ?? null],
  );
  if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
  res.json(result.rows[0]);
});

/** Follow a user. */
router.post('/:id/follow', authMiddleware, async (req: AuthRequest, res: Response) => {
  if (req.userId === req.params.id) return res.status(400).json({ error: '不能关注自己' });
  const inserted = await query(
    `INSERT INTO follows (follower_id, following_id) VALUES ($1, $2) ON CONFLICT DO NOTHING RETURNING 1`,
    [req.userId, req.params.id],
  );
  if (inserted.rows.length > 0) {
    await query('UPDATE users SET followers_count = followers_count + 1 WHERE id = $1', [req.params.id]);
    // following_count is derived (COUNT over follows), no column to maintain.
  }
  res.json({ following: true });
});

/** Unfollow a user. */
router.delete('/:id/follow', authMiddleware, async (req: AuthRequest, res: Response) => {
  const deleted = await query(
    `DELETE FROM follows WHERE follower_id = $1 AND following_id = $2 RETURNING 1`,
    [req.userId, req.params.id],
  );
  if (deleted.rows.length > 0) {
    await query('UPDATE users SET followers_count = GREATEST(followers_count - 1, 0) WHERE id = $1', [req.params.id]);
    // following_count is derived (COUNT over follows), no column to maintain.
  }
  res.json({ following: false });
});

/** A user's posted feeds. */
router.get('/:id/feeds', async (req: AuthRequest, res: Response) => {
  const result = await query(
    `SELECT f.*, u.nickname as user_name, u.avatar_url as user_avatar
     FROM feeds f JOIN users u ON f.user_id = u.id
     WHERE f.user_id = $1 ORDER BY f.created_at DESC LIMIT 30`,
    [req.params.id],
  );
  res.json({ data: result.rows });
});

export default router;

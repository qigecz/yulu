import { Router, Response } from 'express';
import { query } from '../config/database';
import { authMiddleware, optionalAuth, AuthRequest } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { pushTokenSchema, updateProfileSchema } from '@yulu/shared';
import { notifyUser, getUserNickname } from '../services/notifications';

const router = Router();

/** Register (or refresh) the caller's Expo push token. Idempotent. */
router.post('/push-token', authMiddleware, validate(pushTokenSchema), async (req: AuthRequest, res: Response) => {
  const { token, platform } = req.body;
  await query(
    `INSERT INTO push_tokens (user_id, token, platform) VALUES ($1, $2, $3)
     ON CONFLICT (user_id, token) DO NOTHING`,
    [req.userId, token, platform],
  );
  res.status(201).json({ ok: true });
});

/** Update my profile (edit-profile screen). Only provided columns change. */
router.patch('/me', authMiddleware, validate(updateProfileSchema), async (req: AuthRequest, res: Response) => {
  const { nickname, bio, avatarUrl, location, fishingExperience, fishingMethods, targetSpecies } = req.body;
  const result = await query(
    `UPDATE users SET
       nickname = COALESCE($1, nickname),
       bio = COALESCE($2, bio),
       avatar_url = COALESCE($3, avatar_url),
       location = COALESCE($4, location),
       fishing_experience = COALESCE($5, fishing_experience),
       fishing_methods = COALESCE($6, fishing_methods),
       target_species = COALESCE($7, target_species),
       updated_at = NOW()
     WHERE id = $8
     RETURNING id, phone, email, nickname, avatar_url, bio, location,
       fishing_experience, fishing_methods, target_species,
       spots_count, routes_count, likes_count, followers_count,
       created_at, updated_at`,
    [nickname ?? null, bio ?? null, avatarUrl ?? null, location ?? null,
     fishingExperience ?? null, fishingMethods ?? null, targetSpecies ?? null, req.userId],
  );
  if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
  res.json(result.rows[0]);
});

/** User profile with personalized follow state and following count. */
/**
 * Delete my account (设置 → 账号注销). Most FKs lack ON DELETE CASCADE, so
 * dependent rows are removed explicitly, in child→parent order.
 */
router.delete('/me', authMiddleware, async (req: AuthRequest, res: Response) => {
  const uid = req.userId;
  await query(`DELETE FROM comments WHERE user_id = $1 OR (target_type = 'feed' AND target_id IN (SELECT id FROM feeds WHERE user_id = $1))`, [uid]);
  await query(`DELETE FROM favorites WHERE user_id = $1 OR (target_type = 'spot' AND target_id IN (SELECT id FROM spots WHERE uploader_id = $1))`, [uid]);
  await query(`DELETE FROM spot_likes WHERE user_id = $1 OR spot_id IN (SELECT id FROM spots WHERE uploader_id = $1)`, [uid]);
  await query(`DELETE FROM route_downloads WHERE user_id = $1`, [uid]);
  await query(`DELETE FROM route_spots WHERE route_id IN (SELECT id FROM routes WHERE uploader_id = $1)`, [uid]);
  await query(`DELETE FROM push_tokens WHERE user_id = $1`, [uid]);
  await query(`DELETE FROM route_spots WHERE spot_id IN (SELECT id FROM spots WHERE uploader_id = $1)`, [uid]);
  await query(`DELETE FROM feeds WHERE user_id = $1`, [uid]);
  await query(`DELETE FROM tutorials WHERE author_id = $1`, [uid]);
  await query(`DELETE FROM routes WHERE uploader_id = $1`, [uid]);
  await query(`DELETE FROM spots WHERE uploader_id = $1`, [uid]);
  await query(`DELETE FROM follows WHERE follower_id = $1 OR following_id = $1`, [uid]);
  await query(`DELETE FROM users WHERE id = $1`, [uid]);
  res.json({ ok: true });
});

router.get('/:id', optionalAuth, async (req: AuthRequest, res: Response) => {
  const result = await query(
    `SELECT u.id, u.nickname, u.avatar_url, u.bio, u.location,
       u.fishing_experience, u.fishing_methods, u.target_species,
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
    // Notify the newly-followed user (skips self). Fire-and-forget.
    void (async () => {
      const actor = await getUserNickname(req.userId!);
      void notifyUser(req.params.id, req.userId, {
        type: 'follow',
        title: '你有了新的关注者',
        body: `${actor} 关注了你`,
        data: { type: 'user', targetId: req.userId! },
      });
    })();
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

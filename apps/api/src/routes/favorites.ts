import { Router, Response } from 'express';
import { query } from '../config/database';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

type TargetType = 'spot' | 'feed' | 'route';
function isValidType(t: any): t is TargetType {
  return t === 'spot' || t === 'feed' || t === 'route';
}

/** Add to favorites. Body: { targetType, targetId } */
router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { targetType, targetId } = req.body;
  if (!isValidType(targetType) || !targetId) {
    return res.status(400).json({ error: 'targetType/targetId 无效' });
  }
  await query(
    `INSERT INTO favorites (user_id, target_type, target_id) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING`,
    [req.userId, targetType, targetId],
  );
  res.status(201).json({ favorited: true });
});

/** Remove from favorites. */
router.delete('/:targetType/:targetId', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { targetType, targetId } = req.params;
  if (!isValidType(targetType)) {
    return res.status(400).json({ error: 'targetType 无效' });
  }
  await query(
    `DELETE FROM favorites WHERE user_id = $1 AND target_type = $2 AND target_id = $3`,
    [req.userId, targetType, targetId],
  );
  res.json({ favorited: false });
});

/**
 * List the current user's favorites. Optional ?type= filters by target type.
 * Returns the underlying rows (spots or feeds) so the client can render them
 * uniformly; each row is tagged favorited=true.
 */
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  const type = req.query.type as string | undefined;

  if (!type || type === 'spot') {
    const spots = await query(
      `SELECT s.*, u.nickname as uploader_name, u.avatar_url as uploader_avatar, true AS favorited
       FROM favorites f JOIN spots s ON s.id = f.target_id
       LEFT JOIN users u ON u.id = s.uploader_id
       WHERE f.user_id = $1 AND f.target_type = 'spot'
       ORDER BY f.created_at DESC`,
      [req.userId],
    );
    if (!type) return res.json({ type: 'spot', data: spots.rows });
    return res.json({ data: spots.rows });
  }

  if (type === 'feed') {
    const feeds = await query(
      `SELECT f.*, u.nickname as user_name, u.avatar_url as user_avatar, true AS favorited
       FROM favorites f JOIN feeds ON feeds.id = f.target_id
       LEFT JOIN users u ON u.id = feeds.user_id
       WHERE f.user_id = $1 AND f.target_type = 'feed'
       ORDER BY f.created_at DESC`,
      [req.userId],
    );
    return res.json({ data: feeds.rows });
  }

  res.status(400).json({ error: 'type 仅支持 spot/feed' });
});

export default router;

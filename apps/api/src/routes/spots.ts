import { Router, Response } from 'express';
import { query } from '../config/database';
import { authMiddleware, optionalAuth, AuthRequest } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createSpotSchema } from '@yulu/shared/validators/spot';
import { notifyUser, getUserNickname } from '../services/notifications';

const router = Router();

// Public list, personalized when a token is present (liked/favorited flags).
router.get('/', optionalAuth, async (req: AuthRequest, res: Response) => {
  const lat = parseFloat(req.query.lat as string) || 30;
  const lng = parseFloat(req.query.lng as string) || 120;
  const radius = parseInt(req.query.radius as string) || 50000;
  const species = req.query.species as string;
  const method = req.query.method as string;
  const userId = req.userId ?? null;

  let sql = `
    SELECT s.id, s.name, s.fish_species, s.fishing_method, s.water_depth, s.bottom_type, s.tags,
      s.uploader_id, s.images, s.likes_count, s.downloads_count, s.created_at,
      ST_Y(s.location) AS latitude, ST_X(s.location) AS longitude,
      (sl.user_id IS NOT NULL) AS liked,
      (fav.user_id IS NOT NULL) AS favorited,
      ST_Distance(s.location, ST_SetSRID(ST_MakePoint($2, $1), 4326)::geography) AS distance
    FROM spots s
    LEFT JOIN spot_likes sl ON sl.spot_id = s.id AND sl.user_id = $4
    LEFT JOIN favorites fav ON fav.target_id = s.id AND fav.target_type = 'spot' AND fav.user_id = $4
    WHERE ST_DWithin(s.location, ST_SetSRID(ST_MakePoint($2, $1), 4326)::geography, $3)
  `;
  const params: any[] = [lat, lng, radius, userId];
  let paramIdx = 5;

  if (species) {
    sql += ` AND $${paramIdx} = ANY(s.fish_species)`;
    params.push(species);
    paramIdx++;
  }
  if (method) {
    sql += ` AND s.fishing_method = $${paramIdx}`;
    params.push(method);
    paramIdx++;
  }

  sql += ` ORDER BY distance ASC LIMIT 50`;
  const result = await query(sql, params);
  res.json({ data: result.rows });
});

router.get('/:id', optionalAuth, async (req: AuthRequest, res: Response) => {
  const result = await query(
    `SELECT s.id, s.name, s.description, s.fish_species, s.fishing_method, s.water_depth, s.bottom_type, s.tags,
       s.uploader_id, s.images, s.likes_count, s.downloads_count, s.created_at, s.updated_at,
       ST_Y(s.location) AS latitude, ST_X(s.location) AS longitude,
       u.nickname as uploader_name, u.avatar_url as uploader_avatar,
       (sl.user_id IS NOT NULL) AS liked,
       (fav.user_id IS NOT NULL) AS favorited
     FROM spots s
     JOIN users u ON s.uploader_id = u.id
     LEFT JOIN spot_likes sl ON sl.spot_id = s.id AND sl.user_id = $2
     LEFT JOIN favorites fav ON fav.target_id = s.id AND fav.target_type = 'spot' AND fav.user_id = $2
     WHERE s.id = $1`,
    [req.params.id, req.userId ?? null]
  );
  if (result.rows.length === 0) return res.status(404).json({ error: 'Spot not found' });
  res.json(result.rows[0]);
});

router.post('/', authMiddleware, validate(createSpotSchema), async (req: AuthRequest, res: Response) => {
  const { name, description, latitude, longitude, fishSpecies, fishingMethod, waterDepth, bottomType, tags, images } = req.body;
  const result = await query(
    `INSERT INTO spots (name, description, location, fish_species, fishing_method, water_depth, bottom_type, tags, uploader_id, images)
     VALUES ($1, $2, ST_SetSRID(ST_MakePoint($4, $3), 4326), $5, $6, $7, $8, $9, $10, $11)
     RETURNING *`,
    [name, description, latitude, longitude, fishSpecies, fishingMethod, waterDepth, bottomType, tags, req.userId, images ?? []]
  );
  await query('UPDATE users SET spots_count = spots_count + 1 WHERE id = $1', [req.userId]);
  res.status(201).json(result.rows[0]);
});

/** Toggle like on a spot. Returns the new state. */
router.post('/:id/like', authMiddleware, async (req: AuthRequest, res: Response) => {
  const existing = await query('SELECT 1 FROM spot_likes WHERE user_id = $1 AND spot_id = $2', [req.userId, req.params.id]);
  let liked: boolean;
  if (existing.rows.length > 0) {
    await query('DELETE FROM spot_likes WHERE user_id = $1 AND spot_id = $2', [req.userId, req.params.id]);
    await query('UPDATE spots SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = $1', [req.params.id]);
    liked = false;
  } else {
    await query('INSERT INTO spot_likes (user_id, spot_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [req.userId, req.params.id]);
    await query('UPDATE spots SET likes_count = likes_count + 1 WHERE id = $1', [req.params.id]);
    liked = true;
  }
  const count = await query('SELECT likes_count FROM spots WHERE id = $1', [req.params.id]);
  if (liked) {
    // Notify the spot uploader (skips if uploader is the actor). Fire-and-forget.
    void (async () => {
      const owner = await query('SELECT uploader_id, name FROM spots WHERE id = $1', [req.params.id]);
      const ownerId = owner.rows[0]?.uploader_id;
      const spotName = owner.rows[0]?.name;
      if (!ownerId) return;
      const actor = await getUserNickname(req.userId!);
      void notifyUser(ownerId, req.userId, {
        type: 'like-spot',
        title: '有人赞了你的钓点',
        body: `${actor} 赞了你的钓点${spotName ? `「${spotName}」` : ''}`,
        data: { type: 'spot', targetId: req.params.id },
      });
    })();
  }
  res.json({ liked, likesCount: count.rows[0]?.likes_count ?? 0 });
});

export default router;

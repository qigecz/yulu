import { Router, Response } from 'express';
import { query } from '../config/database';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/', async (req: AuthRequest, res: Response) => {
  const result = await query(
    `SELECT r.*, u.nickname as uploader_name, u.avatar_url as uploader_avatar
     FROM routes r JOIN users u ON r.uploader_id = u.id
     ORDER BY r.featured DESC, r.created_at DESC LIMIT 30`
  );
  res.json({ data: result.rows });
});

router.get('/:id', async (req: AuthRequest, res: Response) => {
  const routeRes = await query(
    `SELECT r.*, u.nickname as uploader_name, u.avatar_url as uploader_avatar
     FROM routes r JOIN users u ON r.uploader_id = u.id WHERE r.id = $1`,
    [req.params.id]
  );
  if (routeRes.rows.length === 0) return res.status(404).json({ error: 'Route not found' });

  const spotsRes = await query(
    `SELECT s.id, s.name, s.description, s.fish_species, s.fishing_method, s.water_depth, s.bottom_type, s.tags,
       s.uploader_id, s.images, s.likes_count, s.downloads_count, s.created_at, s.updated_at,
       ST_Y(s.location) AS latitude, ST_X(s.location) AS longitude,
       rs.sort_order
     FROM route_spots rs JOIN spots s ON rs.spot_id = s.id
     WHERE rs.route_id = $1 ORDER BY rs.sort_order`,
    [req.params.id]
  );

  res.json({ ...routeRes.rows[0], spots: spotsRes.rows });
});

/** Create a route (发布面板「分享路线」). Body: { name, description?, tags? } */
router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { name, description, tags } = req.body as {
    name?: string; description?: string; tags?: string[];
  };
  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    return res.status(400).json({ error: '路线名称至少 2 个字' });
  }
  const result = await query(
    `INSERT INTO routes (name, description, tags, uploader_id)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [name.trim(), description?.trim() || null, tags?.length ? tags : '{}', req.userId]
  );
  res.status(201).json(result.rows[0]);
});

router.post('/:id/download', authMiddleware, async (req: AuthRequest, res: Response) => {
  await query(
    `INSERT INTO route_downloads (user_id, route_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
    [req.userId, req.params.id]
  );
  await query('UPDATE routes SET downloads_count = downloads_count + 1 WHERE id = $1', [req.params.id]);
  res.json({ ok: true });
});

export default router;

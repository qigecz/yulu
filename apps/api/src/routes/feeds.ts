import { Router, Response } from 'express';
import { query } from '../config/database';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/', async (req, res: Response) => {
  const limit = parseInt(req.query.limit as string) || 20;
  const result = await query(
    `SELECT f.*, u.nickname as user_name, u.avatar_url as user_avatar
     FROM feeds f JOIN users u ON f.user_id = u.id
     ORDER BY f.created_at DESC LIMIT $1`,
    [limit]
  );
  res.json({ data: result.rows });
});

router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { content, location, spotId } = req.body;
  const result = await query(
    `INSERT INTO feeds (user_id, content, location, spot_id) VALUES ($1, $2, $3, $4) RETURNING *`,
    [req.userId, content, location, spotId]
  );
  res.status(201).json(result.rows[0]);
});

export default router;

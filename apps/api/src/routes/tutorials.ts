import { Router, Response } from 'express';
import { query } from '../config/database';

const router = Router();

router.get('/', async (req, res: Response) => {
  const type = req.query.type as string;
  const category = req.query.category as string;
  let sql = `SELECT t.*, u.nickname as author_name, u.avatar_url as author_avatar
    FROM tutorials t JOIN users u ON t.author_id = u.id WHERE t.published_at IS NOT NULL`;
  const params: any[] = [];
  if (type) { params.push(type); sql += ` AND t.type = $${params.length}`; }
  if (category) { params.push(category); sql += ` AND t.category = $${params.length}`; }
  sql += ` ORDER BY t.featured DESC, t.published_at DESC LIMIT 30`;
  const result = await query(sql, params);
  res.json({ data: result.rows });
});

router.get('/:id', async (req, res: Response) => {
  const result = await query(
    `SELECT t.*, u.nickname as author_name FROM tutorials t JOIN users u ON t.author_id = u.id WHERE t.id = $1`,
    [req.params.id]
  );
  if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
  res.json(result.rows[0]);
});

export default router;

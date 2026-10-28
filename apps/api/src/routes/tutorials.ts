import { Router, Response } from 'express';
import { query } from '../config/database';
import { authMiddleware, AuthRequest } from '../middleware/auth';

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

/** Create a tutorial (发布面板「技巧分享」，type=article 直接发布). Body: { title, content, category? } */
router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { title, content, category } = req.body as {
    title?: string; content?: string; category?: string;
  };
  if (!title || typeof title !== 'string' || title.trim().length < 2) {
    return res.status(400).json({ error: '标题至少 2 个字' });
  }
  if (!content || typeof content !== 'string' || content.trim().length < 10) {
    return res.status(400).json({ error: '正文至少 10 个字' });
  }
  const readTime = `${Math.max(1, Math.ceil(content.trim().length / 400))} 分钟`;
  const result = await query(
    `INSERT INTO tutorials (type, title, content, category, author_id, read_time, published_at)
     VALUES ('article', $1, $2, $3, $4, $5, NOW())
     RETURNING *`,
    [title.trim(), content.trim(), category ?? '路亚', req.userId, readTime]
  );
  res.status(201).json(result.rows[0]);
});

export default router;

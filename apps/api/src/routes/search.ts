import { Router, Response } from 'express';
import { query } from '../config/database';

const router = Router();

/**
 * Unified global search across spots / routes / tutorials.
 * Matches name + tags (+ description/title/category) via case-insensitive ILIKE.
 * Each bucket is capped; the client renders them grouped.
 *
 * Raw rows are returned in snake_case; the mobile client's transforms map them
 * into the shared camelCase types (mirrors how the list endpoints work).
 */
router.get('/', async (req, res: Response) => {
  const q = ((req.query.q as string) || '').trim();
  if (q.length < 1) {
    return res.json({ spots: [], routes: [], tutorials: [] });
  }
  const like = `%${q}%`;

  const [spots, routes, tutorials] = await Promise.all([
    query(
      `SELECT s.id, s.name, s.fish_species, s.fishing_method, s.water_depth, s.bottom_type, s.tags,
         s.uploader_id, s.images, s.likes_count, s.downloads_count, s.created_at,
         u.nickname as uploader_name, u.avatar_url as uploader_avatar
       FROM spots s LEFT JOIN users u ON s.uploader_id = u.id
       WHERE s.name ILIKE $1 OR $1 = ANY(s.tags) OR EXISTS (SELECT 1 FROM unnest(s.fish_species) fp WHERE fp ILIKE $1)
       ORDER BY s.likes_count DESC LIMIT 10`,
      [like]
    ),
    query(
      `SELECT r.*, u.nickname as uploader_name, u.avatar_url as uploader_avatar
       FROM routes r LEFT JOIN users u ON r.uploader_id = u.id
       WHERE r.name ILIKE $1 OR r.description ILIKE $1 OR $1 = ANY(r.tags)
       ORDER BY r.downloads_count DESC LIMIT 10`,
      [like]
    ),
    query(
      `SELECT t.*, u.nickname as author_name, u.avatar_url as author_avatar
       FROM tutorials t LEFT JOIN users u ON t.author_id = u.id
       WHERE t.title ILIKE $1 OR t.category ILIKE $1 OR $1 = ANY(t.tags)
       ORDER BY t.views_count DESC LIMIT 10`,
      [like]
    ),
  ]);

  res.json({ spots: spots.rows, routes: routes.rows, tutorials: tutorials.rows });
});

export default router;

import { Router, Response } from 'express';
import { query } from '../config/database';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createSpotSchema } from '@yulu/shared/validators/spot';

const router = Router();

router.get('/', async (req: AuthRequest, res: Response) => {
  const lat = parseFloat(req.query.lat as string) || 30;
  const lng = parseFloat(req.query.lng as string) || 120;
  const radius = parseInt(req.query.radius as string) || 50000;
  const species = req.query.species as string;
  const method = req.query.method as string;

  let sql = `
    SELECT id, name, fish_species, fishing_method, water_depth, bottom_type, tags,
      uploader_id, images, likes_count, downloads_count, created_at,
      ST_Distance(location, ST_SetSRID(ST_MakePoint($2, $1), 4326)::geography) AS distance
    FROM spots WHERE ST_DWithin(location, ST_SetSRID(ST_MakePoint($2, $1), 4326)::geography, $3)
  `;
  const params: any[] = [lat, lng, radius];
  let paramIdx = 4;

  if (species) {
    sql += ` AND $${paramIdx} = ANY(fish_species)`;
    params.push(species);
    paramIdx++;
  }
  if (method) {
    sql += ` AND fishing_method = $${paramIdx}`;
    params.push(method);
    paramIdx++;
  }

  sql += ` ORDER BY distance ASC LIMIT 50`;
  const result = await query(sql, params);
  res.json({ data: result.rows });
});

router.get('/:id', async (req: AuthRequest, res: Response) => {
  const result = await query(
    `SELECT s.*, u.nickname as uploader_name, u.avatar_url as uploader_avatar
     FROM spots s JOIN users u ON s.uploader_id = u.id WHERE s.id = $1`,
    [req.params.id]
  );
  if (result.rows.length === 0) return res.status(404).json({ error: 'Spot not found' });
  res.json(result.rows[0]);
});

router.post('/', authMiddleware, validate(createSpotSchema), async (req: AuthRequest, res: Response) => {
  const { name, description, latitude, longitude, fishSpecies, fishingMethod, waterDepth, bottomType, tags } = req.body;
  const result = await query(
    `INSERT INTO spots (name, description, location, fish_species, fishing_method, water_depth, bottom_type, tags, uploader_id)
     VALUES ($1, $2, ST_SetSRID(ST_MakePoint($4, $3), 4326), $5, $6, $7, $8, $9, $10)
     RETURNING *`,
    [name, description, latitude, longitude, fishSpecies, fishingMethod, waterDepth, bottomType, tags, req.userId]
  );
  await query('UPDATE users SET spots_count = spots_count + 1 WHERE id = $1', [req.userId]);
  res.status(201).json(result.rows[0]);
});

export default router;

import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../config/database';
import { env } from '../config/env';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { registerSchema, loginSchema } from '@yulu/shared/validators/auth';

const router = Router();

router.post('/register', validate(registerSchema), async (req: Request, res: Response) => {
  const { phone, password, nickname } = req.body;
  const existing = await query('SELECT id FROM users WHERE phone = $1', [phone]);
  if (existing.rows.length > 0) {
    return res.status(409).json({ error: 'Phone already registered' });
  }
  const hash = await bcrypt.hash(password, 12);
  const result = await query(
    'INSERT INTO users (phone, password_hash, nickname) VALUES ($1, $2, $3) RETURNING id, nickname',
    [phone, hash, nickname]
  );
  const user = result.rows[0];
  const accessToken = jwt.sign({ userId: user.id }, env.JWT_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign({ userId: user.id }, env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
  res.status(201).json({ accessToken, refreshToken, user: { id: user.id, nickname: user.nickname } });
});

router.post('/login', validate(loginSchema), async (req: Request, res: Response) => {
  const { phone, password } = req.body;
  const result = await query('SELECT id, nickname, password_hash FROM users WHERE phone = $1', [phone]);
  if (result.rows.length === 0) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const user = result.rows[0];
  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const accessToken = jwt.sign({ userId: user.id }, env.JWT_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign({ userId: user.id }, env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
  res.json({ accessToken, refreshToken, user: { id: user.id, nickname: user.nickname } });
});

router.get('/me', authMiddleware, async (req: AuthRequest, res: Response) => {
  const result = await query(
    'SELECT id, nickname, avatar_url, bio, spots_count, routes_count, likes_count, followers_count FROM users WHERE id = $1',
    [req.userId]
  );
  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.json(result.rows[0]);
});

export default router;

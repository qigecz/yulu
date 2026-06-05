import { Router, Response } from 'express';

const router = Router();

router.get('/', async (req, res: Response) => {
  const lat = parseFloat(req.query.lat as string) || 30;
  const lng = parseFloat(req.query.lng as string) || 120;

  // Mock weather for MVP — replace with real API integration later
  res.json({
    temperature: 26,
    condition: '晴',
    windDirection: '东南风',
    windLevel: 2,
    pressure: 1013,
    fishingAdvice: '宜出钓',
  });
});

export default router;

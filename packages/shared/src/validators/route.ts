import { z } from 'zod';

export const createRouteSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().optional(),
  totalDistance: z.number().optional(),
  bestSeason: z.string().optional(),
  tags: z.array(z.string()).default([]),
  spotIds: z.array(z.object({ spotId: z.string(), sortOrder: z.number() })).min(1),
});

export type CreateRouteInput = z.infer<typeof createRouteSchema>;

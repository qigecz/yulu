import { z } from 'zod';

export const createFeedSchema = z.object({
  content: z.string().min(1).max(2000),
  location: z.string().max(200).optional(),
  spotId: z.string().optional(),
  images: z.array(z.string().url().or(z.string().startsWith('/'))).default([]),
});

export type CreateFeedInput = z.infer<typeof createFeedSchema>;

import { z } from 'zod';

export const createSpotSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().optional(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  fishSpecies: z.array(z.string()).default([]),
  fishingMethod: z.string().optional(),
  waterDepth: z.string().optional(),
  bottomType: z.string().optional(),
  tags: z.array(z.string()).default([]),
  images: z.array(z.string().url().or(z.string().startsWith('/'))).default([]),
});

export const spotFilterSchema = z.object({
  lat: z.coerce.number(),
  lng: z.coerce.number(),
  radius: z.coerce.number().default(50000),
  species: z.string().optional(),
  method: z.string().optional(),
});

export type CreateSpotInput = z.infer<typeof createSpotSchema>;

import { z } from 'zod';

/** 钓龄档位（编辑资料分段选择）。 */
export const FISHING_EXPERIENCES = ['lt1', '1to3', '3to5', 'gt5'] as const;

/** PATCH /users/me body — 全部字段可选，只更新传入的列。 */
export const updateProfileSchema = z.object({
  nickname: z.string().trim().min(2, '昵称至少 2 个字').max(12, '昵称最多 12 个字').optional(),
  bio: z.string().max(50, '签名最多 50 字').optional(),
  avatarUrl: z.string().max(500).optional(),
  location: z.string().max(50).optional(),
  fishingExperience: z.enum(FISHING_EXPERIENCES).optional(),
  fishingMethods: z.array(z.string().max(20)).max(6).optional(),
  targetSpecies: z.array(z.string().max(20)).max(6).optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

import { z } from 'zod';

export const registerSchema = z.object({
  phone: z.string().min(11).max(11),
  password: z.string().min(6).max(50),
  nickname: z.string().min(2).max(50),
});

export const loginSchema = z.object({
  phone: z.string().min(11).max(11),
  password: z.string().min(6),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

import { z } from 'zod';

/** Body for POST /users/push-token — registers a device for Expo push. */
export const pushTokenSchema = z.object({
  token: z.string().min(10),
  platform: z.enum(['ios', 'android', 'web']),
});

export type PushTokenInput = z.infer<typeof pushTokenSchema>;

/** Notification types carried in the push `data` payload for deep-link routing. */
export const NOTIFICATION_TYPES = ['like-spot', 'like-feed', 'comment', 'follow'] as const;
export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

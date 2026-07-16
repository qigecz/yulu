import { query } from '../config/database';
import { env } from '../config/env';
import type { NotificationType } from '@yulu/shared';

interface NotifyPayload {
  type: NotificationType;
  title: string;
  body: string;
  /** Deep-link target, e.g. { type:'feed', targetId:'...' } → yulu://feed/<id>. */
  data?: Record<string, string>;
}

const EXPO_PUSH_URL = 'https://exp.host/api/v2/push/send';

/**
 * Send a push notification to a user. Best-effort: never throws — push failures
 * must not break the originating request. Skips when the recipient is the actor,
 * has no registered tokens, or when EXPO_ACCESS_TOKEN is unset (warns once).
 *
 * Fire with `void notifyUser(...)` so it does not block the response.
 */
export async function notifyUser(
  recipientId: string,
  actorId: string | undefined,
  payload: NotifyPayload,
): Promise<void> {
  if (!recipientId || recipientId === actorId) return;
  if (!env.EXPO_ACCESS_TOKEN) {
    console.warn('[notifications] EXPO_ACCESS_TOKEN not set — skipping push');
    return;
  }

  try {
    const tokens = await query('SELECT token FROM push_tokens WHERE user_id = $1', [recipientId]);
    if (tokens.rows.length === 0) return;

    const messages = tokens.rows.map((row: { token: string }) => ({
      to: row.token,
      title: payload.title,
      body: payload.body,
      data: payload.data ?? {},
      sound: 'default',
    }));

    const resp = await fetch(EXPO_PUSH_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${env.EXPO_ACCESS_TOKEN}`,
      },
      body: JSON.stringify(messages),
    });

    if (!resp.ok) {
      const text = await resp.text();
      console.error(`[notifications] Expo push HTTP ${resp.status}: ${text}`);
      return;
    }
    const json = (await resp.json()) as { errors?: unknown[] };
    if (json.errors?.length) {
      console.error('[notifications] Expo push returned errors:', JSON.stringify(json.errors));
    }
  } catch (err) {
    console.error('[notifications] push failed:', err);
  }
}

/** Look up a user's nickname for push copy. Returns '钓友' if not found. */
export async function getUserNickname(userId: string): Promise<string> {
  try {
    const r = await query('SELECT nickname FROM users WHERE id = $1', [userId]);
    return (r.rows[0]?.nickname as string) ?? '钓友';
  } catch {
    return '钓友';
  }
}

import { useUIStore } from '../store/ui';

/**
 * Parse a `yulu://<type>/<id>` (or https variant) deep link and dispatch it to
 * the UI store — switch tab / open the matching overlay. Shared by the Linking
 * URL listener and the push-notification tap handler.
 *
 * Returns true if the URL was recognized and dispatched.
 */
export function dispatchDeepLink(url: string | null | undefined): boolean {
  if (!url) return false;
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return false;
  }

  // Accept yulu://feed/<id> and https://yulu.../<type>/<id>
  const segments = parsed.pathname.split('/').filter(Boolean);
  const type = parsed.hostname || segments[0];
  const id = segments[segments.length - 1];

  const store = useUIStore.getState();
  switch (type) {
    case 'nav':
    case 'route':
      if (id) {
        store.openNavigation(id);
        return true;
      }
      store.setActiveTab('nav');
      return true;
    case 'feed':
      if (id) {
        store.openFeedDetail(id);
        return true;
      }
      break;
    case 'user':
      if (id) {
        store.openUser(id);
        return true;
      }
      break;
    case 'spot':
      store.setActiveTab('spots');
      return true;
    case 'home':
      store.setActiveTab('home');
      return true;
    default:
      break;
  }
  return false;
}

/** Build a yulu:// deep link from a push `data` payload ({type,targetId}). */
export function buildDeepLink(data?: Record<string, string> | null): string | null {
  if (!data?.type || !data?.targetId) return null;
  // Push payload uses target types: feed/spot/user/route/nav.
  const t = data.type === 'user' ? 'user' : data.type === 'feed' ? 'feed' : 'route';
  return `yulu://${t}/${data.targetId}`;
}

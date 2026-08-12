import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import { usersApi } from '../api/endpoints';
import { dispatchDeepLink, buildDeepLink } from '../utils/deeplink';

/**
 * Register the device for Expo push notifications when authenticated, and
 * route taps on incoming notifications to the deep-link dispatcher. No-op and
 * safe when unauthenticated. Errors are swallowed so they never break login.
 *
 * NOTE: `expo-notifications` is imported DYNAMICICALLY inside the hook. A
 * static top-level `import` triggers `requireNativeModule('ExpoNotificationsHandlerModule')`
 * at bundle-load time, which — when the native module isn't ready — throws
 * before AppRegistry.registerComponent runs and crashes the app on cold start
 * with a generic "AppRegistry not registered (n=0)" error. Deferring the
 * import to first effect keeps that native access safely after boot.
 */
export function usePushNotifications(authenticated: boolean): void {
  const registered = useRef(false);

  useEffect(() => {
    if (!authenticated) {
      registered.current = false;
      return;
    }

    let mounted = true;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let Notifications: any = null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let cleanup: (() => void) | null = null;

    (async () => {
      try {
        // Dynamic import — keeps expo-notifications' native-module access out
        // of the bundle's top-level evaluation.
        Notifications = await import('expo-notifications');

        if (!mounted) return;

        // Foreground notifications: show an in-app banner rather than dropping.
        Notifications.setNotificationHandler({
          handleNotification: async () => ({
            shouldShowAlert: true,
            shouldPlaySound: true,
            shouldSetBadge: false,
          }),
        });

        const perm = await Notifications.requestPermissionsAsync();
        if (!mounted || perm.status !== 'granted') return;

        if (Platform.OS === 'android') {
          await Notifications.setNotificationChannelAsync('default', {
            name: '渔路通知',
            importance: Notifications.AndroidImportance.DEFAULT,
          });
        }

        const { data: token } = await Notifications.getExpoPushTokenAsync();
        if (!mounted || !token || registered.current) return;
        registered.current = true;
        await usersApi.registerPushToken(token, Platform.OS as 'ios' | 'android');
      } catch {
        // Best-effort — push is non-critical.
      }
    })();

    // Tap on a notification (background or cold start) → deep link.
    (async () => {
      try {
        const N = Notifications ?? (await import('expo-notifications'));
        const sub = N.addNotificationResponseReceivedListener((response: any) => {
          const data = response.notification.request.content.data as
            | Record<string, string>
            | undefined;
          dispatchDeepLink(buildDeepLink(data));
        });
        cleanup = () => N.removeNotificationSubscription(sub);
      } catch {
        // Best-effort.
      }
    })();

    return () => {
      mounted = false;
      if (cleanup) cleanup();
    };
  }, [authenticated]);
}

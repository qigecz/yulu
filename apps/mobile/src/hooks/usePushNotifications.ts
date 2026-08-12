import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { usersApi } from '../api/endpoints';
import { dispatchDeepLink, buildDeepLink } from '../utils/deeplink';

// Foreground notifications: show an in-app banner rather than silently dropping.
// Configured inside the hook (not at module top level) so a failure to access
// the expo-notifications native module during JS bundle load can't abort JS
// initialization before AppRegistry.registerComponent runs.
function configureForegroundNotifications() {
  try {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
  } catch {
    // Native module not ready — push is best-effort, never block app boot.
  }
}

/**
 * Register the device for Expo push notifications when authenticated, and
 * route taps on incoming notifications to the deep-link dispatcher. No-op and
 * safe when unauthenticated. Errors are swallowed so they never break login.
 */
export function usePushNotifications(authenticated: boolean): void {
  const registered = useRef(false);

  useEffect(() => {
    configureForegroundNotifications();

    if (!authenticated) {
      registered.current = false;
      return;
    }

    let mounted = true;

    (async () => {
      try {
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
    const sub = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data as
        | Record<string, string>
        | undefined;
      dispatchDeepLink(buildDeepLink(data));
    });

    return () => {
      mounted = false;
      Notifications.removeNotificationSubscription(sub);
    };
  }, [authenticated]);
}

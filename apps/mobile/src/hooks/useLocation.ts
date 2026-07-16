import { useEffect, useRef, useState } from 'react';
import * as Location from 'expo-location';

export interface UserCoords {
  latitude: number;
  longitude: number;
}

export interface LocationState {
  /** Live coordinates, or null while unavailable. */
  coords: UserCoords | null;
  /** Whether the user granted foreground location permission. */
  granted: boolean;
}

/**
 * Request foreground location permission and watch the user's position.
 * Cleans up the subscription on unmount. Returns coords=null until the first
 * fix lands (or if permission is denied).
 */
export function useLocation(enabled = true): LocationState {
  const [coords, setCoords] = useState<UserCoords | null>(null);
  const [granted, setGranted] = useState(false);
  const subRef = useRef<Location.LocationSubscription | null>(null);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;

    (async () => {
      try {
        const perm = await Location.requestForegroundPermissionsAsync();
        if (cancelled) return;
        if (perm.status !== 'granted') {
          setGranted(false);
          return;
        }
        setGranted(true);
        subRef.current = await Location.watchPositionAsync(
          { accuracy: Location.Accuracy.High, distanceInterval: 5, timeInterval: 3000 },
          (loc) => {
            const { latitude, longitude } = loc.coords;
            if (typeof latitude === 'number' && typeof longitude === 'number') {
              setCoords({ latitude, longitude });
            }
          },
        );
      } catch {
        setGranted(false);
      }
    })();

    return () => {
      cancelled = true;
      const sub = subRef.current;
      subRef.current = null;
      if (sub) void sub.remove();
    };
  }, [enabled]);

  return { coords, granted };
}

import { haversineDistance } from '@yulu/shared';
import type { Route } from '@yulu/shared';

/** An ordered, map-ready waypoint derived from a Route's ordered spots. */
export interface Waypoint {
  id: string;
  name: string;
  sortOrder: number;
  latitude: number;
  longitude: number;
  /** Meters from the previous waypoint (0 for the first). */
  legDistance: number;
  /** Meters from the start of the route up to this waypoint. */
  cumulative: number;
}

/**
 * Flatten a route's spots into an ordered waypoint list with leg/cumulative
 * distances computed client-side via haversine (the backend stores no
 * geometry). Spots without valid coordinates are skipped.
 */
export function getWaypoints(route: Route | undefined | null): Waypoint[] {
  if (!route?.spots?.length) return [];
  const sorted = [...route.spots].sort((a, b) => a.sortOrder - b.sortOrder);
  const waypoints: Waypoint[] = [];
  let cumulative = 0;
  let prev: { lat: number; lng: number } | null = null;

  for (const rs of sorted) {
    const { spot } = rs;
    if (typeof spot.latitude !== 'number' || typeof spot.longitude !== 'number') continue;
    const legDistance = prev
      ? haversineDistance(prev.lat, prev.lng, spot.latitude, spot.longitude)
      : 0;
    cumulative += legDistance;
    waypoints.push({
      id: spot.id,
      name: spot.name,
      sortOrder: rs.sortOrder,
      latitude: spot.latitude,
      longitude: spot.longitude,
      legDistance,
      cumulative,
    });
    prev = { lat: spot.latitude, lng: spot.longitude };
  }
  return waypoints;
}

/** Total route length in meters, summed across legs. */
export function routeTotalMeters(waypoints: Waypoint[]): number {
  if (!waypoints.length) return 0;
  return waypoints[waypoints.length - 1].cumulative;
}

export interface RouteProgress {
  /** Meters covered so far. */
  doneMeters: number;
  /** Meters still to go. */
  remainingMeters: number;
  /** 0..1 share of the route completed. */
  ratio: number;
  totalMeters: number;
}

/**
 * Compute progress given the waypoint currently heading toward
 * (`currentIndex` is the index of the *next* waypoint) plus any partial
 * distance already travelled toward it.
 */
export function computeProgress(
  waypoints: Waypoint[],
  currentIndex: number,
  partialToCurrentMeters: number,
): RouteProgress {
  const total = routeTotalMeters(waypoints);
  if (!waypoints.length || total === 0) {
    return { doneMeters: 0, remainingMeters: 0, ratio: 0, totalMeters: 0 };
  }
  const baseDone = currentIndex > 0 ? waypoints[currentIndex - 1].cumulative : 0;
  const doneMeters = Math.min(total, baseDone + Math.max(0, partialToCurrentMeters));
  const remainingMeters = Math.max(0, total - doneMeters);
  return { doneMeters, remainingMeters, ratio: doneMeters / total, totalMeters: total };
}

/** Assumed travel speed for ETA: a brisk walk / slow boat. */
export const NAV_SPEED_KMH = 6;

export interface Eta {
  /** Wall-clock arrival time. */
  arrival: Date;
  /** Minutes remaining. */
  minutes: number;
}

/** Estimate arrival from remaining distance and a fixed speed assumption. */
export function estimateEta(remainingMeters: number, speedKmh = NAV_SPEED_KMH): Eta {
  const metersPerMin = (speedKmh * 1000) / 60;
  const minutes = metersPerMin > 0 ? Math.round(remainingMeters / metersPerMin) : 0;
  const arrival = new Date(Date.now() + minutes * 60_000);
  return { arrival, minutes };
}

/** Format a Date as HH:MM. */
export function formatClock(d: Date): string {
  const h = String(d.getHours()).padStart(2, '0');
  const m = String(d.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

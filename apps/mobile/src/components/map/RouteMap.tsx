import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Mapbox from '@rnmapbox/maps';
import { colors } from '@yulu/ui';
import type { Waypoint } from '../../utils/navigation';
import type { UserCoords } from '../../hooks/useLocation';

export type RouteMapHandle = {
  /** Zoom in (+) or out (−) by a delta. */
  zoomBy: (delta: number) => void;
  /** Animate the camera to a coordinate. */
  flyTo: (coord: [number, number]) => void;
  /** Fit the whole route back into view. */
  fitRoute: () => void;
};

interface Props {
  waypoints: Waypoint[];
  /** Index of the *next* waypoint the user is heading toward. */
  currentIndex: number;
  userCoords: UserCoords | null;
}

/**
 * Full-bleed Mapbox map rendering an ordered route: a done line, a remaining
 * line, three-state waypoint pins (visited / current / upcoming), and the
 * user's live position. Camera control is exposed via the forwarded ref so the
 * parent's zoom / recenter buttons can drive it.
 */
export const RouteMap = forwardRef<RouteMapHandle, Props>(function RouteMap(
  { waypoints, currentIndex, userCoords },
  ref,
) {
  const camera = useRef<Mapbox.Camera>(null);
  const zoom = useRef(14);

  const coords: [number, number][] = waypoints.map((w) => [w.longitude, w.latitude]);

  useImperativeHandle(ref, () => ({
    zoomBy: (delta) => {
      zoom.current = Math.max(3, Math.min(20, zoom.current + delta));
      camera.current?.zoomTo(zoom.current, 200);
    },
    flyTo: (coord) => camera.current?.flyTo(coord),
    fitRoute: () => {
      if (coords.length < 2) return;
      const ne = bounds(coords, 'ne');
      const sw = bounds(coords, 'sw');
      camera.current?.fitBounds(ne, sw, 60, 500);
    },
  }));

  // Split the polyline into a done leg and a remaining leg that overlap at the
  // last visited point so the two colored segments stay connected.
  const doneCoords = coords.slice(0, Math.max(currentIndex, 1));
  const remainingStart = Math.max(currentIndex - 1, 0);
  const remainingCoords = coords.slice(remainingStart);

  const doneFeature = lineFeature(doneCoords);
  const remainingFeature = lineFeature(remainingCoords);

  return (
    <View style={styles.container}>
      <Mapbox.MapView style={styles.map} logoEnabled={false} pitchEnabled={false} rotateEnabled={false}>
        <Mapbox.Camera
          ref={camera}
          defaultSettings={{
            centerCoordinate: coords[0] ?? [116.92, 40.52],
            zoomLevel: 14,
          }}
        />

        {remainingFeature && (
          <Mapbox.ShapeSource id="route-remaining" shape={remainingFeature}>
            <Mapbox.LineLayer
              id="route-remaining-line"
              style={{ lineColor: colors.accent, lineWidth: 4, lineCap: 'round', lineJoin: 'round' }}
            />
          </Mapbox.ShapeSource>
        )}
        {doneFeature && (
          <Mapbox.ShapeSource id="route-done" shape={doneFeature}>
            <Mapbox.LineLayer
              id="route-done-line"
              style={{ lineColor: colors.muted, lineWidth: 4, lineOpacity: 0.4, lineCap: 'round', lineJoin: 'round' }}
            />
          </Mapbox.ShapeSource>
        )}

        {waypoints.map((w, i) => {
          const status = i < currentIndex ? 'done' : i === currentIndex ? 'current' : 'upcoming';
          return (
            <Mapbox.MarkerView key={w.id} coordinate={[w.longitude, w.latitude]}>
              <WaypointPin status={status} label={w.sortOrder} name={status === 'current' ? w.name : undefined} />
            </Mapbox.MarkerView>
          );
        })}

        {userCoords && (
          <Mapbox.MarkerView coordinate={[userCoords.longitude, userCoords.latitude]}>
            <View style={styles.userDot} />
          </Mapbox.MarkerView>
        )}
      </Mapbox.MapView>
    </View>
  );
});

function WaypointPin({
  status,
  label,
  name,
}: {
  status: 'done' | 'current' | 'upcoming';
  label: number;
  name?: string;
}) {
  if (status === 'done') {
    return (
      <View style={styles.pinDone}>
        <Text style={styles.pinDoneIcon}>✓</Text>
      </View>
    );
  }
  if (status === 'current') {
    return (
      <View style={styles.pinCurrentWrap}>
        <View style={styles.pinCurrent} />
        {name ? (
          <Text style={styles.pinCurrentLabel} numberOfLines={1}>
            {name}
          </Text>
        ) : null}
      </View>
    );
  }
  return (
    <View style={styles.pinDefault}>
      <Text style={styles.pinDefaultText}>{label}</Text>
    </View>
  );
}

function lineFeature(coordinates: [number, number][]) {
  if (coordinates.length < 2) return null;
  return {
    type: 'Feature' as const,
    properties: {},
    geometry: { type: 'LineString' as const, coordinates },
  };
}

/** Bounding-box corner (ne = max lng/lat, sw = min) for fitBounds. */
function bounds(coords: [number, number][], corner: 'ne' | 'sw'): [number, number] {
  const lngs = coords.map((c) => c[0]);
  const lats = coords.map((c) => c[1]);
  if (corner === 'ne') return [Math.max(...lngs), Math.max(...lats)];
  return [Math.min(...lngs), Math.min(...lats)];
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  userDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.accent,
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 6,
    shadowOpacity: 0.4,
  },
  pinDone: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinDoneIcon: { color: '#fff', fontSize: 12, fontWeight: '700' },
  pinCurrentWrap: { alignItems: 'center' },
  pinCurrent: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.accentSoft,
    borderWidth: 3,
    borderColor: colors.accent,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 8,
    shadowOpacity: 0.3,
  },
  pinCurrentLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
    backgroundColor: colors.accent,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 2,
    maxWidth: 90,
  },
  pinDefault: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinDefaultText: { fontSize: 10, fontWeight: '600', color: colors.muted },
});

import React, { forwardRef, useImperativeHandle } from 'react';
import { View, Text, StyleSheet } from 'react-native';
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
 * Placeholder route map. The native Mapbox implementation was temporarily
 * disabled for this test build (see docs/build-android-device.md). The ref
 * methods are kept as no-ops so NavigationScreen's zoom / recenter buttons
 * still mount without error. Waypoints are listed as a simple vertical legend.
 */
export const RouteMap = forwardRef<RouteMapHandle, Props>(function RouteMap(
  { waypoints, currentIndex },
  ref,
) {
  useImperativeHandle(ref, () => ({
    zoomBy: () => {},
    flyTo: () => {},
    fitRoute: () => {},
  }));

  return (
    <View style={styles.container}>
      <View style={styles.placeholder}>
        <Text style={styles.title}>🗺️ 路线地图</Text>
        <Text style={styles.hint}>（测试构建暂未包含地图底图）</Text>
        <Text style={styles.hint}>共 {waypoints.length} 个航点 · 当前第 {currentIndex + 1} 个</Text>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.accentSoft },
  placeholder: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  title: { fontSize: 18, fontWeight: '700', color: colors.fg, marginBottom: 8 },
  hint: { fontSize: 13, color: colors.muted, marginTop: 4, textAlign: 'center' },
});

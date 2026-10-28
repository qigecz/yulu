import React, { forwardRef, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Mapbox from '@rnmapbox/maps';
import { colors } from '@yulu/ui';
import type { Spot, Route } from '@yulu/shared';
import { wgs84ToGcj02 } from '../../utils/gcj02';
import { STREET_STYLE } from './mapStyle';

export type SpotsMapHandle = {
  /** Zoom in (+) or out (−) by a delta. */
  zoomBy: (delta: number) => void;
  /** Animate the camera to a WGS-84 coordinate (converted to GCJ-02 inside). */
  flyTo: (longitude: number, latitude: number) => void;
};

interface Props {
  spots: Spot[];
  /** Optional real routes rendered as polylines (when `showRoutes`). */
  routes?: Route[];
  showRoutes?: boolean;
  /** Currently selected spot id (pin highlight). */
  selectedId?: string | null;
  /** Device location (WGS-84) rendered as a pulsing-style dot. */
  userCoords?: { latitude: number; longitude: number } | null;
  /** Called when a spot pin is tapped. */
  onSelect?: (spot: Spot) => void;
  style?: object;
}

/**
 * 坑点页真地图（高德街道栅格瓦片，GCJ-02）。钓点按真实经纬度渲染为出鱼率
 * 气泡 pin（≥60 热门红、选中高亮），路线以 spots 坐标连线叠加，可整体开关。
 * Camera 自动 fit 全部可见钓点；缩放/回位由外部通过 ref 句柄驱动。
 */
export const SpotsMap = forwardRef<SpotsMapHandle, Props>(function SpotsMap(
  { spots, routes, showRoutes = true, selectedId, userCoords, onSelect, style },
  ref,
) {
  const camera = useRef<Mapbox.Camera>(null);
  const zoom = useRef(10);
  // Defer mounting by a frame — same Fabric ViewTagResolver workaround as
  // RouteMap (blank map on Android when mounted in the same commit).
  const [mapReady, setMapReady] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setMapReady(true), 50);
    return () => clearTimeout(t);
  }, []);

  // Gaode tiles are GCJ-02 — convert each WGS-84 spot once, then reuse the
  // converted pair for camera center, bounds and the marker itself.
  const valid = useMemo(
    () =>
      spots
        .filter((s) => typeof s.latitude === 'number' && typeof s.longitude === 'number')
        .map((s) => ({ spot: s, pos: wgs84ToGcj02(s.longitude, s.latitude) as [number, number] })),
    [spots],
  );

  const bounds = useMemo(() => {
    const all = [...valid.map((v) => v.pos)];
    routes?.forEach((r) =>
      r.spots.forEach((rs) => {
        if (typeof rs.spot.latitude === 'number' && typeof rs.spot.longitude === 'number') {
          all.push(wgs84ToGcj02(rs.spot.longitude, rs.spot.latitude) as [number, number]);
        }
      }),
    );
    if (all.length < 2) return null;
    const lngs = all.map((p) => p[0]);
    const lats = all.map((p) => p[1]);
    return {
      ne: [Math.max(...lngs), Math.max(...lats)] as [number, number],
      sw: [Math.min(...lngs), Math.min(...lats)] as [number, number],
    };
  }, [valid, routes]);

  const center: [number, number] = valid[0]?.pos ?? [119.0, 29.7];

  // 路线折线（每条路线一个 feature，按 id 区分颜色深浅）。
  const routeFeatures = useMemo(() => {
    if (!showRoutes) return [];
    return (routes ?? [])
      .map((r) => {
        const coords = r.spots
          .filter((rs) => typeof rs.spot.latitude === 'number' && typeof rs.spot.longitude === 'number')
          .map((rs) => wgs84ToGcj02(rs.spot.longitude, rs.spot.latitude));
        if (coords.length < 2) return null;
        return {
          id: r.id,
          feature: {
            type: 'Feature' as const,
            properties: {},
            geometry: { type: 'LineString' as const, coordinates: coords },
          },
        };
      })
      .filter(Boolean) as { id: string; feature: GeoJSON.Feature }[];
  }, [routes, showRoutes]);

  React.useImperativeHandle(ref, () => ({
    zoomBy: (delta: number) => {
      zoom.current = Math.max(4, Math.min(17, zoom.current + delta));
      camera.current?.zoomTo(zoom.current, 300);
    },
    flyTo: (longitude: number, latitude: number) => {
      const pos = wgs84ToGcj02(longitude, latitude) as [number, number];
      zoom.current = 14;
      camera.current?.flyTo(pos, 600);
      camera.current?.zoomTo(14, 600);
    },
  }));

  return (
    <View style={[styles.container, style]}>
      {mapReady && (
        <Mapbox.MapView
          style={styles.map}
          styleJSON={JSON.stringify(STREET_STYLE)}
          logoEnabled={false}
          attributionEnabled={false}
          pitchEnabled={false}
          rotateEnabled={false}
        >
          <Mapbox.Camera
            defaultSettings={{ centerCoordinate: center, zoomLevel: 10 }}
            bounds={
              bounds
                ? { ...bounds, paddingTop: 60, paddingBottom: 260, paddingLeft: 40, paddingRight: 60 }
                : undefined
            }
          />

          {/* 路线叠加：每条一条折线 */}
          {routeFeatures.map(({ id, feature }) => (
            <Mapbox.ShapeSource key={id} id={`route-${id}`} shape={feature}>
              <Mapbox.LineLayer
                id={`route-line-${id}`}
                style={{
                  lineColor: colors.accent,
                  lineWidth: 3,
                  lineOpacity: 0.75,
                  lineDasharray: [2, 1.5],
                }}
              />
            </Mapbox.ShapeSource>
          ))}

          {/* 用户定位点 */}
          {userCoords && (
            <Mapbox.MarkerView
              coordinate={wgs84ToGcj02(userCoords.longitude, userCoords.latitude) as [number, number]}
              anchor={{ x: 0.5, y: 0.5 }}
            >
              <View style={styles.userDot}>
                <View style={styles.userPulse} />
                <View style={styles.userCore} />
              </View>
            </Mapbox.MarkerView>
          )}

          {/* 坑点 pin：出鱼率气泡 */}
          {valid.map(({ spot, pos }) => {
            const isSel = spot.id === selectedId;
            const hot = (spot.catchRate7d ?? 0) >= 60;
            return (
              <Mapbox.MarkerView key={spot.id} coordinate={pos} anchor={{ x: 0.5, y: 1 }}>
                <TouchableOpacity
                  style={styles.pinWrap}
                  onPress={() => onSelect?.(spot)}
                  activeOpacity={0.85}
                  hitSlop={{ top: 8, left: 8, bottom: 8, right: 8 }}
                >
                  <View style={[styles.pinDot, isSel && styles.pinDotSel, hot && styles.pinDotHot]}>
                    <Text style={[styles.pinCnt, (isSel || hot) && styles.pinCntHot]}>{spot.catchRate7d}</Text>
                  </View>
                  <View style={[styles.pinLabelWrap, isSel && styles.pinLabelWrapSel]}>
                    <Text style={[styles.pinLabel, isSel && styles.pinLabelSel]} numberOfLines={1}>
                      {spot.name.split(' · ').pop()}
                    </Text>
                  </View>
                </TouchableOpacity>
              </Mapbox.MarkerView>
            );
          })}
        </Mapbox.MapView>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: { overflow: 'hidden', backgroundColor: '#e8efe9' },
  map: { flex: 1 },
  pinWrap: { alignItems: 'center', maxWidth: 96 },
  pinDot: {
    minWidth: 30, height: 30, borderRadius: 15, paddingHorizontal: 4,
    backgroundColor: '#fff', borderWidth: 2, borderColor: colors.border,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowRadius: 3, shadowOpacity: 0.15,
  },
  pinDotSel: { borderColor: colors.fg, backgroundColor: colors.fg, transform: [{ scale: 1.15 }] },
  pinDotHot: { borderColor: colors.accent },
  pinCnt: { fontSize: 12, fontWeight: '700', color: colors.fg, fontFamily: 'monospace' },
  pinCntHot: { color: colors.accent },
  pinLabelWrap: {
    marginTop: 3, backgroundColor: 'rgba(255,255,255,0.92)', paddingHorizontal: 7,
    paddingVertical: 2, borderRadius: 7, maxWidth: 96,
  },
  pinLabelWrapSel: { backgroundColor: colors.fg },
  pinLabel: { fontSize: 10, color: colors.fg, fontWeight: '500' },
  pinLabelSel: { color: '#fff' },
  userDot: { alignItems: 'center', justifyContent: 'center' },
  userPulse: {
    position: 'absolute', width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(42, 143, 122, 0.25)',
  },
  userCore: {
    width: 14, height: 14, borderRadius: 7, backgroundColor: colors.accent,
    borderWidth: 2.5, borderColor: '#fff',
  },
});

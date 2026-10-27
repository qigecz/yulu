import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Mapbox from '@rnmapbox/maps';
import { colors } from '@yulu/ui';
import type { Spot } from '@yulu/shared';
import { wgs84ToGcj02 } from '../../utils/gcj02';
import { STREET_STYLE } from './mapStyle';

interface Props {
  spots: Spot[];
  /** Called when a spot pin is tapped. */
  onSelect?: (spot: Spot) => void;
  style?: object;
}

/**
 * Compact Mapbox map for the SpotsScreen — renders the nearby spots as pins
 * positioned by their real lat/lng (replacing the old hardcoded percentage
 * pins). The camera fits all visible spots.
 */
export function SpotsMap({ spots, onSelect, style }: Props) {
  // Gaode tiles are GCJ-02 — convert each WGS-84 spot once, then reuse the
  // converted pair for camera center, bounds and the marker itself.
  const valid = spots
    .filter((s) => typeof s.latitude === 'number' && typeof s.longitude === 'number')
    .map((s) => ({ spot: s, pos: wgs84ToGcj02(s.longitude, s.latitude) as [number, number] }));

  const bounds = useMemo(() => {
    if (valid.length < 2) return null;
    const lngs = valid.map((v) => v.pos[0]);
    const lats = valid.map((v) => v.pos[1]);
    return {
      ne: [Math.max(...lngs), Math.max(...lats)] as [number, number],
      sw: [Math.min(...lngs), Math.min(...lats)] as [number, number],
    };
  }, [valid]);

  const center: [number, number] = valid[0] ? valid[0].pos : [116.92, 40.52];

  return (
    <View style={[styles.container, style]}>
      <Mapbox.MapView
        style={styles.map}
        styleJSON={JSON.stringify(STREET_STYLE)}
        logoEnabled={false}
        attributionEnabled={false}
        pitchEnabled={false}
        rotateEnabled={false}
      >
        <Mapbox.Camera
          defaultSettings={{ centerCoordinate: center, zoomLevel: 11 }}
          bounds={
            bounds
              ? { ...bounds, paddingTop: 40, paddingBottom: 40, paddingLeft: 40, paddingRight: 40 }
              : undefined
          }
        />
        {valid.map(({ spot, pos }) => (
          <Mapbox.MarkerView key={spot.id} coordinate={pos}>
            <TouchableOpacity style={styles.pinWrap} onPress={() => onSelect?.(spot)} activeOpacity={0.8}>
              <View style={styles.pin}>
                <Text style={styles.pinIcon}>📍</Text>
              </View>
              <Text style={styles.pinLabel} numberOfLines={1}>
                {spot.name.split('·').pop()?.trim() ?? spot.name}
              </Text>
            </TouchableOpacity>
          </Mapbox.MarkerView>
        ))}
      </Mapbox.MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { overflow: 'hidden', borderRadius: 16, backgroundColor: colors.accentSoft },
  map: { flex: 1 },
  pinWrap: { alignItems: 'center', maxWidth: 96 },
  pin: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
    shadowOpacity: 0.15,
  },
  pinIcon: { fontSize: 13 },
  pinLabel: {
    fontSize: 10,
    color: colors.fg,
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 2,
    fontWeight: '500',
  },
});

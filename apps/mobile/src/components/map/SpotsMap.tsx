import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '@yulu/ui';
import type { Spot } from '@yulu/shared';

interface Props {
  spots: Spot[];
  /** Called when a spot pin is tapped. */
  onSelect?: (spot: Spot) => void;
  style?: object;
}

/**
 * Placeholder spots map. The native Mapbox implementation was temporarily
 * disabled for this test build (see docs/build-android-device.md). Nearby
 * spots are shown as a tappable list instead of map pins.
 */
export function SpotsMap({ spots, onSelect, style }: Props) {
  const valid = spots.filter(
    (s) => typeof s.latitude === 'number' && typeof s.longitude === 'number',
  );

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.banner}>🗺️ 地图（测试构建暂未包含底图）· 附近 {valid.length} 个钓点</Text>
      {valid.slice(0, 6).map((spot) => (
        <TouchableOpacity
          key={spot.id}
          style={styles.row}
          onPress={() => onSelect?.(spot)}
          activeOpacity={0.7}
        >
          <Text style={styles.pinIcon}>📍</Text>
          <Text style={styles.rowLabel} numberOfLines={1}>
            {spot.name.split('·').pop()?.trim() ?? spot.name}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    borderRadius: 16,
    backgroundColor: colors.accentSoft,
    padding: 12,
  },
  banner: { fontSize: 12, color: colors.muted, marginBottom: 8 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6 },
  pinIcon: { fontSize: 14, marginRight: 8 },
  rowLabel: { fontSize: 13, color: colors.fg, fontWeight: '500', flex: 1 },
});

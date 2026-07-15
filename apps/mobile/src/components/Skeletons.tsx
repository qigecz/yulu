import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Skeleton, SkeletonText, colors, spacing } from '@yulu/ui';

/**
 * Screen-section skeletons built from the generic Skeleton primitives.
 * Each mirrors the happy-path layout of a list section so loading states
 * feel stable rather than a blank spinner.
 */

export function SpotListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <View style={[styles.section, { flexDirection: 'row', gap: 10 }]}>
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} style={styles.spotCard}>
          <Skeleton style={{ height: 100 }} radius={0} />
          <View style={{ padding: 10 }}>
            <Skeleton style={{ width: 130, height: 13 }} />
            <Skeleton style={{ width: 100, height: 11, marginTop: 7 }} />
            <View style={{ flexDirection: 'row', gap: 4, marginTop: 8 }}>
              <Skeleton style={{ width: 40, height: 16, borderRadius: 999 }} />
              <Skeleton style={{ width: 40, height: 16, borderRadius: 999 }} />
            </View>
          </View>
        </View>
      ))}
    </View>
  );
}

export function RouteListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <View style={styles.section}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonText key={i} leading={44} titleWidth={160} subWidth={110} />
      ))}
    </View>
  );
}

export function FeedSkeleton({ count = 3 }: { count?: number }) {
  return (
    <View style={styles.section}>
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} style={styles.feedItem}>
          <SkeletonText leading={40} titleWidth={110} subWidth={70} height={44} />
          <Skeleton style={{ height: 13, marginTop: 12 }} />
          <Skeleton style={{ height: 13, marginTop: 6, width: '70%' }} />
          <Skeleton style={{ height: 120, marginTop: 12, borderRadius: 12 }} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { paddingHorizontal: spacing.screenPadding },
  spotCard: {
    width: 200, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
    borderRadius: 18, overflow: 'hidden',
  },
  feedItem: {
    paddingVertical: 14, borderTopWidth: 1, borderTopColor: colors.border,
  },
});

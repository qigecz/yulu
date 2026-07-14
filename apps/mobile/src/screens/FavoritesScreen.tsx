import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { colors, spacing, fontSize, radius, SectionHeader } from '@yulu/ui';
import { useFavoriteSpots, useFavoriteFeeds } from '../hooks/queries';
import { QueryState } from '../components/QueryState';
import { Header } from '../components/FormControls';
import { USE_MOCK } from '../config';

export function FavoritesScreen() {
  const favSpots = useFavoriteSpots();
  const favFeeds = useFavoriteFeeds();

  // Mock mode: backend-less, so favorites aren't persisted.
  if (USE_MOCK) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
        <Header title="我的收藏" />
        <View style={styles.mockHint}>
          <Text style={styles.mockHintText}>开发模式（Mock）下收藏不会持久化。{'\n'}连接后端后即可查看你收藏的钓点与动态。</Text>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <Header title="我的收藏" subtitle="你收藏的钓点与动态" />

      <View style={styles.pad}>
        <SectionHeader title="钓点" />
        <QueryState isLoading={favSpots.isLoading} isError={favSpots.isError} refetch={() => favSpots.refetch()} empty={!(favSpots.data && favSpots.data.length)} emptyText="暂无收藏的钓点">
          {favSpots.data!.map((spot) => (
            <View key={spot.id} style={styles.item}>
              <Text style={styles.itemTitle}>{spot.name}</Text>
              <Text style={styles.itemSub}>{spot.fishSpecies.join('/')} · {spot.fishingMethod}</Text>
            </View>
          ))}
        </QueryState>
      </View>

      <View style={{ height: 14 }} />

      <View style={styles.pad}>
        <SectionHeader title="动态" />
        <QueryState isLoading={favFeeds.isLoading} isError={favFeeds.isError} refetch={() => favFeeds.refetch()} empty={!(favFeeds.data && favFeeds.data.length)} emptyText="暂无收藏的动态">
          {favFeeds.data!.map((feed) => (
            <View key={feed.id} style={styles.item}>
              <Text style={styles.itemTitle}>{feed.user?.nickname || '钓友'}</Text>
              <Text style={styles.itemSub} numberOfLines={2}>{feed.content}</Text>
            </View>
          ))}
        </QueryState>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  pad: { paddingHorizontal: spacing.screenPadding },
  item: {
    paddingVertical: 12, borderTopWidth: 1, borderTopColor: colors.border,
  },
  itemTitle: { fontSize: 14, fontWeight: '600', color: colors.fg },
  itemSub: { fontSize: 12, color: colors.muted, marginTop: 3 },
  mockHint: { marginHorizontal: spacing.screenPadding, marginTop: 8, padding: 16, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md },
  mockHintText: { fontSize: fontSize.meta, color: colors.muted, lineHeight: 20 },
});

import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing, fontSize, radius, SearchBar, SpotCard, SpotCardList, RouteItem, SectionHeader, Tag } from '@yulu/ui';
import { formatDistance, formatViewCount } from '@yulu/shared';
import { useSearch } from '../hooks/queries';
import { useUIStore } from '../store/ui';

/**
 * Full-screen search overlay. Auto-focuses the input, debounces via useSearch,
 * and renders grouped results (spots / routes / tutorials). Tapping a result
 * closes the overlay for now (detail navigation is wired in a later phase).
 */
export function SearchScreen() {
  const [q, setQ] = useState('');
  const search = useSearch(q);
  const close = useUIStore((s) => s.closeOverlay);
  const data = search.data;
  const hasQuery = q.trim().length > 0;
  const isEmpty =
    hasQuery && !search.isFetching && data && data.spots.length === 0 && data.routes.length === 0 && data.tutorials.length === 0;

  return (
    <View style={styles.container}>
      <View style={styles.searchRow}>
        <View style={{ flex: 1 }}>
          <SearchBar placeholder="搜索钓点、路线、教程…" value={q} onChangeText={setQ} />
        </View>
        <TouchableOpacity onPress={close} hitSlop={8}>
          <Text style={styles.cancelBtn}>取消</Text>
        </TouchableOpacity>
      </View>

      {!hasQuery ? (
        <View style={styles.hint}>
          <Text style={styles.hintEmoji}>🔎</Text>
          <Text style={styles.hintText}>搜索钓点、路线、教程</Text>
          <Text style={styles.hintSub}>试试「千岛湖」「路亚」「调漂」</Text>
        </View>
      ) : isEmpty ? (
        <View style={styles.hint}>
          <Text style={styles.hintEmoji}>🎣</Text>
          <Text style={styles.hintText}>没有找到「{q.trim()}」相关结果</Text>
        </View>
      ) : (
        <ScrollView style={styles.results} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          {data && data.spots.length > 0 && (
            <View style={styles.group}>
              <SectionHeader title={`钓点 · ${data.spots.length}`} />
              <View style={{ height: 10 }} />
              <SpotCardList>
                {data.spots.map((spot) => (
                  <SpotCard
                    key={spot.id}
                    name={spot.name}
                    distance={spot.distance ? formatDistance(spot.distance) : ''}
                    fishInfo={`${spot.fishSpecies.join('/')} · ${spot.fishingMethod ?? ''}`}
                    tags={spot.tags}
                  />
                ))}
              </SpotCardList>
            </View>
          )}

          {data && data.routes.length > 0 && (
            <View style={styles.group}>
              <SectionHeader title={`路线 · ${data.routes.length}`} />
              <View style={{ height: 8 }} />
              {data.routes.map((route) => (
                <TouchableOpacity key={route.id} onPress={close} activeOpacity={0.6}>
                  <RouteItem
                    name={route.name}
                    description={`${route.spots?.length || 0} 坑点 · ${route.totalDistance ?? '-'}km · ${route.uploader?.nickname || '未知'}`}
                  />
                </TouchableOpacity>
              ))}
            </View>
          )}

          {data && data.tutorials.length > 0 && (
            <View style={styles.group}>
              <SectionHeader title={`教程 · ${data.tutorials.length}`} />
              <View style={{ height: 8 }} />
              {data.tutorials.map((tut) => (
                <View key={tut.id} style={styles.tutItem}>
                  <View style={styles.tutThumb}>
                    <Text style={styles.tutType}>{tut.type === 'video' ? '▶' : '📄'}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.tutTitle} numberOfLines={2}>{tut.title}</Text>
                    <Text style={styles.tutMeta}>
                      {tut.author?.nickname || ''} · {formatViewCount(tut.viewsCount)} 次观看 · {tut.duration ?? ''}
                    </Text>
                    <View style={styles.tagRow}>
                      {tut.category && <Tag label={tut.category} />}
                      {tut.tags.slice(0, 2).map((t) => <Tag key={t} label={t} />)}
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}

          {search.isFetching && !data && <View style={{ height: 120 }} />}
          <View style={{ height: 80 }} />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  searchRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: spacing.screenPadding, paddingTop: 12, paddingBottom: 8,
  },
  cancelBtn: { fontSize: fontSize.body, color: colors.accent, fontWeight: '600' },
  hint: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 60 },
  hintEmoji: { fontSize: 44 },
  hintText: { fontSize: fontSize.body, color: colors.fg, marginTop: spacing.sm },
  hintSub: { fontSize: fontSize.meta, color: colors.muted, marginTop: 4 },
  results: { flex: 1 },
  group: { marginTop: spacing.md },
  tutItem: {
    flexDirection: 'row', gap: 10, paddingVertical: 10,
    paddingHorizontal: spacing.screenPadding, borderTopWidth: 1, borderTopColor: colors.border,
  },
  tutThumb: {
    width: 64, height: 48, borderRadius: radius.sm, backgroundColor: colors.accentSoft,
    alignItems: 'center', justifyContent: 'center',
  },
  tutType: { fontSize: 16, color: colors.accent },
  tutTitle: { fontSize: fontSize.body - 1, fontWeight: '500', color: colors.fg, lineHeight: 20 },
  tutMeta: { fontSize: fontSize.small, color: colors.muted, marginTop: 3 },
  tagRow: { flexDirection: 'row', gap: 4, marginTop: 6 },
});

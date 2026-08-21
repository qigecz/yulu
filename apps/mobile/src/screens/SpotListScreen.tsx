import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius } from '@yulu/ui';
import type { Spot } from '@yulu/shared';
import { formatDistance } from '@yulu/shared';
import { useNearbySpots } from '../hooks/queries';
import { useUIStore } from '../store/ui';
import { QueryState } from '../components/QueryState';
import { SpotListSkeleton } from '../components/Skeletons';

type SortKey = 'distance' | 'rating' | 'catch';

const METHODS = ['全部', '路亚', '台钓', '湖钓', '筏钓', '溪流'];
const SORTS: { key: SortKey; label: string }[] = [
  { key: 'distance', label: '距离' },
  { key: 'rating', label: '评分' },
  { key: 'catch', label: '渔获' },
];
const STAR_COLOR = '#e8a33d';

export function SpotListScreen() {
  const close = useUIStore((s) => s.closeOverlay);
  const openSpotDetail = useUIStore((s) => s.openSpotDetail);
  const setActiveTab = useUIStore((s) => s.setActiveTab);
  const spots = useNearbySpots();

  const [method, setMethod] = useState('全部');
  const [sort, setSort] = useState<SortKey>('distance');

  const list = useMemo(() => {
    let arr = spots.data ? [...spots.data] : [];
    if (method !== '全部') arr = arr.filter((s) => s.fishingMethod === method);
    if (sort === 'distance') arr.sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0));
    if (sort === 'rating') arr.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    if (sort === 'catch') arr.sort((a, b) => (b.catchRate7d ?? 0) - (a.catchRate7d ?? 0));
    return arr;
  }, [spots.data, method, sort]);

  const sortLabel = SORTS.find((s) => s.key === sort)?.label ?? '';

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.iconBtn} onPress={close} activeOpacity={0.7}>
            <Ionicons name="chevron-back" size={20} color={colors.fg} />
          </TouchableOpacity>
          <Text style={styles.hTitle}>附近钓点</Text>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => { close(); setActiveTab('spots'); }}
            activeOpacity={0.7}
          >
            <Ionicons name="map-outline" size={18} color={colors.fg} />
          </TouchableOpacity>
        </View>

        {/* Search (jumps to global search) */}
        <TouchableOpacity
          style={styles.searchWrap}
          onPress={() => { close(); useUIStore.getState().openSearch(); }}
          activeOpacity={0.8}
        >
          <Ionicons name="search" size={16} color={colors.muted} />
          <Text style={styles.searchPh}>搜索钓点名称、鱼种…</Text>
        </TouchableOpacity>

        {/* Method filter chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {METHODS.map((m) => (
            <TouchableOpacity
              key={m}
              style={[styles.fchip, method === m && styles.fchipOn]}
              onPress={() => setMethod(m)}
              activeOpacity={0.7}
            >
              <Text style={[styles.fchipT, method === m && styles.fchipTOn]}>{m}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Result row */}
        <View style={styles.resultRow}>
          <Text style={styles.rCount}>
            共 <Text style={styles.rCountStrong}>{list.length}</Text> 个钓点 · 按{sortLabel}排序
          </Text>
          <View style={styles.sortGroup}>
            {SORTS.map((s) => (
              <TouchableOpacity
                key={s.key}
                style={[styles.sortBtn, sort === s.key && styles.sortBtnOn]}
                onPress={() => setSort(s.key)}
                activeOpacity={0.7}
              >
                <Text style={[styles.sortBtnT, sort === s.key && styles.sortBtnTOn]}>{s.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* List */}
        <View style={styles.listWrap}>
          {spots.isLoading ? (
            <SpotListSkeleton count={4} />
          ) : (
            <QueryState
              isLoading={false}
              isError={spots.isError}
              refetch={() => spots.refetch()}
              empty={list.length === 0}
              emptyText="该条件下暂无钓点，换个筛法试试"
            >
              {list.map((s) => (
                <SpotRow key={s.id} spot={s} onPress={() => openSpotDetail(s.id)} />
              ))}
            </QueryState>
          )}
        </View>

        {list.length > 0 && (
          <Text style={styles.listEnd}>— 已加载附近全部 {list.length} 个钓点 —</Text>
        )}
      </ScrollView>
    </View>
  );
}

function SpotRow({ spot, onPress }: { spot: Spot; onPress: () => void }) {
  const hot = (spot.catchRate7d ?? 0) >= 80;
  return (
    <TouchableOpacity style={styles.spotRow} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.sThumb}>
        <Text style={styles.sThumbT}>实景</Text>
      </View>
      <View style={styles.sBody}>
        <View style={styles.sTop}>
          <Text style={styles.sName} numberOfLines={1}>{spot.name}</Text>
          {spot.rating != null && (
            <View style={styles.sRate}>
              <Ionicons name="star" size={11} color={STAR_COLOR} />
              <Text style={styles.sRateT}>{spot.rating.toFixed(1)}</Text>
            </View>
          )}
        </View>
        <Text style={styles.sMeta}>
          距你 {spot.distance != null ? formatDistance(spot.distance) : '—'} · {spot.fishSpecies.join('/')} · {spot.fishingMethod ?? '综合'}
        </Text>
        <View style={styles.sTags}>
          {spot.tags.map((t) => (
            <View key={t} style={styles.sTag}><Text style={styles.sTagT}>{t}</Text></View>
          ))}
        </View>
        <View style={styles.sFoot}>
          {hot && <Text style={styles.sHot}>热门 · 出鱼率 {spot.catchRate7d}%</Text>}
          {!hot && spot.catchRate7d != null && <Text style={styles.sFootT}>近7天渔获 {spot.catchRate7d} 尾</Text>}
          <Text style={styles.sCta}>详情 →</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },

  header: { paddingHorizontal: spacing.screenPadding, paddingVertical: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  iconBtn: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: colors.surface,
    borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center',
  },
  hTitle: { fontSize: 18, fontWeight: '600', color: colors.fg, fontFamily: 'Georgia' },

  searchWrap: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginHorizontal: spacing.screenPadding, paddingVertical: 10, paddingHorizontal: 14,
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 14,
  },
  searchPh: { fontSize: 14, color: colors.muted },

  filterScroll: { gap: 8, paddingHorizontal: spacing.screenPadding, paddingTop: 14 },
  fchip: {
    paddingHorizontal: 14, paddingVertical: 7, backgroundColor: colors.surface,
    borderWidth: 1, borderColor: colors.border, borderRadius: 999,
  },
  fchipOn: { backgroundColor: colors.accent, borderColor: 'transparent' },
  fchipT: { fontSize: 13, color: colors.fg },
  fchipTOn: { color: '#fff', fontWeight: '600' },

  resultRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.screenPadding, paddingTop: 12, paddingBottom: 10,
  },
  rCount: { fontSize: 13, color: colors.muted },
  rCountStrong: { color: colors.fg, fontWeight: '600' },
  sortGroup: { flexDirection: 'row', gap: 4 },
  sortBtn: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  sortBtnOn: { backgroundColor: colors.accentSoft },
  sortBtnT: { fontSize: 12, color: colors.muted },
  sortBtnTOn: { color: colors.accent, fontWeight: '600' },

  listWrap: { paddingHorizontal: spacing.screenPadding, gap: 10 },
  spotRow: {
    flexDirection: 'row', gap: 12, backgroundColor: colors.surface,
    borderWidth: 1, borderColor: colors.border, borderRadius: 16, padding: 10,
  },
  sThumb: {
    width: 84, height: 84, borderRadius: 12, backgroundColor: colors.accentSoft,
    borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center',
  },
  sThumbT: { fontSize: 9, color: colors.muted },
  sBody: { flex: 1, minWidth: 0 },
  sTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 },
  sName: { fontSize: 15, fontWeight: '600', color: colors.fg, flex: 1, letterSpacing: -0.2 },
  sRate: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  sRateT: { fontSize: 12, color: colors.accent, fontWeight: '600' },
  sMeta: { fontSize: 12, color: colors.muted, marginTop: 3 },
  sTags: { flexDirection: 'row', gap: 5, marginTop: 6, flexWrap: 'wrap' },
  sTag: { paddingHorizontal: 8, paddingVertical: 2, borderWidth: 1, borderColor: colors.border, borderRadius: 999 },
  sTagT: { fontSize: 10, color: colors.muted },
  sFoot: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 'auto', paddingTop: 6 },
  sHot: { fontSize: 11, color: colors.accent },
  sFootT: { fontSize: 11, color: colors.muted },
  sCta: { marginLeft: 'auto', color: colors.accent, fontSize: 11, fontWeight: '500' },

  listEnd: { fontSize: 11, color: colors.muted, textAlign: 'center', paddingTop: 16 },
});

import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '@yulu/ui';
import type { Route } from '@yulu/shared';
import { formatRelativeTime } from '@yulu/shared';
import { useRoutes } from '../hooks/queries';
import { useUIStore } from '../store/ui';
import { QueryState } from '../components/QueryState';
import { RouteListSkeleton } from '../components/Skeletons';

type SortKey = 'latest' | 'downloads' | 'distance';

const TYPES = ['全部', '环线', '往返', '穿越'];
const SORTS: { key: SortKey; label: string }[] = [
  { key: 'latest', label: '最新' },
  { key: 'downloads', label: '下载量' },
  { key: 'distance', label: '里程' },
];

export function RouteListScreen() {
  const close = useUIStore((s) => s.closeOverlay);
  const openRouteDetail = useUIStore((s) => s.openRouteDetail);
  const routes = useRoutes();

  const [type, setType] = useState('全部');
  const [sort, setSort] = useState<SortKey>('latest');

  const list = useMemo(() => {
    let arr = routes.data ? [...routes.data] : [];
    if (type !== '全部') arr = arr.filter((r) => r.routeType === type);
    if (sort === 'latest') arr.sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''));
    if (sort === 'downloads') arr.sort((a, b) => (b.downloadsCount ?? 0) - (a.downloadsCount ?? 0));
    if (sort === 'distance') arr.sort((a, b) => (a.totalDistance ?? 0) - (b.totalDistance ?? 0));
    return arr;
  }, [routes.data, type, sort]);

  const sortLabel = SORTS.find((s) => s.key === sort)?.label ?? '';

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.iconBtn} onPress={close} activeOpacity={0.7}>
            <Ionicons name="chevron-back" size={20} color={colors.fg} />
          </TouchableOpacity>
          <Text style={styles.hTitle}>最新路线</Text>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => useUIStore.getState().openNavigation('')}
            activeOpacity={0.7}
          >
            <Ionicons name="map-outline" size={18} color={colors.fg} />
          </TouchableOpacity>
        </View>

        {/* Type filter chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {TYPES.map((t) => (
            <TouchableOpacity
              key={t}
              style={[styles.fchip, type === t && styles.fchipOn]}
              onPress={() => setType(t)}
              activeOpacity={0.7}
            >
              <Text style={[styles.fchipT, type === t && styles.fchipTOn]}>{t}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Result row */}
        <View style={styles.resultRow}>
          <Text style={styles.rCount}>
            共 <Text style={styles.rCountStrong}>{list.length}</Text> 条路线 · 按{sortLabel}排序
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
          {routes.isLoading ? (
            <RouteListSkeleton count={4} />
          ) : (
            <QueryState
              isLoading={false}
              isError={routes.isError}
              refetch={() => routes.refetch()}
              empty={list.length === 0}
              emptyText="该条件下暂无路线，换个类型试试"
            >
              {list.map((r) => (
                <RouteRow key={r.id} route={r} onPress={() => openRouteDetail(r.id)} />
              ))}
            </QueryState>
          )}
        </View>

        {list.length > 0 && (
          <Text style={styles.listEnd}>— 已加载全部 {list.length} 条路线 —</Text>
        )}
      </ScrollView>
    </View>
  );
}

function RouteRow({ route, onPress }: { route: Route; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.routeRow} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.rIcon}>
        <Ionicons name="layers-outline" size={22} color={colors.accent} />
      </View>
      <View style={styles.rBody}>
        <View style={styles.rNameRow}>
          <Text style={styles.rName} numberOfLines={1}>{route.name}</Text>
          {route.routeType && (
            <View style={styles.rType}><Text style={styles.rTypeT}>{route.routeType}</Text></View>
          )}
        </View>
        <Text style={styles.rDesc}>
          {route.spots.length || (route.sequence?.length ?? 0)} 坑点 · {(route.totalDistance ?? 0).toFixed(1)}km · 上传者：{route.uploader?.nickname || '未知'}
        </Text>
        <View style={styles.rFoot}>
          {route.difficulty && <Text style={styles.rDiff}>{route.difficulty}</Text>}
          <Text style={styles.rDl}>{route.downloadsCount.toLocaleString()} 次下载</Text>
          {route.createdAt && <Text style={styles.rTime}>{formatRelativeTime(route.createdAt)}</Text>}
        </View>
      </View>
      <View style={styles.rCta}>
        <Ionicons name="download-outline" size={13} color={colors.accent} />
        <Text style={styles.rCtaT}>下载</Text>
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

  filterScroll: { gap: 8, paddingHorizontal: spacing.screenPadding, paddingTop: 6 },
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
  routeRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
    borderRadius: 16, padding: 14,
  },
  rIcon: { width: 48, height: 48, borderRadius: 14, backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center' },
  rBody: { flex: 1, minWidth: 0 },
  rNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  rName: { fontSize: 15, fontWeight: '600', color: colors.fg, letterSpacing: -0.2 },
  rType: { backgroundColor: 'rgba(26,36,32,0.06)', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 5 },
  rTypeT: { fontSize: 9, color: colors.muted },
  rDesc: { fontSize: 12, color: colors.muted, marginTop: 3 },
  rFoot: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 6 },
  rDiff: { fontSize: 11, color: colors.muted },
  rDl: { fontSize: 11, color: colors.accent },
  rTime: { fontSize: 11, color: colors.muted },
  rCta: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 13, paddingVertical: 8, borderRadius: 999,
    backgroundColor: colors.accentSoft,
  },
  rCtaT: { fontSize: 12, color: colors.accent, fontWeight: '600' },

  listEnd: { fontSize: 11, color: colors.muted, textAlign: 'center', paddingTop: 16 },
});

import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { colors, spacing, fontSize, radius, SearchBar, FilterChips, Pill, Tag } from '@yulu/ui';
import { formatDistance } from '@yulu/shared';
import { useRoutes, useNearbySpots, useToggleSpotLike, useToggleFavorite, useDownloadRoute } from '../hooks/queries';
import { useOfflineStore } from '../store/offline';
import { QueryState } from '../components/QueryState';
import { RouteListSkeleton } from '../components/Skeletons';
import { SpotsMap } from '../components/map/SpotsMap';
import { useUIStore } from '../store/ui';

export function SpotsScreen() {
  const [activeFilter, setActiveFilter] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const filters = ['全部', '路线', '坑点', '路亚', '台钓', '湖钓', '溪流'];

  const routes = useRoutes();
  const spots = useNearbySpots();
  const openCreateSpot = useUIStore((s) => s.openCreateSpot);
  const openSearch = useUIStore((s) => s.openSearch);
  const openNavigation = useUIStore((s) => s.openNavigation);
  const openSpotDetail = useUIStore((s) => s.openSpotDetail);
  const openRouteDetail = useUIStore((s) => s.openRouteDetail);
  const toggleSpotLike = useToggleSpotLike();
  const toggleFavorite = useToggleFavorite();
  const downloadRoute = useDownloadRoute();
  // Featured (or first) route drives the detail card.
  const featuredRoute = routes.data?.find((r) => r.featured) ?? routes.data?.[0];
  const downloaded = useOfflineStore((s) => (featuredRoute ? s.has(featuredRoute.id) : false));

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([routes.refetch(), spots.refetch()].map((p) => p.catch(() => undefined)));
    setRefreshing(false);
  };

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>坑点路线</Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TouchableOpacity style={styles.iconBtn} onPress={openSearch} activeOpacity={0.7}>
            <Text>🔍</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} onPress={openCreateSpot} activeOpacity={0.7}>
            <Text>➕</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Search (tappable → search overlay) */}
      <View style={styles.pad}>
        <TouchableOpacity onPress={openSearch} activeOpacity={0.8}>
          <SearchBar />
        </TouchableOpacity>
      </View>

      <View style={{ height: 12 }} />

      {/* Map of nearby spots */}
      <View style={styles.mapArea}>
        <SpotsMap spots={spots.data ?? []} onSelect={(s) => openSpotDetail(s.id)} />
      </View>

      <View style={{ height: 12 }} />

      {/* Filters */}
      <FilterChips options={filters} activeIndex={activeFilter} onSelect={setActiveFilter} />

      <View style={{ height: 14 }} />

      {/* Route detail card */}
      {routes.isLoading ? (
        <View style={{ paddingHorizontal: spacing.screenPadding }}>
          <RouteListSkeleton count={1} />
        </View>
      ) : (
        <QueryState isLoading={false} isError={routes.isError} refetch={() => routes.refetch()} minHeight={180}>
          {featuredRoute && (
            <TouchableOpacity style={styles.routeCard} onPress={() => openRouteDetail(featuredRoute.id)} activeOpacity={0.85}>
              <View style={styles.routeHeader}>
                <View>
                  <Text style={styles.routeTitle}>{featuredRoute.name}</Text>
                  <Text style={styles.routeAuthor}>上传者：{featuredRoute.uploader?.nickname || '未知'}</Text>
                </View>
                {featuredRoute.featured && <Pill label="精选路线" />}
              </View>
              <View style={styles.routeStats}>
                <Text style={styles.routeStat}>📍 {featuredRoute.spots?.length || 0} 坑点</Text>
                <Text style={styles.routeStat}>⚡ {featuredRoute.totalDistance ?? '-'} km</Text>
                <Text style={styles.routeStat}>👁 {featuredRoute.downloadsCount.toLocaleString()} 次下载</Text>
              </View>
              <View style={styles.routeTags}>
                {featuredRoute.tags.map((t) => <Tag key={t} label={t} />)}
              </View>
              {featuredRoute.description ? (
                <Text style={styles.routeDesc}>{featuredRoute.description}</Text>
              ) : null}
              <DownloadButton
                state={downloaded ? 'done' : downloadRoute.isPending ? 'loading' : 'idle'}
                onPress={() =>
                  downloadRoute.mutate({ id: featuredRoute.id, stub: featuredRoute })
                }
              />
              {downloaded && (
                <TouchableOpacity
                  style={styles.navBtn}
                  onPress={() => openNavigation(featuredRoute.id)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.navBtnText}>🧭 开始导航</Text>
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          )}
        </QueryState>
      )}

      <View style={{ height: 14 }} />

      {/* Spot list */}
      <View style={styles.pad}>
        <Text style={styles.sectionTitle}>路线包含的坑点 <Text style={styles.sectionCount}>{spots.data?.length ?? 0} 个</Text></Text>
        <QueryState
          isLoading={spots.isLoading}
          isError={spots.isError}
          refetch={() => spots.refetch()}
          empty={!(spots.data && spots.data.length)}
          emptyText="暂无坑点"
        >
          {spots.data!.map((spot, i) => (
            <View key={spot.id} style={styles.spotItem}>
              <View style={styles.spotIdx}><Text style={styles.spotIdxText}>{String(i + 1).padStart(2, '0')}</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={styles.spotName}>{spot.name}</Text>
                <Text style={styles.spotMeta}>水深 {spot.waterDepth} · {spot.bottomType} · {spot.fishSpecies.join('/')}</Text>
              </View>
              <View style={styles.spotActions}>
                <TouchableOpacity
                  style={styles.spotAction}
                  onPress={() => toggleSpotLike.mutate({ id: spot.id, liked: !!spot.liked })}
                  activeOpacity={0.6}
                >
                  <Text style={[styles.spotActionIcon, spot.liked && { color: '#c0392b' }]}>{spot.liked ? '❤' : '♡'}</Text>
                  <Text style={styles.spotActionCount}>{spot.likesCount}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.spotAction}
                  onPress={() => toggleFavorite.mutate({ type: 'spot', id: spot.id, favorited: !!spot.favorited })}
                  activeOpacity={0.6}
                >
                  <Text style={[styles.spotActionIcon, spot.favorited && { color: colors.accent }]}>{spot.favorited ? '★' : '☆'}</Text>
                </TouchableOpacity>
                <Text style={styles.spotDist}>{spot.distance ? formatDistance(spot.distance * 3) : ''}</Text>
              </View>
            </View>
          ))}
        </QueryState>
      </View>

      <View style={{ height: 80 }} />
    </ScrollView>
  );
}

function DownloadButton({ state, onPress }: { state: 'idle' | 'loading' | 'done'; onPress: () => void }) {
  const label = state === 'loading' ? '下载中…' : state === 'done' ? '✓ 已离线下载' : '⬇ 下载路线 · 离线可用';
  return (
    <TouchableOpacity
      style={[styles.downloadBtn, state === 'done' && { backgroundColor: colors.accentSoft }]}
      onPress={onPress}
      disabled={state !== 'idle'}
      activeOpacity={0.7}
    >
      <Text style={[styles.downloadBtnText, state === 'done' && { color: colors.accent }]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: spacing.screenPadding, paddingTop: 8, paddingBottom: 12,
  },
  title: { fontFamily: 'Georgia', fontSize: fontSize.h1, letterSpacing: -0.02, color: colors.fg },
  iconBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  pad: { paddingHorizontal: spacing.screenPadding },
  mapArea: {
    height: 260, marginHorizontal: spacing.screenPadding,
    backgroundColor: colors.accentSoft, borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.lg, overflow: 'hidden', position: 'relative',
  },
  navBtn: {
    marginTop: 10, paddingVertical: 12, borderRadius: radius.md,
    borderWidth: 1.5, borderColor: colors.accent, alignItems: 'center',
  },
  navBtnText: { color: colors.accent, fontSize: 15, fontWeight: '600' },
  routeCard: {
    marginHorizontal: spacing.screenPadding, padding: 16,
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg,
  },
  routeHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  routeTitle: { fontSize: 16, fontWeight: '600', color: colors.fg },
  routeAuthor: { fontSize: 12, color: colors.muted, marginTop: 3 },
  routeStats: { flexDirection: 'row', gap: 16, marginVertical: 10 },
  routeStat: { fontSize: 13, color: colors.muted },
  routeTags: { flexDirection: 'row', gap: 4, flexWrap: 'wrap', marginVertical: 10 },
  routeDesc: { fontSize: 13, color: colors.muted, lineHeight: 20 },
  downloadBtn: {
    marginTop: 12, paddingVertical: 12, borderRadius: radius.md,
    backgroundColor: colors.accent, alignItems: 'center',
  },
  downloadBtnText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  sectionTitle: { fontSize: 15, fontWeight: '600', marginBottom: 10 },
  sectionCount: { fontSize: 13, color: colors.accent },
  spotItem: {
    flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10,
    borderTopWidth: 1, borderTopColor: colors.border,
  },
  spotIdx: {
    width: 36, height: 36, borderRadius: 10, backgroundColor: colors.accentSoft,
    alignItems: 'center', justifyContent: 'center',
  },
  spotIdxText: { fontFamily: 'monospace', fontSize: 13, fontWeight: '600', color: colors.accent },
  spotName: { fontSize: 14, fontWeight: '500', color: colors.fg },
  spotMeta: { fontSize: 11, color: colors.muted, marginTop: 1 },
  spotActions: { alignItems: 'flex-end', gap: 2 },
  spotAction: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  spotActionIcon: { fontSize: 15, color: colors.muted },
  spotActionCount: { fontSize: 11, color: colors.muted },
  spotDist: { fontFamily: 'monospace', fontSize: 12, color: colors.muted },
});

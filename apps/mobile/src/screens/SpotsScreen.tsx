import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing, fontSize, radius, SearchBar, FilterChips, Pill, Tag } from '@yulu/ui';
import { formatDistance } from '@yulu/shared';
import { useRoutes, useNearbySpots, useToggleSpotLike, useToggleFavorite } from '../hooks/queries';
import { QueryState } from '../components/QueryState';
import { useUIStore } from '../store/ui';

export function SpotsScreen() {
  const [activeFilter, setActiveFilter] = useState(0);
  const filters = ['全部', '路线', '坑点', '路亚', '台钓', '湖钓', '溪流'];

  const routes = useRoutes();
  const spots = useNearbySpots();
  const openCreateSpot = useUIStore((s) => s.openCreateSpot);
  const toggleSpotLike = useToggleSpotLike();
  const toggleFavorite = useToggleFavorite();
  // Featured (or first) route drives the detail card.
  const featuredRoute = routes.data?.find((r) => r.featured) ?? routes.data?.[0];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>坑点路线</Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <View style={styles.iconBtn}><Text>🔍</Text></View>
          <TouchableOpacity style={styles.iconBtn} onPress={openCreateSpot} activeOpacity={0.7}>
            <Text>➕</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Map placeholder */}
      <View style={styles.mapArea}>
        <View style={styles.mapGrid} />
        <View style={[styles.mapPin, { top: '28%', left: '22%' }]}>
          <View style={styles.pinDot}><Text style={styles.pinDotText}>📍</Text></View>
          <Text style={styles.pinLabel}>碧溪湾</Text>
        </View>
        <View style={[styles.mapPin, { top: '50%', left: '55%' }]}>
          <View style={styles.pinDot}><Text style={styles.pinDotText}>📍</Text></View>
          <Text style={styles.pinLabel}>富春江钓台</Text>
        </View>
        <View style={[styles.mapPin, { top: '65%', left: '30%' }]}>
          <View style={styles.pinDot}><Text style={styles.pinDotText}>📍</Text></View>
          <Text style={styles.pinLabel}>东山半岛</Text>
        </View>
      </View>

      <View style={{ height: 12 }} />

      {/* Filters */}
      <FilterChips options={filters} activeIndex={activeFilter} onSelect={setActiveFilter} />

      <View style={{ height: 14 }} />

      {/* Route detail card */}
      <QueryState isLoading={routes.isLoading} isError={routes.isError} refetch={() => routes.refetch()} minHeight={180}>
        {featuredRoute && (
          <View style={styles.routeCard}>
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
            <View style={styles.downloadBtn}>
              <Text style={styles.downloadBtnText}>⬇ 下载路线 · 离线可用</Text>
            </View>
          </View>
        )}
      </QueryState>

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
  mapArea: {
    height: 260, marginHorizontal: spacing.screenPadding,
    backgroundColor: colors.accentSoft, borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.lg, overflow: 'hidden', position: 'relative',
  },
  mapGrid: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.3,
    borderColor: colors.border,
  },
  mapPin: { position: 'absolute', alignItems: 'center' },
  pinDot: { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  pinDotText: { fontSize: 14 },
  pinLabel: {
    fontSize: 10, fontWeight: '600', color: colors.fg, backgroundColor: colors.surface,
    paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, borderWidth: 1, borderColor: colors.border, marginTop: 2,
  },
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
  pad: { paddingHorizontal: spacing.screenPadding },
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

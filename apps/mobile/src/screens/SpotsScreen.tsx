import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { colors, spacing, fontSize, radius, SearchBar, FilterChips, Pill, Tag } from '@yulu/ui';
import { mockSpots, mockRoutes } from '../mock/data';
import { formatDistance } from '@yulu/shared';

export function SpotsScreen() {
  const [activeFilter, setActiveFilter] = useState(0);
  const filters = ['全部', '路线', '坑点', '路亚', '台钓', '湖钓', '溪流'];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>坑点路线</Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <View style={styles.iconBtn}><Text>🔍</Text></View>
          <View style={styles.iconBtn}><Text>➕</Text></View>
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
      <View style={styles.routeCard}>
        <View style={styles.routeHeader}>
          <View>
            <Text style={styles.routeTitle}>密云水库北岸环线</Text>
            <Text style={styles.routeAuthor}>上传者：老张 · 2026年5月28日</Text>
          </View>
          <Pill label="精选路线" />
        </View>
        <View style={styles.routeStats}>
          <Text style={styles.routeStat}>📍 12 坑点</Text>
          <Text style={styles.routeStat}>⚡ 18.5 km</Text>
          <Text style={styles.routeStat}>👁 2,340 次下载</Text>
        </View>
        <View style={styles.routeTags}>
          {['鲈鱼', '翘嘴', '路亚', '水库'].map((t) => <Tag key={t} label={t} />)}
        </View>
        <Text style={styles.routeDesc}>
          密云水库北岸经典路亚路线，涵盖12个优质坑点。从东岸出发，沿北岸绕行，覆盖深水区和浅滩。最佳季节：4-10月。
        </Text>
        <View style={styles.downloadBtn}>
          <Text style={styles.downloadBtnText}>⬇ 下载路线 · 离线可用</Text>
        </View>
      </View>

      <View style={{ height: 14 }} />

      {/* Spot list */}
      <View style={styles.pad}>
        <Text style={styles.sectionTitle}>路线包含的坑点 <Text style={styles.sectionCount}>12 个</Text></Text>
        {mockSpots.map((spot, i) => (
          <View key={spot.id} style={styles.spotItem}>
            <View style={styles.spotIdx}><Text style={styles.spotIdxText}>{String(i + 1).padStart(2, '0')}</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.spotName}>{spot.name}</Text>
              <Text style={styles.spotMeta}>水深 {spot.waterDepth} · {spot.bottomType} · {spot.fishSpecies.join('/')}</Text>
            </View>
            <Text style={styles.spotDist}>{spot.distance ? formatDistance(spot.distance * 3) : ''}</Text>
          </View>
        ))}
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
  spotDist: { fontFamily: 'monospace', fontSize: 12, color: colors.muted },
});

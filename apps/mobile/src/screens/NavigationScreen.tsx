import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { colors, spacing, fontSize, radius } from '@yulu/ui';
import type { Route } from '@yulu/shared';
import { haversineDistance, formatDistance } from '@yulu/shared';
import { useUIStore } from '../store/ui';
import { useOfflineStore } from '../store/offline';
import { useRouteDetail } from '../hooks/queries';
import { useLocation } from '../hooks/useLocation';
import { RouteMap } from '../components/map/RouteMap';
import type { RouteMapHandle } from '../components/map/RouteMap';
import {
  getWaypoints,
  computeProgress,
  estimateEta,
  formatClock,
  routeTotalMeters,
} from '../utils/navigation';

/** Meters within which a waypoint is considered "reached" (auto-advance). */
const ARRIVAL_THRESHOLD_M = 30;

export function NavigationScreen() {
  const navRouteId = useUIStore((s) => s.navRouteId);
  const setActiveTab = useUIStore((s) => s.setActiveTab);
  const openCreateSpotAt = useUIStore((s) => s.openCreateSpotAt);

  // Resolve the route to navigate: prefer the offline copy (works with no
  // network), otherwise fetch detail; fall back to the first offline route.
  const offlineRoute = useOfflineStore((s) =>
    navRouteId ? s.get(navRouteId) : s.routes[0],
  );
  const detail = useRouteDetail(offlineRoute ? null : navRouteId);
  const route: Route | undefined = offlineRoute ?? detail.data;

  const waypoints = useMemo(() => getWaypoints(route), [route]);
  const totalMeters = routeTotalMeters(waypoints);

  // `currentIndex` is the index of the NEXT waypoint the user is heading to.
  const [currentIndex, setCurrentIndex] = useState(0);
  const mapRef = useRef<RouteMapHandle>(null);

  const { coords } = useLocation(!!route);

  // Distance from the user to the current waypoint (for the turn card + ETA).
  const distToCurrent = useMemo(() => {
    const target = waypoints[currentIndex];
    if (!target || !coords) return null;
    return haversineDistance(coords.latitude, coords.longitude, target.latitude, target.longitude);
  }, [waypoints, currentIndex, coords]);

  // Auto-advance when the user is within the arrival threshold of the current
  // waypoint (and it's not the last one).
  useEffect(() => {
    if (distToCurrent != null && distToCurrent < ARRIVAL_THRESHOLD_M && currentIndex < waypoints.length - 1) {
      setCurrentIndex((i) => Math.min(i + 1, waypoints.length - 1));
    }
  }, [distToCurrent, currentIndex, waypoints.length]);

  const current = waypoints[currentIndex];
  const progress = computeProgress(waypoints, currentIndex, distToCurrent ?? 0);
  const eta = estimateEta(progress.remainingMeters);
  const finished = currentIndex >= waypoints.length - 1 && distToCurrent != null && distToCurrent < ARRIVAL_THRESHOLD_M;

  const endNav = () => {
    Alert.alert('结束导航', '已退出路线导航。', [{ text: '好的', onPress: () => setActiveTab('spots') }]);
  };

  const markSpot = () => {
    const lat = coords?.latitude ?? current?.latitude;
    const lng = coords?.longitude ?? current?.longitude;
    if (lat == null || lng == null) return;
    openCreateSpotAt(lat, lng);
  };

  if (!route || waypoints.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyTitle}>暂无可导航的路线</Text>
        <Text style={styles.emptyHint}>先在「坑点」页下载一条路线，再来这里开始航点引导。</Text>
        <TouchableOpacity style={styles.emptyBtn} onPress={() => setActiveTab('spots')}>
          <Text style={styles.emptyBtnText}>去坑点页</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <RouteMap ref={mapRef} waypoints={waypoints} currentIndex={currentIndex} userCoords={coords} />

      {/* Turn instruction card */}
      <View style={styles.turnCard}>
        <View style={styles.turnIcon}>
          <Text style={{ fontSize: 20 }}>{finished ? '🏁' : '↗'}</Text>
        </View>
        <View style={{ flex: 1 }}>
          {finished ? (
            <Text style={styles.turnText}>已到达终点坑点，路线导航完成！</Text>
          ) : (
            <>
              <Text style={styles.turnDist}>
                {distToCurrent != null ? Math.round(distToCurrent) : '—'}{' '}
                <Text style={styles.turnDistUnit}>m</Text>
              </Text>
              <Text style={styles.turnText} numberOfLines={1}>
                前往 {current?.name}
              </Text>
            </>
          )}
        </View>
      </View>

      {/* ETA bar */}
      <View style={styles.etaBar}>
        {[
          { value: formatClock(eta.arrival), label: '到达时间' },
          { value: `${eta.minutes} min`, label: '剩余时间' },
          { value: formatDistance(progress.remainingMeters), label: '剩余距离' },
          { value: `${currentIndex}/${waypoints.length}`, label: '坑点进度', accent: true },
        ].map((item, i) => (
          <React.Fragment key={item.label}>
            {i > 0 && <View style={styles.etaDivider} />}
            <View style={styles.etaCell}>
              <Text style={[styles.etaValue, item.accent && { color: colors.accent }]}>{item.value}</Text>
              <Text style={styles.etaLabel}>{item.label}</Text>
            </View>
          </React.Fragment>
        ))}
      </View>

      {/* Map controls */}
      <View style={styles.mapControls}>
        <TouchableOpacity style={styles.ctrlBtn} onPress={() => mapRef.current?.zoomBy(1)}>
          <Text style={styles.ctrlBtnText}>+</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.ctrlBtn} onPress={() => mapRef.current?.zoomBy(-1)}>
          <Text style={styles.ctrlBtnText}>−</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.locateBtn}
          onPress={() => coords && mapRef.current?.flyTo([coords.longitude, coords.latitude])}
        >
          <Text style={styles.locateBtnText}>⊕</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom sheet */}
      <View style={styles.bottomSheet}>
        <View style={styles.sheetHandle} />
        <Text style={styles.sheetTitle}>{route.name}</Text>
        <Text style={styles.sheetMeta}>
          共 {route.spots.length} 个坑点 · {formatDistance(totalMeters)} · 上传者：
          {route.uploader?.nickname ?? '钓友'}
        </Text>

        {/* Progress bar */}
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${Math.round(progress.ratio * 100)}%` }]} />
        </View>
        <View style={styles.progressLabels}>
          <Text style={styles.progressLabel}>已走 {formatDistance(progress.doneMeters)}</Text>
          <Text style={styles.progressLabel}>剩余 {formatDistance(progress.remainingMeters)}</Text>
        </View>

        {/* Waypoints */}
        <ScrollView style={styles.waypointList} showsVerticalScrollIndicator={false}>
          {waypoints.map((wp, i) => {
            const status: 'done' | 'current' | 'upcoming' =
              i < currentIndex ? 'done' : i === currentIndex ? 'current' : 'upcoming';
            const rs = route.spots.find((s) => s.spot.id === wp.id)?.spot;
            return (
              <View key={wp.id} style={styles.waypoint}>
                {status === 'done' ? (
                  <View style={styles.wpDone}><Text style={styles.wpDoneIcon}>✓</Text></View>
                ) : status === 'current' ? (
                  <View style={styles.wpCurrent}><Text style={styles.wpCurrentText}>{wp.sortOrder}</Text></View>
                ) : (
                  <View style={styles.wpDefault}><Text style={styles.wpDefaultText}>{wp.sortOrder}</Text></View>
                )}
                <View style={{ flex: 1 }}>
                  <Text style={styles.wpName}>{wp.name}</Text>
                  <Text style={styles.wpDesc} numberOfLines={1}>
                    {rs ? `水深 ${rs.waterDepth ?? '—'} · ${rs.bottomType ?? '—'} · ${(rs.fishSpecies ?? []).join('/')}` : ''}
                  </Text>
                </View>
                {status === 'done' && <Text style={styles.wpDoneLabel}>已完成</Text>}
                {status === 'current' && distToCurrent != null && (
                  <Text style={styles.wpDistCurrent}>{formatDistance(distToCurrent)}</Text>
                )}
                {status === 'upcoming' && <Text style={styles.wpDist}>{formatDistance(wp.cumulative)}</Text>}
              </View>
            );
          })}
        </ScrollView>

        {/* Action buttons */}
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.endNavBtn} onPress={endNav}>
            <Text style={styles.endNavText}>■ 结束导航</Text>
          </TouchableOpacity>
          {!finished && (
            <TouchableOpacity
              style={styles.advanceBtn}
              onPress={() => setCurrentIndex((i) => Math.min(i + 1, waypoints.length - 1))}
            >
              <Text style={styles.advanceBtnText}>到达此坑点</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.markBtn} onPress={markSpot}>
            <Text style={styles.markBtnText}>✎ 标记</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.screenPadding },
  emptyTitle: { fontFamily: 'Georgia', fontSize: fontSize.h2, fontWeight: '600', color: colors.fg },
  emptyHint: { fontSize: fontSize.body, color: colors.muted, textAlign: 'center', marginTop: 8 },
  emptyBtn: {
    marginTop: 20, height: 44, paddingHorizontal: 24, borderRadius: radius.md,
    backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center',
  },
  emptyBtnText: { color: '#fff', fontSize: fontSize.body, fontWeight: '600' },
  turnCard: {
    position: 'absolute', top: 60, left: spacing.screenPadding, right: spacing.screenPadding,
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#fff', borderWidth: 1, borderColor: colors.border,
    borderRadius: 16, padding: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowRadius: 8, shadowOpacity: 0.08,
  },
  turnIcon: {
    width: 40, height: 40, borderRadius: 12, backgroundColor: colors.accentSoft,
    alignItems: 'center', justifyContent: 'center',
  },
  turnDist: { fontFamily: 'Georgia', fontSize: 22, fontWeight: '700', color: colors.fg },
  turnDistUnit: { fontSize: 14, color: colors.muted },
  turnText: { fontSize: 14, fontWeight: '500', color: colors.fg, marginTop: 2 },
  etaBar: {
    position: 'absolute', top: 155, left: spacing.screenPadding, right: spacing.screenPadding,
    flexDirection: 'row', backgroundColor: '#fff', borderWidth: 1, borderColor: colors.border,
    borderRadius: 12, padding: 10,
  },
  etaCell: { flex: 1, alignItems: 'center' },
  etaValue: { fontFamily: 'Georgia', fontSize: 15, fontWeight: '600', color: colors.fg },
  etaLabel: { fontSize: 10, color: colors.muted, marginTop: 2 },
  etaDivider: { width: 1, backgroundColor: colors.border },
  mapControls: {
    position: 'absolute', right: spacing.screenPadding, top: '35%',
    alignItems: 'center', gap: 8,
  },
  ctrlBtn: {
    width: 36, height: 36, borderRadius: 10, backgroundColor: '#fff',
    borderWidth: 1, borderColor: colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  ctrlBtnText: { fontSize: 18, color: colors.fg },
  locateBtn: {
    width: 42, height: 42, borderRadius: 21, backgroundColor: colors.accent,
    alignItems: 'center', justifyContent: 'center', marginTop: 4,
  },
  locateBtnText: { fontSize: 20, color: '#fff' },
  bottomSheet: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 16, paddingTop: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowRadius: 12, shadowOpacity: 0.1,
  },
  sheetHandle: { width: 36, height: 4, borderRadius: 2, backgroundColor: colors.border, alignSelf: 'center', marginBottom: 12 },
  sheetTitle: { fontFamily: 'Georgia', fontSize: 18, fontWeight: '600', color: colors.fg },
  sheetMeta: { fontSize: 12, color: colors.muted, marginTop: 3 },
  progressTrack: { height: 6, borderRadius: 3, backgroundColor: colors.accentSoft, marginTop: 12 },
  progressFill: { height: 6, borderRadius: 3, backgroundColor: colors.accent },
  progressLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  progressLabel: { fontSize: 11, color: colors.muted },
  waypointList: { maxHeight: 200, marginTop: 8 },
  waypoint: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8 },
  wpDone: {
    width: 24, height: 24, borderRadius: 12, backgroundColor: colors.accent,
    alignItems: 'center', justifyContent: 'center',
  },
  wpDoneIcon: { color: '#fff', fontSize: 11, fontWeight: '700' },
  wpCurrent: {
    width: 24, height: 24, borderRadius: 12, backgroundColor: colors.accentSoft,
    borderWidth: 3, borderColor: colors.accent,
    alignItems: 'center', justifyContent: 'center',
  },
  wpCurrentText: { fontSize: 10, fontWeight: '700', color: colors.accent },
  wpDefault: {
    width: 20, height: 20, borderRadius: 10, backgroundColor: '#fff',
    borderWidth: 1.5, borderColor: colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  wpDefaultText: { fontSize: 10, fontWeight: '600', color: colors.muted },
  wpName: { fontSize: 14, fontWeight: '500', color: colors.fg },
  wpDesc: { fontSize: 11, color: colors.muted, marginTop: 1 },
  wpDoneLabel: { fontSize: 11, color: colors.accent, fontWeight: '500' },
  wpDistCurrent: { fontSize: 11, color: colors.accent, fontFamily: 'monospace', fontWeight: '600' },
  wpDist: { fontSize: 11, color: colors.muted, fontFamily: 'monospace' },
  actionRow: { flexDirection: 'row', gap: 10, marginTop: 12 },
  endNavBtn: {
    flex: 1, height: 44, borderRadius: 14, borderWidth: 1.5,
    borderColor: '#c0392b', alignItems: 'center', justifyContent: 'center',
  },
  endNavText: { color: '#c0392b', fontSize: 14, fontWeight: '600' },
  advanceBtn: {
    flex: 1, height: 44, borderRadius: 14, borderWidth: 1.5,
    borderColor: colors.accent, alignItems: 'center', justifyContent: 'center',
  },
  advanceBtnText: { color: colors.accent, fontSize: 13, fontWeight: '600' },
  markBtn: {
    flex: 1, height: 44, borderRadius: 14,
    backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center',
  },
  markBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },
});

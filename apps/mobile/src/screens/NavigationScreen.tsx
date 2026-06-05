import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { colors, spacing, fontSize, radius } from '@yulu/ui';

type WaypointStatus = 'done' | 'current' | 'upcoming';
type Waypoint = { id: number; name: string; desc: string; dist?: string; status: WaypointStatus };

const waypoints: Waypoint[] = [
  { id: 1, name: '碧溪湾东岸深水区', desc: '水深 4-6m · 岩石底 · 鲈鱼', status: 'done' },
  { id: 2, name: '北岸碎石滩', desc: '水深 2-3m · 碎石 · 翘嘴', status: 'done' },
  { id: 3, name: '杨树林浅滩', desc: '水深 1-2m · 水草 · 鲫鱼', dist: '350m', status: 'current' },
  { id: 4, name: '大坝西侧暗礁', desc: '水深 5-8m · 暗礁 · 鲈鱼/鳜鱼', dist: '1.8km', status: 'upcoming' },
];

export function NavigationScreen() {
  return (
    <View style={styles.container}>
      {/* Map placeholder */}
      <View style={styles.mapArea}>
        <View style={styles.mapGrid} />
        {/* Water shapes */}
        <View style={[styles.waterShape, { width: 280, height: 180, top: '30%', left: '8%' }]} />
        <View style={[styles.waterShape, { width: 80, height: 60, top: '55%', right: '15%', opacity: 0.08 }]} />

        {/* Route line placeholder */}
        <View style={styles.routeLine}>
          <View style={styles.routeDone} />
          <View style={styles.routeRemaining} />
        </View>

        {/* User position */}
        <View style={[styles.userPos, { top: '48%', left: '42%' }]}>
          <View style={styles.userDot} />
        </View>

        {/* Pins */}
        <View style={[styles.pin, { top: '47%', left: '33%' }]}>
          <View style={styles.pinDone}><Text style={styles.pinDoneIcon}>✓</Text></View>
        </View>
        <View style={[styles.pin, { top: '40%', left: '50%' }]}>
          <View style={styles.pinDone}><Text style={styles.pinDoneIcon}>✓</Text></View>
        </View>
        <View style={[styles.pin, { top: '35%', left: '60%' }]}>
          <View style={styles.pinCurrent} />
          <Text style={styles.pinCurrentLabel}>杨树林浅滩</Text>
        </View>
        <View style={[styles.pin, { top: '28%', left: '72%' }]}>
          <View style={styles.pinDefault}><Text style={styles.pinDefaultText}>4</Text></View>
        </View>
        <View style={[styles.pin, { top: '22%', left: '82%' }]}>
          <View style={styles.pinDefault}><Text style={styles.pinDefaultText}>5</Text></View>
        </View>
      </View>

      {/* Turn instruction card */}
      <View style={styles.turnCard}>
        <View style={styles.turnIcon}>
          <Text style={{ fontSize: 20 }}>↗</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.turnDist}>350 <Text style={styles.turnDistUnit}>m</Text></Text>
          <Text style={styles.turnText}>沿北岸小路右转，前往杨树林浅滩</Text>
        </View>
      </View>

      {/* ETA bar */}
      <View style={styles.etaBar}>
        {[
          { value: '14:32', label: '到达时间' },
          { value: '23 min', label: '剩余时间' },
          { value: '4.6 km', label: '剩余距离' },
          { value: '3/12', label: '坑点进度', accent: true },
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
        <TouchableOpacity style={styles.ctrlBtn}><Text style={styles.ctrlBtnText}>+</Text></TouchableOpacity>
        <TouchableOpacity style={styles.ctrlBtn}><Text style={styles.ctrlBtnText}>−</Text></TouchableOpacity>
        <TouchableOpacity style={styles.locateBtn}><Text style={styles.locateBtnText}>⊕</Text></TouchableOpacity>
      </View>

      {/* Bottom sheet */}
      <View style={styles.bottomSheet}>
        <View style={styles.sheetHandle} />
        <Text style={styles.sheetTitle}>密云水库北岸环线</Text>
        <Text style={styles.sheetMeta}>共 12 个坑点 · 18.5 km · 上传者：老张</Text>

        {/* Progress bar */}
        <View style={styles.progressTrack}>
          <View style={styles.progressFill} />
        </View>
        <View style={styles.progressLabels}>
          <Text style={styles.progressLabel}>已走 5.2 km</Text>
          <Text style={styles.progressLabel}>剩余 13.3 km</Text>
        </View>

        {/* Waypoints */}
        <ScrollView style={styles.waypointList} showsVerticalScrollIndicator={false}>
          {waypoints.map((wp) => (
            <View key={wp.id} style={styles.waypoint}>
              {wp.status === 'done' ? (
                <View style={styles.wpDone}><Text style={styles.wpDoneIcon}>✓</Text></View>
              ) : wp.status === 'current' ? (
                <View style={styles.wpCurrent}><Text style={styles.wpCurrentText}>{wp.id}</Text></View>
              ) : (
                <View style={styles.wpDefault}><Text style={styles.wpDefaultText}>{wp.id}</Text></View>
              )}
              <View style={{ flex: 1 }}>
                <Text style={styles.wpName}>{wp.name}</Text>
                <Text style={styles.wpDesc} numberOfLines={1}>
                  {wp.desc}{wp.dist ? ` · ` : ''}{wp.dist ?? ''}
                </Text>
              </View>
              {wp.status === 'done' && <Text style={styles.wpDoneLabel}>已完成</Text>}
              {wp.dist != null && wp.status !== ('done' as WaypointStatus) && <Text style={[styles.wpDist, wp.status === 'current' && { color: colors.accent }]}>{wp.dist}</Text>}
            </View>
          ))}
        </ScrollView>

        {/* Action buttons */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.endNavBtn}
            onPress={() => Alert.alert('导航已结束', '返回路线详情。')}
          >
            <Text style={styles.endNavText}>■ 结束导航</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.markBtn}
            onPress={() => Alert.alert('标记坑点', '已标记当前位置为新坑点，可编辑坑点信息后分享。')}
          >
            <Text style={styles.markBtnText}>✎ 标记坑点</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  mapArea: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: '#e8ede8',
  },
  mapGrid: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.15,
    borderColor: colors.border, borderWidth: 1,
  },
  waterShape: {
    position: 'absolute',
    backgroundColor: colors.accent,
    borderRadius: 90,
    opacity: 0.12,
  },
  routeLine: { position: 'absolute', top: '35%', left: '20%', right: '30%', height: 2 },
  routeDone: { position: 'absolute', left: 0, top: 0, width: '45%', height: 2, backgroundColor: colors.muted, opacity: 0.35 },
  routeRemaining: { position: 'absolute', right: 0, top: 0, width: '55%', height: 2, backgroundColor: colors.accent },
  userPos: { position: 'absolute' },
  userDot: {
    width: 18, height: 18, borderRadius: 9,
    backgroundColor: colors.accent, borderWidth: 3, borderColor: '#fff',
    shadowColor: colors.accent, shadowOffset: { width: 0, height: 0 }, shadowRadius: 6, shadowOpacity: 0.3,
  },
  pin: { position: 'absolute', alignItems: 'center' },
  pinDone: {
    width: 24, height: 24, borderRadius: 12, backgroundColor: colors.accent,
    alignItems: 'center', justifyContent: 'center',
  },
  pinDoneIcon: { color: '#fff', fontSize: 12, fontWeight: '700' },
  pinCurrent: {
    width: 30, height: 30, borderRadius: 15, backgroundColor: colors.accentSoft,
    borderWidth: 3, borderColor: colors.accent,
    shadowColor: colors.accent, shadowOffset: { width: 0, height: 0 }, shadowRadius: 8, shadowOpacity: 0.3,
  },
  pinCurrentLabel: {
    fontSize: 10, fontWeight: '600', color: '#fff', backgroundColor: colors.accent,
    paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, marginTop: 2,
  },
  pinDefault: {
    width: 20, height: 20, borderRadius: 10, backgroundColor: '#fff',
    borderWidth: 2, borderColor: colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  pinDefaultText: { fontSize: 10, fontWeight: '600', color: colors.muted },
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
  progressFill: { width: '28%', height: 6, borderRadius: 3, backgroundColor: colors.accent },
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
  wpDist: { fontSize: 11, color: colors.muted, fontFamily: 'monospace' },
  actionRow: { flexDirection: 'row', gap: 10, marginTop: 12 },
  endNavBtn: {
    flex: 1, height: 44, borderRadius: 14, borderWidth: 1.5,
    borderColor: '#c0392b', alignItems: 'center', justifyContent: 'center',
  },
  endNavText: { color: '#c0392b', fontSize: 14, fontWeight: '600' },
  markBtn: {
    flex: 1, height: 44, borderRadius: 14,
    backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center',
  },
  markBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },
});

import React, { useMemo, useRef, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius } from '@yulu/ui';
import type { Spot } from '@yulu/shared';
import { formatDistance } from '@yulu/shared';
import { useNearbySpots, useWeather, useRoutes } from '../hooks/queries';
import { useLocation } from '../hooks/useLocation';
import { useUIStore } from '../store/ui';

const METHODS = [
  { key: 'all', label: '全部' },
  { key: '路亚', label: '路亚' },
  { key: '台钓', label: '台钓' },
  { key: '湖钓', label: '湖钓' },
  { key: '筏钓', label: '筏钓' },
  { key: '溪流', label: '溪流' },
];
const STAR_COLOR = '#b8860b';

type SortKey = 'dist' | 'hot';

/** 风格化地形图（近似原型的水系画风：湖体 + 湖湾 + 支流 + 道路 + 树林）。 */
function TerrainScene() {
  return (
    <View style={terrainStyles.scene}>
      {/* 支流 */}
      <View style={terrainStyles.stream1} />
      <View style={terrainStyles.stream2} />
      {/* 湖泊主体 */}
      <View style={terrainStyles.lake} />
      <View style={terrainStyles.lakeShine} />
      {/* 湖湾细部 */}
      <View style={terrainStyles.bay1} />
      <View style={terrainStyles.bay2} />
      {/* 道路 */}
      <View style={terrainStyles.road1} />
      <View style={terrainStyles.road2} />
      {/* 树林 */}
      {TREES.map(([x, y, r], i) => (
        <View key={i} style={[terrainStyles.tree, { left: `${x}%`, top: `${y}%`, width: r * 2, height: r * 2, borderRadius: r }]} />
      ))}
    </View>
  );
}

const TREES: [number, number, number][] = [
  [9, 61, 3], [12.3, 63, 2.4], [7, 65, 2],
  [84.5, 53, 3], [88, 55, 2.4], [83, 57, 2],
  [38.5, 29, 3], [42, 31, 2.4], [36.5, 32.3, 2],
  [77, 77, 3], [80.5, 79, 2.4], [75, 80.5, 2],
];

const terrainStyles = StyleSheet.create({
  scene: { ...StyleSheet.absoluteFillObject, backgroundColor: '#eef4ef', overflow: 'hidden' },
  stream1: {
    position: 'absolute', left: -30, top: '48%', width: 190, height: 10,
    backgroundColor: '#a9cfc6', borderRadius: 6, transform: [{ rotate: '6deg' }],
  },
  stream2: {
    position: 'absolute', right: -20, top: '38%', width: 120, height: 9,
    backgroundColor: '#a9cfc6', borderRadius: 5, transform: [{ rotate: '32deg' }],
  },
  lake: {
    position: 'absolute', left: '16%', right: '16%', top: '38%', bottom: '26%',
    backgroundColor: '#d5e8e2', borderTopLeftRadius: 120, borderTopRightRadius: 90,
    borderBottomLeftRadius: 110, borderBottomRightRadius: 70,
  },
  lakeShine: {
    position: 'absolute', left: '30%', right: '30%', top: '46%', height: 14,
    backgroundColor: 'rgba(42,143,122,0.16)', borderRadius: 8, transform: [{ rotate: '-4deg' }],
  },
  bay1: {
    position: 'absolute', left: '28%', top: '54%', width: 74, height: 34,
    backgroundColor: '#bfdcd4', borderRadius: 20,
  },
  bay2: {
    position: 'absolute', left: '56%', top: '61%', width: 82, height: 36,
    backgroundColor: '#bfdcd4', borderRadius: 22,
  },
  road1: {
    position: 'absolute', left: -10, right: -10, top: '38.5%', height: 7,
    backgroundColor: '#fff', transform: [{ rotate: '-1.4deg' }],
  },
  road2: {
    position: 'absolute', left: '15%', top: '34%', width: 8, bottom: '2%',
    backgroundColor: '#fff', borderRadius: 4, transform: [{ rotate: '5deg' }],
  },
  tree: { position: 'absolute', backgroundColor: 'rgba(42,143,122,0.24)' },
});

/** 路线叠加层（两条示意路线 + 徽章），可整体隐藏。 */
function RouteOverlay() {
  return (
    <View pointerEvents="none" style={routeStyles.layer}>
      <View style={[routeStyles.line, routeStyles.ring]} />
      <View style={[routeStyles.line, routeStyles.ringInner]} />
      <View style={[routeStyles.line, routeStyles.curve]} />
      <View style={routeStyles.badgeWrap1}>
        <View style={routeStyles.badge}>
          <View style={routeStyles.badgeDot} />
          <Text style={routeStyles.badgeT}>北岸环线 · 12 坑点</Text>
        </View>
      </View>
      <View style={routeStyles.badgeWrap2}>
        <View style={routeStyles.badge}>
          <View style={routeStyles.badgeDot} />
          <Text style={routeStyles.badgeT}>东山半岛 · 8 坑点</Text>
        </View>
      </View>
    </View>
  );
}

const routeStyles = StyleSheet.create({
  layer: { ...StyleSheet.absoluteFillObject },
  line: { position: 'absolute' },
  ring: {
    left: '24%', top: '51%', width: '32%', height: '17%',
    borderWidth: 3.5, borderColor: colors.accent, borderRadius: 60, opacity: 0.85,
    transform: [{ rotate: '-6deg' }],
  },
  ringInner: {
    left: '26%', top: '52.5%', width: '28%', height: '13.5%',
    borderWidth: 1.2, borderColor: 'rgba(255,255,255,0.95)', borderRadius: 50,
    transform: [{ rotate: '-6deg' }],
  },
  curve: {
    right: '14%', top: '39%', width: '12%', height: '12%',
    borderWidth: 3.5, borderColor: colors.accent, opacity: 0.85,
    borderTopLeftRadius: 0, borderTopRightRadius: 90, borderBottomLeftRadius: 30, borderBottomRightRadius: 90,
    transform: [{ rotate: '18deg' }],
  },
  badgeWrap1: { position: 'absolute', left: '18%', top: '46.5%' },
  badgeWrap2: { position: 'absolute', left: '62%', top: '36.5%' },
  badge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.accent,
    borderRadius: 999, paddingHorizontal: 7, paddingVertical: 2,
  },
  badgeDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: colors.accent },
  badgeT: { fontSize: 9, fontWeight: '600', color: colors.accent },
});

/** 用户定位点：核心点 + 循环扩散脉冲（scale+opacity，原生驱动兼容）。 */
function UserPulseDot() {
  const pulse = useRef(new Animated.Value(0)).current;
  React.useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(pulse, { toValue: 1, duration: 2400, useNativeDriver: true }),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);
  const scale = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.27, 1] });
  const opacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.7, 0] });
  return (
    <View style={styles.userDot}>
      <Animated.View
        style={[
          styles.userPulse,
          { transform: [{ translateX: -26 }, { translateY: -26 }, { scale }] },
          { opacity },
        ]}
      />
      <View style={styles.userCore} />
    </View>
  );
}

export function SpotsScreen() {
  const openSearch = useUIStore((s) => s.openSearch);
  const openCreateSpot = useUIStore((s) => s.openCreateSpot);
  const openSpotDetail = useUIStore((s) => s.openSpotDetail);
  const openSpotList = useUIStore((s) => s.openSpotList);
  const openRouteDetail = useUIStore((s) => s.openRouteDetail);
  const spots = useNearbySpots();
  const routes = useRoutes();
  const featuredRoute = routes.data?.find((r) => r.featured) ?? routes.data?.[0];

  const { coords } = useLocation();
  const weather = useWeather(coords?.latitude, coords?.longitude);

  const [method, setMethod] = useState('all');
  const [sort, setSort] = useState<SortKey>('dist');
  const [selected, setSelected] = useState<string | null>(null);
  const [routeOn, setRouteOn] = useState(true);
  const [zoomIdx, setZoomIdx] = useState(0);
  const [located, setLocated] = useState(false);

  const zoomAnim = useRef(new Animated.Value(1)).current;
  const ZOOMS = [1, 1.25, 1.5];
  const railRef = useRef<ScrollView>(null);

  // 图上钓点 = 有示意坐标的（与原型 6 点一致）
  const mapSpots = useMemo(
    () => (spots.data ?? []).filter((s) => s.mapX != null && s.mapY != null),
    [spots.data],
  );
  const visible = useMemo(() => {
    const arr = mapSpots.filter((s) => method === 'all' || s.fishingMethod === method);
    arr.sort((a, b) => (sort === 'dist' ? (a.distance ?? 0) - (b.distance ?? 0) : (b.catchRate7d ?? 0) - (a.catchRate7d ?? 0)));
    return arr;
  }, [mapSpots, method, sort]);

  const setZoom = (idx: number) => {
    const clamped = Math.min(ZOOMS.length - 1, Math.max(0, idx));
    setZoomIdx(clamped);
    Animated.timing(zoomAnim, { toValue: ZOOMS[clamped], duration: 300, useNativeDriver: true }).start();
  };

  const select = (id: string) => {
    const next = selected === id ? null : id;
    setSelected(next);
    if (next) {
      const i = visible.findIndex((s) => s.id === next);
      if (i >= 0) railRef.current?.scrollTo({ x: i * 228, animated: true });
    }
  };

  const w = weather.data;

  return (
    <View style={styles.container}>
      {/* ══ 地图画布 ══ */}
      <View style={styles.mapWrap}>
        <Animated.View
          style={[styles.mapLayer, { transform: [{ scale: zoomAnim }] }]}
        >
          <TerrainScene />
          {routeOn && <RouteOverlay />}

          {/* 用户定位点（脉冲动画） */}
          <UserPulseDot />

          {/* 坑点 pin */}
          {visible.map((s) => {
            const isSel = selected === s.id;
            const hot = (s.catchRate7d ?? 0) >= 60;
            return (
              <TouchableOpacity
                key={s.id}
                style={[styles.pin, { left: `${s.mapX!}%`, top: `${s.mapY!}%` }]}
                onPress={() => select(s.id)}
                activeOpacity={0.85}
              >
                <View style={[styles.pinDot, isSel && styles.pinDotSel, hot && styles.pinDotHot]}>
                  <Text style={[styles.pinCnt, isSel && styles.pinCntSel]}>{s.catchRate7d}</Text>
                </View>
                <View style={[styles.pinLabelWrap, isSel && styles.pinLabelWrapSel]}>
                  <Text style={[styles.pinLabel, isSel && styles.pinLabelSel]} numberOfLines={1}>
                    {s.name.split(' · ').pop()}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </Animated.View>

        {/* 指北针 */}
        <View style={styles.north}>
          <Ionicons name="navigate" size={12} color={colors.muted} />
        </View>

        {/* 顶部浮层：搜索 + 上报 */}
        <View style={styles.topOverlay}>
          <View style={styles.topRow}>
            <TouchableOpacity style={styles.searchPill} onPress={openSearch} activeOpacity={0.8}>
              <Ionicons name="search" size={16} color={colors.muted} />
              <Text style={styles.searchT}>搜索钓点、鱼种、路线</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconFab} onPress={openCreateSpot} activeOpacity={0.8}>
              <Ionicons name="add" size={20} color={colors.fg} />
            </TouchableOpacity>
          </View>
          {w && (
            <View style={styles.condPill}>
              <Ionicons name="sunny-outline" size={13} color={STAR_COLOR} />
              <Text style={styles.condT}>
                {w.condition} {w.temperature}°C · {w.windDirection} {w.windLevel} 级 · {w.fishingAdvice === '宜出钓' ? '宜钓' : w.fishingAdvice}
              </Text>
            </View>
          )}
        </View>

        {/* 钓法筛选 + 路线开关 */}
        <View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
            {METHODS.map((m) => (
              <TouchableOpacity
                key={m.key}
                style={[styles.chip, method === m.key && styles.chipOn]}
                onPress={() => { setMethod(m.key); setSelected(null); }}
                activeOpacity={0.8}
              >
                <Text style={[styles.chipT, method === m.key && styles.chipTOn]}>{m.label}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={[styles.chip, styles.routeChip, routeOn && styles.routeChipOn]}
              onPress={() => setRouteOn((v) => !v)}
              activeOpacity={0.8}
            >
              <Ionicons name="git-branch-outline" size={12} color={routeOn ? '#fff' : colors.fg} />
              <Text style={[styles.chipT, routeOn && styles.chipTOn]}>路线</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* 右侧地图控制 */}
        <View style={styles.mapCtl}>
          <TouchableOpacity style={styles.ctlBtn} onPress={() => setZoom(zoomIdx + 1)} activeOpacity={0.8}>
            <Text style={styles.ctlT}>+</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.ctlBtn} onPress={() => setZoom(zoomIdx - 1)} activeOpacity={0.8}>
            <Text style={styles.ctlT}>−</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.ctlBtn, located && styles.ctlBtnOn]}
            onPress={() => { setLocated(true); setZoom(0); }}
            activeOpacity={0.8}
          >
            <Ionicons name="locate" size={16} color={located ? colors.accent : colors.fg} />
          </TouchableOpacity>
        </View>

        {/* ══ 底部抽屉 ══ */}
        <View style={styles.sheet}>
          <View style={styles.sheetHandle} />
          <View style={styles.sheetHead}>
            <Text style={styles.sheetTitle}>
              附近坑点 <Text style={styles.sheetCount}>共 {visible.length} 个</Text>
            </Text>
            <View style={styles.sheetRight}>
              <View style={styles.sortGroup}>
                <TouchableOpacity
                  style={[styles.sortBtn, sort === 'dist' && styles.sortBtnOn]}
                  onPress={() => setSort('dist')}
                >
                  <Text style={[styles.sortT, sort === 'dist' && styles.sortTOn]}>距离</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.sortBtn, sort === 'hot' && styles.sortBtnOn]}
                  onPress={() => setSort('hot')}
                >
                  <Text style={[styles.sortT, sort === 'hot' && styles.sortTOn]}>热度</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity style={styles.listLink} onPress={openSpotList} activeOpacity={0.7}>
                <Text style={styles.listLinkT}>列表</Text>
                <Ionicons name="chevron-forward" size={12} color={colors.accent} />
              </TouchableOpacity>
            </View>
          </View>

          {/* 精选路线详情卡（坑点路线详情） */}
          {featuredRoute && (
            <TouchableOpacity
              style={styles.routeCard}
              onPress={() => openRouteDetail(featuredRoute.id)}
              activeOpacity={0.85}
            >
              <View style={styles.routeIcon}>
                <Ionicons name="layers-outline" size={20} color={colors.accent} />
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <View style={styles.routeTitleRow}>
                  <Text style={styles.routeTitle} numberOfLines={1}>{featuredRoute.name}</Text>
                  {featuredRoute.featured && (
                    <View style={styles.routePill}><Text style={styles.routePillT}>精选路线</Text></View>
                  )}
                </View>
                <Text style={styles.routeMeta}>
                  📍 {featuredRoute.spots.length || (featuredRoute.sequence?.length ?? 0)} 坑点 · ⚡ {featuredRoute.totalDistance ?? '-'}km · 👁 {featuredRoute.downloadsCount.toLocaleString()} 次下载
                </Text>
                {featuredRoute.description ? (
                  <Text style={styles.routeDesc} numberOfLines={1}>{featuredRoute.description}</Text>
                ) : null}
              </View>
              <View style={styles.routeGo}>
                <Ionicons name="download-outline" size={13} color={colors.accent} />
                <Text style={styles.routeGoT}>详情</Text>
              </View>
            </TouchableOpacity>
          )}

          <ScrollView
            ref={railRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.rail}
          >
            {visible.length === 0 && (
              <Text style={styles.railEmpty}>该钓法附近暂无坑点，换个筛选试试</Text>
            )}
            {visible.map((s) => (
              <TouchableOpacity
                key={s.id}
                style={[styles.spotCard, selected === s.id && styles.spotCardSel]}
                onPress={() => openSpotDetail(s.id)}
                activeOpacity={0.85}
              >
                <View style={styles.scHead}>
                  <Text style={styles.scName} numberOfLines={1}>{s.name}</Text>
                  {s.rating != null && (
                    <View style={styles.scRate}>
                      <Ionicons name="star" size={11} color={STAR_COLOR} />
                      <Text style={styles.scRateT}>{s.rating.toFixed(1)}</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.scMeta}>
                  {s.bottomType ?? ''} · {s.waterDepth ?? ''}{'\n'}
                  {s.fishSpecies.join(' · ')} · {s.distance != null ? formatDistance(s.distance) : ''}
                </Text>
                <View style={styles.scFoot}>
                  <View style={styles.scCatch}>
                    <Text style={styles.scCatchN}>{s.catchRate7d}</Text>
                    <Text style={styles.scCatchL}>尾 / 近7天</Text>
                  </View>
                  <View style={styles.scGo}>
                    <Text style={styles.scGoT}>详情</Text>
                    <Ionicons name="chevron-forward" size={11} color={colors.accent} />
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  mapWrap: { flex: 1, overflow: 'hidden' },
  mapLayer: { ...StyleSheet.absoluteFillObject, transformOrigin: '50% 42%' },

  /* pins */
  pin: { position: 'absolute', transform: [{ translateX: -13 }, { translateY: -13 }], alignItems: 'center', zIndex: 5 },
  pinDot: {
    width: 26, height: 26, borderRadius: 13, backgroundColor: colors.fg,
    borderWidth: 3, borderColor: colors.surface,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOpacity: 0.22, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }, elevation: 3,
  },
  pinDotSel: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: colors.accent,
    shadowColor: colors.accent, shadowOpacity: 0.55, shadowRadius: 6,
  },
  pinDotHot: { /* gold badge via absolute dot below */ },
  pinCnt: { color: '#fff', fontSize: 10, fontWeight: '700' },
  pinCntSel: {},
  pinLabelWrap: {
    marginTop: 3, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
    paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6,
    shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 2, shadowOffset: { width: 0, height: 1 }, elevation: 2,
  },
  pinLabelWrapSel: { borderColor: colors.accent },
  pinLabel: { fontSize: 10, fontWeight: '600', color: colors.fg },
  pinLabelSel: { color: colors.accent },

  /* user dot */
  userDot: { position: 'absolute', left: '46%', top: '44%', width: 14, height: 14, zIndex: 4 },
  userPulse: {
    position: 'absolute', left: 26, top: 26, width: 52, height: 52, borderRadius: 26,
    backgroundColor: 'rgba(42,143,122,0.35)',
  },
  userCore: {
    width: 14, height: 14, borderRadius: 7, backgroundColor: colors.accent,
    borderWidth: 3, borderColor: colors.surface,
  },

  /* north + top overlay */
  north: {
    position: 'absolute', top: 12, right: 14, width: 30, height: 30, borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.86)', borderWidth: 1, borderColor: colors.border,
    alignItems: 'center', justifyContent: 'center', zIndex: 10,
  },
  topOverlay: { position: 'absolute', top: 8, left: 0, right: 0, paddingHorizontal: 16, gap: 8, zIndex: 20 },
  topRow: { flexDirection: 'row', gap: 8 },
  searchPill: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, height: 40, paddingHorizontal: 14,
    backgroundColor: 'rgba(255,255,255,0.86)', borderWidth: 1, borderColor: colors.border, borderRadius: 999,
  },
  searchT: { fontSize: 14, color: colors.muted },
  iconFab: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.86)', borderWidth: 1, borderColor: colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  condPill: {
    alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 12, paddingVertical: 5, borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.86)', borderWidth: 1, borderColor: colors.border,
  },
  condT: { fontSize: 11, color: colors.fg },

  /* chips */
  chipRow: { gap: 6, paddingHorizontal: 16, position: 'absolute', top: 108, left: 0, right: 0, zIndex: 20 },
  chip: {
    paddingHorizontal: 13, paddingVertical: 6, borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.86)', borderWidth: 1, borderColor: colors.border,
    flexDirection: 'row', alignItems: 'center', gap: 5,
  },
  chipOn: { backgroundColor: colors.fg, borderColor: colors.fg },
  chipT: { fontSize: 12, fontWeight: '500', color: colors.fg },
  chipTOn: { color: '#fff' },
  routeChip: {},
  routeChipOn: { backgroundColor: colors.accent, borderColor: colors.accent },

  /* map ctl */
  mapCtl: { position: 'absolute', right: 12, top: 210, gap: 6, zIndex: 20 },
  ctlBtn: {
    width: 36, height: 36, borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.86)', borderWidth: 1, borderColor: colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  ctlBtnOn: { borderColor: colors.accent },
  ctlT: { fontSize: 16, fontWeight: '600', color: colors.fg, lineHeight: 18 },

  /* sheet */
  sheet: {
    position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 25,
    backgroundColor: colors.surface, borderTopLeftRadius: 22, borderTopRightRadius: 22,
    borderWidth: 1, borderColor: colors.border,
    paddingTop: 8, paddingBottom: 10, gap: 10,
    shadowColor: '#000', shadowOpacity: 0.18, shadowRadius: 12, shadowOffset: { width: 0, height: -6 }, elevation: 8,
  },
  sheetHandle: { width: 36, height: 4, borderRadius: 999, backgroundColor: colors.border, alignSelf: 'center' },
  sheetHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16 },
  sheetTitle: { fontSize: 17, fontWeight: '600', color: colors.fg, fontFamily: 'Georgia', letterSpacing: -0.2 },
  sheetCount: { fontSize: 12, color: colors.muted, fontFamily: undefined },
  sheetRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  sortGroup: { flexDirection: 'row', backgroundColor: 'rgba(26,36,32,0.06)', borderRadius: 999, padding: 2 },
  sortBtn: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  sortBtnOn: { backgroundColor: colors.surface, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 2, shadowOffset: { width: 0, height: 1 }, elevation: 2 },
  sortT: { fontSize: 11, color: colors.muted },
  sortTOn: { color: colors.fg, fontWeight: '600' },
  listLink: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  listLinkT: { fontSize: 12, color: colors.accent, fontWeight: '500' },

  /* featured route card */
  routeCard: {
    flexDirection: 'row', alignItems: 'center', gap: 10, marginHorizontal: 16,
    padding: 12, borderRadius: 14, backgroundColor: colors.bg,
    borderWidth: 1, borderColor: colors.border,
  },
  routeIcon: {
    width: 44, height: 44, borderRadius: radius.md, backgroundColor: colors.accentSoft,
    alignItems: 'center', justifyContent: 'center',
  },
  routeTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  routeTitle: { flex: 1, fontSize: 14, fontWeight: '600', color: colors.fg },
  routePill: { backgroundColor: colors.accentSoft, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999 },
  routePillT: { fontSize: 10, color: colors.accent, fontWeight: '600' },
  routeMeta: { fontSize: 11, color: colors.muted, marginTop: 3 },
  routeDesc: { fontSize: 11, color: colors.muted, marginTop: 2 },
  routeGo: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999, backgroundColor: colors.accentSoft,
  },
  routeGoT: { fontSize: 12, fontWeight: '600', color: colors.accent },

  /* rail */
  rail: { gap: 10, paddingHorizontal: 16 },
  railEmpty: { paddingHorizontal: 16, paddingVertical: 18, color: colors.muted, fontSize: 13 },
  spotCard: {
    width: 218, gap: 8, padding: 12, borderRadius: 14,
    backgroundColor: colors.bg, borderWidth: 1, borderColor: colors.border,
  },
  spotCardSel: { borderColor: colors.accent, borderWidth: 1.5 },
  scHead: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 6 },
  scName: { flex: 1, fontSize: 14, fontWeight: '600', color: colors.fg, lineHeight: 18 },
  scRate: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  scRateT: { fontSize: 11, color: STAR_COLOR, fontWeight: '600' },
  scMeta: { fontSize: 11, color: colors.muted, lineHeight: 17 },
  scFoot: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 2 },
  scCatch: { flexDirection: 'row', alignItems: 'baseline', gap: 3 },
  scCatchN: { fontSize: 12, fontWeight: '600', color: colors.accent },
  scCatchL: { fontSize: 9, color: colors.muted },
  scGo: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, backgroundColor: colors.accentSoft,
  },
  scGoT: { fontSize: 11, fontWeight: '600', color: colors.accent },
});

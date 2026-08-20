import React, { useMemo, useRef, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius } from '@yulu/ui';
import type { Route, RouteReview } from '@yulu/shared';
import { formatRelativeTime } from '@yulu/shared';
import { useUIStore } from '../store/ui';
import { useDownloadRoute } from '../hooks/queries';
import { useOfflineStore } from '../store/offline';
import { USE_MOCK } from '../config';
import { mockRouteReviews } from '../mock/data';

type DetailTab = 'overview' | 'sequence' | 'reviews';
const STAR_COLOR = '#e8a33d';

/** Stylized map-hero: land base, lake, route track with numbered nodes. */
function MapHeroScene({ nodeCount }: { nodeCount: number }) {
  const nodes = Math.max(3, Math.min(6, nodeCount));
  return (
    <View style={heroStyles.scene}>
      <View style={heroStyles.land} />
      <View style={heroStyles.lake} />
      <View style={heroStyles.road} />
      {/* route track */}
      <View style={heroStyles.track} />
      <View style={heroStyles.trackDash} />
      {/* numbered nodes */}
      {Array.from({ length: nodes }, (_, i) => {
        const pos = TRACK_NODES[nodes - 3]?.[i] ?? [40 + i * 60, 200 - i * 24];
        return (
          <View
            key={i}
            style={[
              heroStyles.node,
              i === 0 && heroStyles.nodeStart,
              i === nodes - 1 && heroStyles.nodeEnd,
              { left: pos[0] - 16, top: pos[1] - 16 },
            ]}
          >
            <Text style={[heroStyles.nodeT, i === nodes - 1 && heroStyles.nodeTEnd]}>
              {i === 0 ? 'S' : i === nodes - 1 ? 'E' : String(i)}
            </Text>
          </View>
        );
      })}
      {/* north badge */}
      <View style={heroStyles.north}>
        <Ionicons name="navigate" size={12} color={colors.fg} />
      </View>
    </View>
  );
}

/** Node positions (percent-independent px in 390x300 space) by node count. */
const TRACK_NODES: Record<number, [number, number][]> = {
  3: [[60, 232], [180, 170], [250, 92]],
  4: [[60, 232], [150, 195], [245, 150], [195, 66]],
  5: [[60, 232], [150, 195], [215, 183], [245, 150], [195, 66]],
  6: [[60, 232], [150, 195], [215, 183], [245, 150], [250, 92], [195, 66]],
};

const heroStyles = StyleSheet.create({
  scene: { ...StyleSheet.absoluteFillObject, backgroundColor: '#dfeade', overflow: 'hidden' },
  land: { ...StyleSheet.absoluteFillObject, backgroundColor: '#dbe8dd' },
  lake: {
    position: 'absolute', left: 60, right: 60, top: 40, bottom: 60,
    backgroundColor: '#93c0cd', borderTopLeftRadius: 90, borderTopRightRadius: 130, borderBottomLeftRadius: 120, borderBottomRightRadius: 80,
  },
  road: {
    position: 'absolute', left: -10, right: -10, top: 244, height: 8,
    backgroundColor: '#e6d9a8', transform: [{ rotate: '-2deg' }],
  },
  track: {
    position: 'absolute', left: 40, top: 110, right: 100, bottom: 60,
    borderColor: colors.accent, borderWidth: 5, borderRadius: 70,
    transform: [{ rotate: '-8deg' }],
  },
  trackDash: {
    position: 'absolute', left: 40, top: 110, right: 100, bottom: 60,
    borderColor: 'rgba(255,255,255,0.85)', borderWidth: 1.5, borderRadius: 70,
    borderStyle: 'dashed', transform: [{ rotate: '-8deg' }],
  },
  node: {
    position: 'absolute', width: 32, height: 32, borderRadius: 16,
    backgroundColor: '#fff', borderWidth: 3, borderColor: colors.accent,
    alignItems: 'center', justifyContent: 'center',
  },
  nodeStart: { borderColor: colors.muted },
  nodeEnd: { backgroundColor: colors.accent },
  nodeT: { fontSize: 13, fontWeight: '700', color: colors.fg },
  nodeTEnd: { color: '#fff' },
  north: {
    position: 'absolute', right: 14, top: 12, width: 28, height: 28, borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.92)', borderWidth: 1, borderColor: colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
});

interface Props {
  route: Route;
}

export function RouteDetailScreen({ route }: Props) {
  const [tab, setTab] = useState<DetailTab>('overview');
  const [followed, setFollowed] = useState(false);
  const close = useUIStore((s) => s.closeOverlay);
  const openUser = useUIStore((s) => s.openUser);
  const openNavigation = useUIStore((s) => s.openNavigation);
  const download = useDownloadRoute();
  const alreadyDownloaded = useOfflineStore((s) => s.has(route.id));
  const scrollRef = useRef<ScrollView>(null);

  const reviews = useMemo(
    () => (USE_MOCK ? mockRouteReviews.filter((r) => r.routeId === route.id) : []),
    [route.id],
  );
  // download progress: 0 idle, -1 done
  const [progress, setProgress] = useState<number>(alreadyDownloaded ? -1 : 0);
  const progressTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const seqCount = route.sequence?.length ?? route.spots.length;

  const startDownload = () => {
    if (progress !== 0) return;
    download.mutate({ id: route.id, stub: route }, { onSuccess: () => {} });
    let p = 0;
    progressTimer.current = setInterval(() => {
      p = Math.min(100, p + 12 + Math.round(Math.random() * 10));
      setProgress(p);
      if (p >= 100) {
        if (progressTimer.current) clearInterval(progressTimer.current);
        setProgress(-1);
      }
    }, 160);
  };

  const tabs: { key: DetailTab; label: string; count?: number }[] = [
    { key: 'overview', label: '概览' },
    { key: 'sequence', label: '坑点序列', count: seqCount },
    { key: 'reviews', label: '评价', count: route.ratingCount },
  ];

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 16 }}
      >
        {/* ══ Map hero ══ */}
        <View style={styles.hero}>
          <MapHeroScene nodeCount={seqCount} />
          <View style={styles.heroShade} />
          <View style={styles.navRow}>
            <TouchableOpacity style={styles.floatBtn} onPress={close} activeOpacity={0.8}>
              <Ionicons name="chevron-back" size={20} color={colors.fg} />
            </TouchableOpacity>
            <View style={styles.navGroup}>
              <TouchableOpacity style={styles.floatBtn} onPress={close} activeOpacity={0.8}>
                <Ionicons name="star-outline" size={17} color={colors.fg} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.floatBtn} onPress={close} activeOpacity={0.8}>
                <Ionicons name="share-social-outline" size={16} color={colors.fg} />
              </TouchableOpacity>
            </View>
          </View>
          {route.region && (
            <View style={styles.mapBadge}>
              <Ionicons name="location-outline" size={11} color={colors.accent} />
              <Text style={styles.mapBadgeT}>{route.region}</Text>
            </View>
          )}
        </View>

        {/* ══ Title card (overlapping map) ══ */}
        <View style={styles.titleCard}>
          <View style={styles.rcTags}>
            {(route.routeTags ?? route.tags.slice(0, 3).map((t): { label: string; plain?: boolean } => ({ label: t }))).map((t, i) => (
              <View key={i} style={[styles.rcTag, t.plain && styles.rcTagPlain]}>
                <Text style={[styles.rcTagT, t.plain && styles.rcTagTPlain]}>{t.label}</Text>
              </View>
            ))}
          </View>
          <Text style={styles.title}>{route.name}</Text>
          {route.startEnd && (
            <View style={styles.rcLoc}>
              <Ionicons name="location-outline" size={12} color={colors.muted} />
              <Text style={styles.rcLocT}>{route.startEnd}</Text>
            </View>
          )}
        </View>

        {/* ══ Stats ══ */}
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statV}>{route.spots.length || seqCount}</Text>
            <Text style={styles.statL}>坑点数</Text>
          </View>
          <View style={[styles.stat, styles.statBorder]}>
            <Text style={styles.statV}>{route.totalDistance != null ? `${route.totalDistance}km` : '—'}</Text>
            <Text style={styles.statL}>总里程</Text>
          </View>
          <View style={[styles.stat, styles.statBorder]}>
            <Text style={styles.statV}>{route.durationHours != null ? `${route.durationHours}h` : '—'}</Text>
            <Text style={styles.statL}>预计用时</Text>
          </View>
          <View style={[styles.stat, styles.statBorder]}>
            <Text style={styles.statV}>{route.elevationGain != null ? `${route.elevationGain}m` : '—'}</Text>
            <Text style={styles.statL}>累计爬升</Text>
          </View>
        </View>

        {/* ══ Author ══ */}
        <TouchableOpacity style={styles.authorCard} onPress={() => route.uploader && openUser(route.uploader.id)} activeOpacity={0.8}>
          <View style={styles.avatar} />
          <View style={{ flex: 1 }}>
            <View style={styles.auNameRow}>
              <Text style={styles.auName}>{route.uploader?.nickname ?? '—'}</Text>
              {route.authorBadge && (
                <View style={styles.auBadge}><Text style={styles.auBadgeT}>{route.authorBadge}</Text></View>
              )}
            </View>
            <Text style={styles.auMeta}>
              分享路线 {route.authorShares ?? '—'} 条 · 被下载 {(route.authorDownloads ?? route.downloadsCount).toLocaleString()} 次
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.auFollow, followed && styles.auFollowOn]}
            onPress={() => setFollowed((v) => !v)}
            activeOpacity={0.7}
          >
            <Text style={[styles.auFollowT, followed && styles.auFollowTOn]}>{followed ? '已关注' : '+ 关注'}</Text>
          </TouchableOpacity>
        </TouchableOpacity>

        {/* ══ Tabs ══ */}
        <View style={styles.seg}>
          {tabs.map((t) => (
            <TouchableOpacity
              key={t.key}
              style={[styles.segBtn, tab === t.key && styles.segBtnOn]}
              onPress={() => { setTab(t.key); scrollRef.current?.scrollTo({ y: 0, animated: false }); }}
              activeOpacity={0.8}
            >
              <Text style={[styles.segBtnT, tab === t.key && styles.segBtnTOn]}>
                {t.label}{t.count != null && t.count > 0 ? ` ${t.count}` : ''}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ══ Panes ══ */}
        {tab === 'overview' && (
          <View style={styles.pad}>
            <Text style={styles.sectionLabel}>路线信息</Text>
            <View style={styles.card}>
              {(route.info ?? []).map((row) => (
                <View key={row.label} style={styles.kvRow}>
                  <Text style={styles.kvK}>{row.label}</Text>
                  <Text style={styles.kvV}>{row.value}</Text>
                </View>
              ))}
              <View style={styles.tagsWrap}>
                {route.tags.map((tag) => (
                  <View key={tag} style={styles.tag}><Text style={styles.tagT}>{tag}</Text></View>
                ))}
              </View>
              {route.warning && <Text style={styles.warnNote}>⚠ {route.warning}</Text>}
            </View>

            {route.elevation && route.elevation.length > 1 && (
              <>
                <Text style={styles.sectionLabel}>海拔剖面</Text>
                <View style={[styles.card, styles.chartCard]}>
                  <View style={styles.elevRow}>
                    {route.elevation.map((m, i) => {
                      const min = Math.min(...route.elevation!);
                      const max = Math.max(...route.elevation!);
                      const h = 10 + ((m - min) / Math.max(1, max - min)) * 78;
                      return (
                        <View key={i} style={[styles.elevBar, { height: h }, i === route.elevation!.indexOf(max) && styles.elevPeak]} />
                      );
                    })}
                  </View>
                  <Text style={styles.elevNote}>{route.elevationNote ?? ''}</Text>
                </View>
              </>
            )}

            {(route.supplyInfo?.length ?? 0) > 0 && (
              <>
                <Text style={styles.sectionLabel}>补给与安全</Text>
                <View style={styles.card}>
                  {route.supplyInfo!.map((row) => (
                    <View key={row.label} style={styles.kvRow}>
                      <Text style={styles.kvK}>{row.label}</Text>
                      <Text style={styles.kvV}>{row.value}</Text>
                    </View>
                  ))}
                </View>
              </>
            )}
          </View>
        )}

        {tab === 'sequence' && (
          <View style={styles.pad}>
            <Text style={styles.sectionLabel}>顺时针巡钓顺序</Text>
            <View style={styles.card}>
              {(route.sequence ?? []).map((node, i, arr) => (
                <View key={i} style={styles.seqItem}>
                  <View
                    style={[
                      styles.seqDot,
                      node.kind === 'start' && styles.seqDotStart,
                      node.kind === 'end' && styles.seqDotEnd,
                    ]}
                  >
                    <Text style={[styles.seqDotT, node.kind === 'start' && styles.seqDotTStart, node.kind === 'end' && styles.seqDotTEnd]}>
                      {node.kind === 'start' ? 'S' : node.kind === 'end' ? 'E' : String(i)}
                    </Text>
                  </View>
                  {i < arr.length - 1 && <View style={[styles.seqLine, { top: 42 }]} />}
                  <View style={{ flex: 1, paddingBottom: 16 }}>
                    <View style={styles.seqNameRow}>
                      <Text style={styles.seqName}>{node.title}</Text>
                      {node.tag && <View style={styles.seqTag}><Text style={styles.seqTagT}>{node.tag}</Text></View>}
                    </View>
                    <Text style={styles.seqDesc}>{node.desc}</Text>
                    <Text style={styles.seqDist}>{node.dist}</Text>
                  </View>
                </View>
              ))}
              {(route.sequence?.length ?? 0) === 0 && (
                <Text style={styles.empty}>该路线暂无坑点序列数据</Text>
              )}
            </View>
            <Text style={styles.metaCenter}>
              — 显示 1–{(route.sequence?.length ?? 0)} / 共 {route.spots.length || seqCount} 个节点 · 下载后查看完整序列 —
            </Text>
          </View>
        )}

        {tab === 'reviews' && (
          <View style={styles.pad}>
            <Text style={styles.sectionLabel}>钓友评价</Text>
            <View style={styles.card}>
              <View style={styles.reviewScore}>
                <View>
                  <Text style={styles.scoreNum}>{route.rating?.toFixed(1) ?? '—'}</Text>
                  <View style={styles.stars}>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Ionicons key={n} name="star" size={12} color={n <= Math.round(route.rating ?? 0) ? STAR_COLOR : colors.border} />
                    ))}
                  </View>
                  <Text style={styles.scoreSub}>{route.ratingCount} 条评价</Text>
                </View>
                <View style={styles.bars}>
                  {ratingDist(reviews, route.ratingCount ?? 0).map((pct, n) => (
                    <View key={n} style={styles.brow}>
                      <Text style={styles.bl2}>{5 - n}</Text>
                      <View style={styles.btrack}><View style={[styles.bfill, { width: `${pct}%` }]} /></View>
                    </View>
                  ))}
                </View>
              </View>
              {reviews.map((rv: RouteReview, i) => (
                <View key={rv.id} style={[styles.reviewItem, i > 0 && styles.itemBorder]}>
                  <View style={styles.rvHead}>
                    <View style={styles.avatarSm} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.rvName}>{rv.user.nickname}</Text>
                      <View style={[styles.stars, { marginTop: 2 }]}>
                        {[1, 2, 3, 4, 5].map((n) => (
                          <Ionicons key={n} name="star" size={12} color={n <= rv.rating ? STAR_COLOR : colors.border} />
                        ))}
                      </View>
                    </View>
                    <Text style={styles.rvTime}>{formatRelativeTime(rv.createdAt)}</Text>
                  </View>
                  <Text style={styles.rvText}>{rv.text}</Text>
                  {rv.tags && (
                    <View style={styles.rvTags}>
                      {rv.tags.map((tg) => (
                        <View key={tg} style={styles.rvTag}><Text style={styles.rvTagT}>{tg}</Text></View>
                      ))}
                    </View>
                  )}
                </View>
              ))}
              {reviews.length === 0 && <Text style={styles.empty}>暂无评价</Text>}
            </View>
            <Text style={styles.metaCenter}>— 显示前 3 条 · 查看全部 {route.ratingCount ?? 0} 条 →</Text>
          </View>
        )}
      </ScrollView>

      {/* ══ Bottom action bar ══ */}
      <View style={styles.actionbar}>
        <TouchableOpacity style={styles.actIcon} onPress={close} activeOpacity={0.7}>
          <Ionicons name="star-outline" size={22} color={colors.muted} />
          <Text style={styles.actIconT}>收藏</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actIcon} onPress={() => openNavigation(route.id)} activeOpacity={0.7}>
          <Ionicons name="map-outline" size={22} color={colors.muted} />
          <Text style={styles.actIconT}>地图</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.cta, progress > 0 && progress < 100 && styles.ctaBusy, progress === -1 && styles.ctaDone]}
          onPress={progress === -1 ? () => openNavigation(route.id) : startDownload}
          activeOpacity={0.85}
        >
          {progress === -1 ? (
            <>
              <Ionicons name="checkmark" size={17} color="#fff" />
              <Text style={styles.ctaT}>已下载 · 开始导航</Text>
            </>
          ) : progress > 0 ? (
            <>
              <View style={[styles.ctaFill, { width: `${progress}%` }]} />
              <Text style={styles.ctaT}>正在下载 {progress}% · {Math.round((route.offlineMb ?? 24) * progress / 100)}/{route.offlineMb ?? 24}MB</Text>
            </>
          ) : (
            <>
              <Ionicons name="download-outline" size={17} color="#fff" />
              <Text style={styles.ctaT}>下载离线路线 · {route.offlineMb ?? 24}MB</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

/** 5→1 star distribution (falls back to a plausible curve). */
function ratingDist(reviews: RouteReview[], total: number): number[] {
  if (!reviews.length || !total) return [68, 22, 7, 2, 1];
  const counts = [0, 0, 0, 0, 0];
  reviews.forEach((r) => {
    const idx = 5 - Math.min(5, Math.max(1, r.rating));
    counts[idx] += 1;
  });
  return counts.map((c) => Math.round((c / total) * 100));
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  pad: { paddingHorizontal: spacing.screenPadding },

  /* hero */
  hero: { height: 300, overflow: 'hidden' },
  heroShade: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(10,18,15,0.12)' },
  navRow: { position: 'absolute', top: 48, left: 20, right: 20, flexDirection: 'row', justifyContent: 'space-between', zIndex: 10 },
  navGroup: { flexDirection: 'row', gap: 10 },
  floatBtn: {
    width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.9)',
    borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center',
  },
  mapBadge: {
    position: 'absolute', right: 14, top: 110, zIndex: 10, flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'rgba(255,255,255,0.92)', borderWidth: 1, borderColor: colors.border,
    paddingHorizontal: 11, paddingVertical: 6, borderRadius: 10,
  },
  mapBadgeT: { fontSize: 10, color: colors.fg, letterSpacing: 0.5 },

  /* title card */
  titleCard: {
    marginHorizontal: spacing.screenPadding, marginTop: -44, zIndex: 5,
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.lg, padding: 16,
  },
  rcTags: { flexDirection: 'row', gap: 6, marginBottom: 7, flexWrap: 'wrap' },
  rcTag: { backgroundColor: colors.accentSoft, paddingHorizontal: 9, paddingVertical: 3, borderRadius: 999 },
  rcTagT: { color: colors.accent, fontSize: 10, letterSpacing: 0.5 },
  rcTagPlain: { backgroundColor: 'rgba(26,36,32,0.06)' },
  rcTagTPlain: { color: colors.muted },
  title: { fontSize: 24, fontWeight: '700', color: colors.fg, letterSpacing: -0.4, marginBottom: 8, fontFamily: 'Georgia' },
  rcLoc: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  rcLocT: { fontSize: 12, color: colors.muted, flex: 1 },

  /* stats */
  statsRow: {
    flexDirection: 'row', marginHorizontal: spacing.screenPadding, marginTop: 12,
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 16, overflow: 'hidden',
  },
  stat: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  statBorder: { borderLeftWidth: 1, borderColor: colors.border },
  statV: { fontSize: 15, fontWeight: '600', color: colors.fg },
  statL: { fontSize: 11, color: colors.muted, marginTop: 2 },

  /* author */
  authorCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12, marginHorizontal: spacing.screenPadding, marginTop: 12,
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 16, padding: 12,
  },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.accentSoft, borderWidth: 1, borderColor: colors.border },
  auNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  auName: { fontSize: 14, fontWeight: '600', color: colors.fg },
  auBadge: { backgroundColor: colors.accentSoft, paddingHorizontal: 7, paddingVertical: 2, borderRadius: 5 },
  auBadgeT: { fontSize: 9, color: colors.accent, letterSpacing: 0.5 },
  auMeta: { fontSize: 12, color: colors.muted, marginTop: 2 },
  auFollow: {
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 999,
    borderWidth: 1, borderColor: colors.accent,
  },
  auFollowT: { color: colors.accent, fontSize: 12, fontWeight: '600' },
  auFollowOn: { borderColor: colors.border, backgroundColor: 'rgba(26,36,32,0.06)' },
  auFollowTOn: { color: colors.muted },

  /* seg */
  seg: { flexDirection: 'row', marginHorizontal: spacing.screenPadding, marginTop: 18, backgroundColor: 'rgba(26,36,32,0.06)', borderRadius: 12, padding: 3 },
  segBtn: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 10 },
  segBtnOn: { backgroundColor: colors.surface },
  segBtnT: { fontSize: 13, fontWeight: '500', color: colors.muted },
  segBtnTOn: { color: colors.fg, fontWeight: '600' },

  /* shared */
  sectionLabel: { fontSize: 16, fontWeight: '600', color: colors.fg, marginTop: 18, marginBottom: 10, letterSpacing: -0.2 },
  card: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, padding: 16 },
  kvRow: { flexDirection: 'row', marginBottom: 9 },
  kvK: { width: 86, fontSize: 13, color: colors.muted },
  kvV: { flex: 1, fontSize: 13, color: colors.fg },
  tagsWrap: { flexDirection: 'row', gap: 6, flexWrap: 'wrap', marginTop: 12 },
  tag: { paddingHorizontal: 9, paddingVertical: 3, borderWidth: 1, borderColor: colors.border, borderRadius: 999 },
  tagT: { fontSize: 11, color: colors.muted },
  warnNote: { fontSize: 12, color: colors.muted, marginTop: 12, lineHeight: 18 },
  empty: { fontSize: 13, color: colors.muted, textAlign: 'center', paddingVertical: 20 },
  metaCenter: { fontSize: 11, color: colors.muted, textAlign: 'center', paddingVertical: 12 },
  itemBorder: { borderTopWidth: 1, borderTopColor: colors.border },

  /* elevation */
  chartCard: { padding: 14 },
  elevRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 3, height: 92 },
  elevBar: { flex: 1, borderRadius: 3, backgroundColor: 'rgba(42,143,122,0.35)' },
  elevPeak: { backgroundColor: colors.accent },
  elevNote: { fontSize: 11, color: colors.muted, marginTop: 8, lineHeight: 17 },

  /* sequence */
  seqItem: { flexDirection: 'row', gap: 12 },
  seqDot: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface,
    borderWidth: 2, borderColor: colors.accent, alignItems: 'center', justifyContent: 'center', zIndex: 1,
  },
  seqDotT: { fontSize: 14, fontWeight: '700', color: colors.accent },
  seqDotStart: { borderColor: colors.muted, borderStyle: 'dashed' },
  seqDotTStart: { color: colors.muted },
  seqDotEnd: { backgroundColor: colors.accent },
  seqDotTEnd: { color: '#fff' },
  seqLine: { position: 'absolute', left: 19, width: 2, backgroundColor: colors.border, bottom: -2 },
  seqNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  seqName: { fontSize: 14, fontWeight: '600', color: colors.fg },
  seqTag: { backgroundColor: 'rgba(26,36,32,0.06)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 5 },
  seqTagT: { fontSize: 9, color: colors.muted },
  seqDesc: { fontSize: 12, color: colors.muted, marginTop: 3, lineHeight: 17 },
  seqDist: { fontSize: 11, color: colors.accent, marginTop: 4 },

  /* reviews */
  reviewScore: { flexDirection: 'row', alignItems: 'center', gap: 18, paddingBottom: 14 },
  scoreNum: { fontSize: 40, fontWeight: '700', color: colors.fg, fontFamily: 'Georgia', letterSpacing: -0.5 },
  stars: { flexDirection: 'row', gap: 2, marginTop: 4 },
  scoreSub: { fontSize: 12, color: colors.muted, marginTop: 4 },
  bars: { flex: 1, gap: 5 },
  brow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  bl2: { fontSize: 10, color: colors.muted, width: 12, textAlign: 'right' },
  btrack: { flex: 1, height: 5, borderRadius: 3, backgroundColor: 'rgba(26,36,32,0.06)' },
  bfill: { height: 5, borderRadius: 3, backgroundColor: colors.accent },
  reviewItem: { paddingVertical: 12 },
  rvHead: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  avatarSm: { width: 30, height: 30, borderRadius: 15, backgroundColor: colors.accentSoft, borderWidth: 1, borderColor: colors.border },
  rvName: { fontSize: 13, fontWeight: '600', color: colors.fg },
  rvTime: { fontSize: 11, color: colors.muted },
  rvText: { fontSize: 13, color: colors.fg, opacity: 0.85, marginTop: 8, lineHeight: 20 },
  rvTags: { flexDirection: 'row', gap: 5, marginTop: 8, flexWrap: 'wrap' },
  rvTag: { backgroundColor: 'rgba(26,36,32,0.06)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  rvTagT: { fontSize: 10, color: colors.muted },

  /* action bar */
  actionbar: {
    flexDirection: 'row', alignItems: 'center', gap: 18, paddingHorizontal: 20, paddingVertical: 10,
    backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.border,
  },
  actIcon: { alignItems: 'center', gap: 3 },
  actIconT: { fontSize: 10, color: colors.muted },
  cta: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7,
    paddingVertical: 13, backgroundColor: colors.accent, borderRadius: 14, overflow: 'hidden',
  },
  ctaBusy: { backgroundColor: '#25806d' },
  ctaDone: { backgroundColor: colors.fg },
  ctaFill: { position: 'absolute', left: 0, top: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.22)' },
  ctaT: { color: '#fff', fontSize: 14, fontWeight: '600', letterSpacing: 0.3 },
});

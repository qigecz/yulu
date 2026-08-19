import React, { useMemo, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, StatusBar as RNStatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, radius } from '@yulu/ui';
import type { Spot, SpotReview } from '@yulu/shared';
import { formatDistance, formatRelativeTime } from '@yulu/shared';
import { useUIStore } from '../store/ui';
import { useToggleFavorite } from '../hooks/queries';
import { USE_MOCK } from '../config';
import { mockFeeds, mockSpotReviews } from '../mock/data';

type DetailTab = 'detail' | 'pits' | 'feed' | 'reviews';

const HOUR_LABELS = ['凌晨', '清晨', '上午', '午后', '傍晚', '夜间'];
const STAR_COLOR = '#e8a33d';

/** 渐变 hero 场景（纯 View 拼绘，替代原型 SVG 山水）。 */
function HeroScene() {
  return (
    <View style={heroStyles.scene}>
      <View style={heroStyles.sky} />
      <View style={heroStyles.hillFar} />
      <View style={heroStyles.hillNear} />
      <View style={heroStyles.water} />
    </View>
  );
}

const heroStyles = StyleSheet.create({
  scene: { ...StyleSheet.absoluteFillObject, overflow: 'hidden' },
  sky: { ...StyleSheet.absoluteFillObject, backgroundColor: '#d3e7dc' },
  hillFar: { position: 'absolute', left: -20, right: -20, top: 60, height: 130, backgroundColor: '#85b3a1', borderTopLeftRadius: 90, borderTopRightRadius: 70, opacity: 0.85, transform: [{ rotate: '-2deg' }] },
  hillNear: { position: 'absolute', left: -30, right: -30, top: 118, height: 130, backgroundColor: '#568a78', borderTopLeftRadius: 60, borderTopRightRadius: 110, transform: [{ rotate: '1.5deg' }] },
  water: { position: 'absolute', left: 0, right: 0, bottom: 0, top: 195, backgroundColor: '#5a9c8c' },
});

interface Props {
  spot: Spot;
}

export function SpotDetailScreen({ spot }: Props) {
  const [tab, setTab] = useState<DetailTab>('detail');
  const [chipOn, setChipOn] = useState({ fav: false, remind: false, report: false });
  const close = useUIStore((s) => s.closeOverlay);
  const openNavigation = useUIStore((s) => s.openNavigation);
  const openFeedDetail = useUIStore((s) => s.openFeedDetail);
  const toggleFavorite = useToggleFavorite();
  const scrollRef = useMemo(() => React.createRef<ScrollView>(), []);

  const reviews = useMemo(
    () => (USE_MOCK ? mockSpotReviews.filter((r) => r.spotId === spot.id) : []),
    [spot.id],
  );
  // 现场动态：mock 模式取 location 命中该钓点关键词的 feeds
  const spotFeeds = useMemo(() => {
    if (!USE_MOCK) return [];
    const key = spot.name.split('·')[0].trim();
    return mockFeeds.filter((f) => (f.location ?? '').includes(key));
  }, [spot.name]);

  const onToggleFav = () => {
    setChipOn((s) => ({ ...s, fav: !s.fav }));
    toggleFavorite.mutate({ type: 'spot', id: spot.id, favorited: !chipOn.fav });
  };

  const tabs: { key: DetailTab; label: string; count?: number }[] = [
    { key: 'detail', label: '详情' },
    { key: 'pits', label: '坑点', count: spot.pits?.length ?? 0 },
    { key: 'feed', label: '动态', count: spotFeeds.length },
    { key: 'reviews', label: '评价', count: spot.ratingCount },
  ];

  return (
    <View style={styles.container}>
      <ScrollView ref={scrollRef} style={styles.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 16 }}>
        {/* ══ Hero ══ */}
        <View style={styles.hero}>
          <HeroScene />
          <View style={styles.heroShade} />

          <View style={styles.navRow}>
            <TouchableOpacity style={styles.floatBtn} onPress={close} activeOpacity={0.8}>
              <Ionicons name="chevron-back" size={20} color="#fff" />
            </TouchableOpacity>
            <View style={styles.navGroup}>
              <TouchableOpacity style={styles.floatBtn} onPress={onToggleFav} activeOpacity={0.8}>
                <Ionicons name={chipOn.fav ? 'star' : 'star-outline'} size={17} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.floatBtn} onPress={close} activeOpacity={0.8}>
                <Ionicons name="share-social-outline" size={16} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.heroBody}>
            <View style={styles.heroTags}>
              <View style={styles.heroTagSolid}><Text style={styles.heroTagSolidText}>{spot.fishingMethod ?? '综合'}</Text></View>
              {(spot.waterDepth || spot.bottomType) && (
                <View style={styles.heroTag}><Text style={styles.heroTagText}>{[spot.waterDepth, spot.bottomType].filter(Boolean).join(' · ')}</Text></View>
              )}
              <View style={styles.heroTag}><Text style={styles.heroTagText}>免费</Text></View>
            </View>
            <Text style={styles.heroTitle}>{spot.name}</Text>
            <View style={styles.heroMeta}>
              <View style={styles.heroMetaItem}>
                <Ionicons name="location-outline" size={12} color="#fff" />
                <Text style={styles.heroMetaText}>{spot.region ?? '—'}</Text>
              </View>
              {typeof spot.distance === 'number' && (
                <>
                  <Text style={styles.dot}>·</Text>
                  <Text style={styles.heroMetaText}>距你 {formatDistance(spot.distance)}</Text>
                </>
              )}
              {spot.anglersToday != null && (
                <>
                  <Text style={styles.dot}>·</Text>
                  <Text style={styles.heroMetaText}>今日 {spot.anglersToday} 人在钓</Text>
                </>
              )}
            </View>
          </View>

          {spot.rating != null && (
            <View style={styles.ratingChip}>
              <Ionicons name="star" size={13} color={STAR_COLOR} />
              <Text style={styles.ratingNum}>{spot.rating.toFixed(1)}</Text>
              <Text style={styles.ratingCnt}>{spot.ratingCount} 条评价</Text>
            </View>
          )}
        </View>

        {/* ══ Quick stats ══ */}
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statV}>{spot.mainSpecies ?? spot.fishSpecies[0] ?? '—'}</Text>
            <Text style={styles.statL}>主钓鱼种</Text>
          </View>
          <View style={[styles.stat, styles.statBorder]}>
            <Text style={styles.statV}>{spot.waterDepth ?? '—'}</Text>
            <Text style={styles.statL}>水深范围</Text>
          </View>
          <View style={[styles.stat, styles.statBorder]}>
            <Text style={styles.statV}>{spot.waterTemp != null ? `${spot.waterTemp}°C` : '—'}</Text>
            <Text style={styles.statL}>当前水温</Text>
          </View>
          <View style={[styles.stat, styles.statBorder]}>
            <Text style={[styles.statV, styles.statGood]}>{spot.catchRate7d != null ? `${spot.catchRate7d}%` : '—'}</Text>
            <Text style={styles.statL}>近7天出鱼率</Text>
          </View>
        </View>

        {/* ══ Action chips ══ */}
        <View style={styles.chipsRow}>
          <TouchableOpacity
            style={[styles.chip, chipOn.fav && styles.chipOn]}
            onPress={onToggleFav}
            activeOpacity={0.7}
          >
            <Ionicons name={chipOn.fav ? 'star' : 'star-outline'} size={15} color={chipOn.fav ? colors.accent : colors.muted} />
            <Text style={[styles.chipT, chipOn.fav && styles.chipTOn]}>{chipOn.fav ? '已收藏' : '收藏'}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.chip, chipOn.remind && styles.chipOn]}
            onPress={() => setChipOn((s) => ({ ...s, remind: !s.remind }))}
            activeOpacity={0.7}
          >
            <Ionicons name="layers-outline" size={15} color={chipOn.remind ? colors.accent : colors.muted} />
            <Text style={[styles.chipT, chipOn.remind && styles.chipTOn]}>{chipOn.remind ? '提醒已开' : '路线更新提醒'}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.chip, chipOn.report && styles.chipOn]}
            onPress={() => setChipOn((s) => ({ ...s, report: !s.report }))}
            activeOpacity={0.7}
          >
            <Ionicons name="warning-outline" size={15} color={chipOn.report ? colors.accent : colors.muted} />
            <Text style={[styles.chipT, chipOn.report && styles.chipTOn]}>{chipOn.report ? '已举报' : '举报'}</Text>
          </TouchableOpacity>
        </View>

        {/* ══ Segmented tabs ══ */}
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

        {/* ══ Tab panes ══ */}
        {tab === 'detail' && (
          <View style={styles.pad}>
            <Text style={styles.sectionLabel}>基本信息</Text>
            <View style={styles.card}>
              {(spot.info ?? defaultInfo(spot)).map((row) => (
                <View key={row.label} style={styles.kvRow}>
                  <Text style={styles.kvK}>{row.label}</Text>
                  <Text style={styles.kvV}>{row.value}</Text>
                </View>
              ))}
              <View style={styles.tagsWrap}>
                {spot.tags.map((tag) => (
                  <View key={tag} style={styles.tag}><Text style={styles.tagT}>{tag}</Text></View>
                ))}
              </View>
              <Text style={styles.warnNote}>⚠ 湾口西段无手机信号，建议提前下载离线地图与坑点路线。</Text>
            </View>

            {spot.catchByHour && (
              <>
                <Text style={styles.sectionLabel}>出鱼时段 · 近 7 天</Text>
                <View style={[styles.card, styles.chartCard]}>
                  <View style={styles.barchart}>
                    {spot.catchByHour.map((v, i) => (
                      <View key={i} style={styles.bcol}>
                        <View style={styles.barZone}>
                          <View style={[styles.bar, v >= 60 ? styles.barHot : v >= 40 ? styles.barMid : null, { height: `${Math.max(v, 6)}%` }]} />
                        </View>
                        <Text style={styles.bl}>{HOUR_LABELS[i]}</Text>
                      </View>
                    ))}
                  </View>
                  <Text style={styles.chartNote}>
                    清晨 5–8 点出鱼率最高，近 7 天 {spot.catchRate7d ?? 86}% 的渔获来自清晨与傍晚两个窗口。
                  </Text>
                </View>
              </>
            )}

            {spot.featuredRoute && (
              <View style={styles.routeCard}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.routeTitle}>{spot.featuredRoute.name}</Text>
                  <Text style={styles.routeDesc}>
                    {spot.featuredRoute.spotsCount} 坑点 · {spot.featuredRoute.totalDistance}km · {spot.featuredRoute.downloads} 次下载 · 上传者：{spot.featuredRoute.uploader}
                  </Text>
                </View>
                <TouchableOpacity style={styles.routeBtn} onPress={() => openNavigation(spot.featuredRoute!.id)} activeOpacity={0.8}>
                  <Text style={styles.routeBtnT}>下载路线</Text>
</TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {tab === 'pits' && (
          <View style={styles.pad}>
            <Text style={styles.sectionLabel}>湾内坑点</Text>
            <View style={styles.card}>
              {(spot.pits ?? []).map((pit, i) => (
                <View key={i} style={[styles.pitItem, i > 0 && styles.pitBorder]}>
                  <View style={styles.pitNo}><Text style={styles.pitNoT}>{i + 1}</Text></View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.pitName}>{pit.name}</Text>
                    <Text style={styles.pitDesc}>{pit.desc}</Text>
                  </View>
                  <Text style={styles.pitCta}>导航 →</Text>
                </View>
              ))}
              {(spot.pits ?? []).length === 0 && (
                <Text style={styles.empty}>该钓点暂无标记坑点</Text>
              )}
            </View>
            <Text style={styles.metaCenter}>坑点由 42 位钓友共同标记 · 最近更新 3 天前</Text>
          </View>
        )}

        {tab === 'feed' && (
          <View style={styles.pad}>
            <Text style={styles.sectionLabel}>钓友现场动态</Text>
            <View style={styles.card}>
              {spotFeeds.map((f, i) => (
                <View key={f.id} style={[styles.feedItem, i > 0 && styles.pitBorder]}>
                  <View style={styles.avatar} />
                  <View style={{ flex: 1 }}>
                    <View style={styles.feedUserRow}>
                      <Text style={styles.feedUser}>{f.user?.nickname ?? ''}</Text>
                      {i === 0 && <View style={styles.badge}><Text style={styles.badgeT}>爆护</Text></View>}
                    </View>
                    <Text style={styles.feedText}>{f.content}</Text>
                    <Text style={styles.feedTime}>{formatRelativeTime(f.createdAt)}</Text>
                  </View>
                </View>
              ))}
              {spotFeeds.length === 0 && <Text style={styles.empty}>暂无现场动态</Text>}
            </View>
            {spotFeeds.length > 0 && (
              <Text style={styles.metaCenter}>— 已加载全部 {spotFeeds.length} 条动态 —</Text>
            )}
          </View>
        )}

        {tab === 'reviews' && (
          <View style={styles.pad}>
            <Text style={styles.sectionLabel}>钓友评价</Text>
            <View style={styles.card}>
              <View style={styles.reviewScore}>
                <View>
                  <Text style={styles.scoreNum}>{spot.rating?.toFixed(1) ?? '—'}</Text>
                  <View style={styles.stars}>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Ionicons key={n} name="star" size={12} color={n <= Math.round(spot.rating ?? 0) ? STAR_COLOR : colors.border} />
                    ))}
                  </View>
                  <Text style={styles.scoreSub}>{spot.ratingCount} 条评价</Text>
                </View>
                <View style={styles.bars}>
                  {ratingDist(reviews, spot.ratingCount ?? 0).map((pct, n) => (
                    <View key={n} style={styles.brow}>
                      <Text style={styles.bl2}>{5 - n}</Text>
                      <View style={styles.btrack}><View style={[styles.bfill, { width: `${pct}%` }]} /></View>
                    </View>
                  ))}
                </View>
              </View>

              {reviews.map((rv: SpotReview, i) => (
                <View key={rv.id} style={[styles.reviewItem, i > 0 && styles.pitBorder]}>
                  <View style={styles.rvHead}>
                    <View style={[styles.avatar, styles.avatarSm]} />
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
            <Text style={styles.metaCenter}>— 显示前 3 条 · 查看全部 {spot.ratingCount ?? 0} 条 →</Text>
          </View>
        )}
      </ScrollView>

      {/* ══ Bottom action bar ══ */}
      <View style={styles.actionbar}>
        <TouchableOpacity style={styles.actIcon} onPress={onToggleFav} activeOpacity={0.7}>
          <Ionicons name={chipOn.fav ? 'star' : 'star-outline'} size={22} color={chipOn.fav ? colors.accent : colors.muted} />
          <Text style={[styles.actIconT, chipOn.fav && { color: colors.accent }]}>收藏</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actIcon} onPress={close} activeOpacity={0.7}>
          <Ionicons name="layers-outline" size={22} color={colors.muted} />
          <Text style={styles.actIconT}>离线</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.cta} onPress={close} activeOpacity={0.85}>
          <Ionicons name="compass-outline" size={17} color="#fff" />
          <Text style={styles.ctaT}>导航到此</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

/** Fallback info rows when the spot has no structured info. */
function defaultInfo(spot: Spot): { label: string; value: string }[] {
  return [
    { label: '水域类型', value: spot.bottomType ?? '—' },
    { label: '主钓鱼种', value: spot.fishSpecies.join(' · ') || '—' },
    { label: '钓法', value: spot.fishingMethod ?? '综合' },
    { label: '上传者', value: spot.uploader?.nickname ?? '—' },
  ];
}

/** 5→1 star distribution percentages (falls back to a plausible curve). */
function ratingDist(reviews: SpotReview[], total: number): number[] {
  if (!reviews.length || !total) return [78, 16, 4, 1, 1];
  const counts = [0, 0, 0, 0, 0];
  reviews.forEach((r) => {
    const idx = 5 - Math.min(5, Math.max(1, r.rating));
    counts[idx] += 1;
  });
  return counts.map((c) => Math.round((c / total) * 100));
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  scroll: { flex: 1 },
  pad: { paddingHorizontal: spacing.screenPadding },

  /* hero */
  hero: { height: 300, overflow: 'hidden' },
  heroShade: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(10,18,15,0.30)' },
  navRow: { position: 'absolute', top: 48, left: 20, right: 20, flexDirection: 'row', justifyContent: 'space-between', zIndex: 10 },
  navGroup: { flexDirection: 'row', gap: 10 },
  floatBtn: {
    width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(12,20,17,0.42)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.22)', alignItems: 'center', justifyContent: 'center',
  },
  heroBody: { position: 'absolute', left: 20, right: 96, bottom: 16, zIndex: 10 },
  heroTags: { flexDirection: 'row', gap: 6, marginBottom: 8, flexWrap: 'wrap' },
  heroTag: { paddingHorizontal: 9, paddingVertical: 3, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.16)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.28)' },
  heroTagText: { color: '#fff', fontSize: 10, letterSpacing: 0.5 },
  heroTagSolid: { paddingHorizontal: 9, paddingVertical: 3, borderRadius: 999, backgroundColor: colors.accent },
  heroTagSolidText: { color: '#fff', fontSize: 10, letterSpacing: 0.5 },
  heroTitle: { fontSize: 28, fontWeight: '700', color: '#fff', letterSpacing: -0.5, marginBottom: 6, fontFamily: 'Georgia' },
  heroMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  heroMetaItem: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  heroMetaText: { color: '#fff', fontSize: 12 },
  dot: { color: 'rgba(255,255,255,0.55)', fontSize: 12 },
  ratingChip: {
    position: 'absolute', right: 20, bottom: 16, zIndex: 10, flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'rgba(255,255,255,0.94)', paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999,
  },
  ratingNum: { fontSize: 13, fontWeight: '600', color: colors.fg },
  ratingCnt: { fontSize: 11, color: colors.muted },

  /* stats */
  statsRow: {
    flexDirection: 'row', marginHorizontal: spacing.screenPadding, marginTop: 14,
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 16, overflow: 'hidden',
  },
  stat: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  statBorder: { borderLeftWidth: 1, borderColor: colors.border },
  statV: { fontSize: 15, fontWeight: '600', color: colors.fg },
  statGood: { color: colors.accent },
  statL: { fontSize: 11, color: colors.muted, marginTop: 2 },

  /* chips */
  chipsRow: { flexDirection: 'row', gap: 8, marginHorizontal: spacing.screenPadding, marginTop: 12 },
  chip: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    paddingVertical: 10, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 13,
  },
  chipOn: { backgroundColor: colors.accentSoft, borderColor: colors.accent },
  chipT: { fontSize: 12, fontWeight: '500', color: colors.fg },
  chipTOn: { color: colors.accent },

  /* segmented */
  seg: { flexDirection: 'row', marginHorizontal: spacing.screenPadding, marginTop: 18, backgroundColor: 'rgba(26,36,32,0.06)', borderRadius: 12, padding: 3 },
  segBtn: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 10 },
  segBtnOn: { backgroundColor: colors.surface },
  segBtnT: { fontSize: 13, fontWeight: '500', color: colors.muted },
  segBtnTOn: { color: colors.fg, fontWeight: '600' },

  /* shared */
  sectionLabel: { fontSize: 16, fontWeight: '600', color: colors.fg, marginTop: 18, marginBottom: 10, letterSpacing: -0.2 },
  card: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, padding: 16 },

  /* kv */
  kvRow: { flexDirection: 'row', marginBottom: 9 },
  kvK: { width: 86, fontSize: 13, color: colors.muted },
  kvV: { flex: 1, fontSize: 13, color: colors.fg },
  tagsWrap: { flexDirection: 'row', gap: 6, flexWrap: 'wrap', marginTop: 12 },
  tag: { paddingHorizontal: 9, paddingVertical: 3, borderWidth: 1, borderColor: colors.border, borderRadius: 999 },
  tagT: { fontSize: 11, color: colors.muted },
  warnNote: { fontSize: 12, color: colors.muted, marginTop: 12, lineHeight: 18 },

  /* chart */
  chartCard: { padding: 14 },
  barchart: { flexDirection: 'row', gap: 6, height: 92 },
  bcol: { flex: 1, gap: 5 },
  barZone: { flex: 1, justifyContent: 'flex-end' },
  bar: { borderRadius: 5, backgroundColor: 'rgba(26,36,32,0.08)' },
  barHot: { backgroundColor: colors.accent },
  barMid: { backgroundColor: 'rgba(42,143,122,0.45)' },
  bl: { fontSize: 9, color: colors.muted, textAlign: 'center', alignSelf: 'stretch' },
  chartNote: { fontSize: 11, color: colors.muted, marginTop: 10, lineHeight: 17 },

  /* route card */
  routeCard: {
    marginTop: 18, flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: colors.accentSoft, borderWidth: 1, borderColor: 'rgba(42,143,122,0.3)', borderRadius: 16, padding: 14,
  },
  routeTitle: { fontSize: 14, fontWeight: '600', color: colors.fg },
  routeDesc: { fontSize: 12, color: colors.muted, marginTop: 3 },
  routeBtn: { backgroundColor: colors.accent, paddingHorizontal: 16, paddingVertical: 9, borderRadius: 11 },
  routeBtnT: { color: '#fff', fontSize: 13, fontWeight: '600' },

  /* pits */
  pitItem: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 11 },
  pitBorder: { borderTopWidth: 1, borderTopColor: colors.border },
  pitNo: { width: 34, height: 34, borderRadius: 12, backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center' },
  pitNoT: { color: colors.accent, fontSize: 13, fontWeight: '600' },
  pitName: { fontSize: 14, fontWeight: '600', color: colors.fg },
  pitDesc: { fontSize: 12, color: colors.muted, marginTop: 2 },
  pitCta: { fontSize: 12, color: colors.accent, fontWeight: '500' },
  metaCenter: { fontSize: 11, color: colors.muted, textAlign: 'center', paddingVertical: 12 },
  empty: { fontSize: 13, color: colors.muted, textAlign: 'center', paddingVertical: 20 },

  /* feed */
  feedItem: { flexDirection: 'row', gap: 10, paddingVertical: 12 },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.accentSoft, borderWidth: 1, borderColor: colors.border },
  avatarSm: { width: 30, height: 30, borderRadius: 15 },
  feedUserRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  feedUser: { fontSize: 13, fontWeight: '600', color: colors.fg },
  badge: { backgroundColor: colors.accentSoft, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 5 },
  badgeT: { fontSize: 9, color: colors.accent, letterSpacing: 0.5 },
  feedText: { fontSize: 13, color: colors.muted, marginTop: 3, lineHeight: 19 },
  feedTime: { fontSize: 11, color: colors.muted, marginTop: 6 },

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
    paddingVertical: 13, backgroundColor: colors.accent, borderRadius: 14,
  },
  ctaT: { color: '#fff', fontSize: 15, fontWeight: '600', letterSpacing: 0.3 },
});

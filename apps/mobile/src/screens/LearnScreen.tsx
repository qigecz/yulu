import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { colors, spacing, fontSize, radius, SearchBar, Tag, SectionHeader } from '@yulu/ui';
import { formatViewCount } from '@yulu/shared';
import { useTutorials } from '../hooks/queries';
import { QueryState } from '../components/QueryState';
import { VideoPlayerOverlay } from '../components/VideoPlayerOverlay';
import { useSettingsStore } from '../store/settings';
import { useUIStore } from '../store/ui';

const categories = ['全部', '路亚', '台钓', '传统钓', '筏钓', '绑钩 DIY'];

/** 原型补充课程（真实教程接口未覆盖的分类：筏钓 / 绑钩 DIY 等）。 */
const extraTutorials = [
  { id: 't3', title: '水库作钓全攻略：选位、打窝、遛鱼技巧', authorName: '路亚阿杰', views: 5340, duration: '24:18', time: '2周前', cat: '路亚' },
  { id: 't4', title: 'VIB 使用技巧：不同水深的收线速度', authorName: '路亚小王', views: 12000, duration: '9:47', time: '3周前', cat: '路亚' },
  { id: 't5', title: '传统钓长竿短线：草洞钓鲫鱼实战教学', authorName: '老钓翁', views: 4580, duration: '15:22', time: '1月前', cat: '传统钓' },
  { id: 't6', title: '筏钓翻板钩绑法与排上作钓实操', authorName: '龙溪筏客', views: 3120, duration: '17:15', time: '1月前', cat: '筏钓' },
  { id: 't7', title: '绑钩不求人：三种最结实的子线绑法', authorName: '老张', views: 9760, duration: '11:08', time: '2月前', cat: '绑钩 DIY' },
];

const articles = [
  {
    id: 'a1', eyebrow: '经验分享',
    title: '如何通过水温判断当天鱼层位置',
    excerpt: '水温是影响鱼层分布最关键的因素之一。本文结合碧溪湾全年的作钓记录，总结不同温度区间的鱼层规律，帮你少走弯路。',
    meta: '老张 · 阅读 5 分钟 · 3,200 次阅读',
  },
  {
    id: 'a2', eyebrow: '装备指南',
    title: '夏季夜钓装备清单：从照明到安全防护',
    excerpt: '夜钓是夏季最爽的作钓方式，但安全和装备缺一不可。从夜钓灯、防蚊到安全绳，一份完整的清单和选购建议。',
    meta: '阿杰 · 阅读 8 分钟 · 2,100 次阅读',
  },
];

type FlatTutorial = {
  id: string; title: string; authorName: string; views: number;
  duration: string; time: string; cat: string; url?: string;
};

/** 播放浮层的参数（有 url 走 expo-av 真实播放，无 url 模拟播放）。 */
type PlayerTarget = { title: string; sub: string; duration: string; start: number; url?: string };

// 「继续学习」进度：featured 课程 18:42（1122s），恢复点持久化在 settings store。
const FEATURED_TOTAL = 1122;

export function LearnScreen() {
  const [activeCategory, setActiveCategory] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [player, setPlayer] = useState<PlayerTarget | null>(null);
  const tutorials = useTutorials();
  const openSearch = useUIStore((s) => s.openSearch);
  const openArticleDetail = useUIStore((s) => s.openArticleDetail);
  const resumeSeconds = useSettingsStore((s) => s.resumeSeconds);

  const onRefresh = async () => {
    setRefreshing(true);
    await tutorials.refetch().catch(() => undefined);
    setRefreshing(false);
  };

  const featured = tutorials.data?.[0];
  const fromData: FlatTutorial[] = (tutorials.data?.slice(1) ?? []).map((t) => ({
    id: t.id, title: t.title, authorName: t.author?.nickname || '',
    views: t.viewsCount, duration: t.duration || '', time: '1周前', cat: t.category ?? '路亚',
    url: t.videoUrl,
  }));
  const list: FlatTutorial[] = [...fromData, ...extraTutorials];
  const filtered = useMemo(
    () => (activeCategory === 0 ? list : list.filter((l) => l.cat === categories[activeCategory])),
    [activeCategory, list],
  );

  const openLesson = (lesson: { title: string; authorName: string; cat: string; views: number; duration: string; url?: string }, start = 0) => {
    setPlayer({
      title: lesson.title,
      sub: `${lesson.authorName} · ${lesson.cat} · ${formatViewCount(lesson.views)} 次观看`,
      duration: lesson.duration,
      start,
      url: lesson.url,
    });
  };

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>学习</Text>
        <TouchableOpacity style={styles.iconBtn} onPress={openSearch} activeOpacity={0.7}>
          <Text>🔍</Text>
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.pad}>
        <TouchableOpacity onPress={openSearch} activeOpacity={0.8}>
          <SearchBar placeholder="搜索教程、技巧…" />
        </TouchableOpacity>
      </View>

      <View style={{ height: 14 }} />

      {/* Category pills */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
        <View style={styles.catRow}>
          {categories.map((cat, i) => (
            <TouchableOpacity
              key={cat}
              style={[styles.catPill, activeCategory === i && styles.catPillActive]}
              onPress={() => setActiveCategory(i)}
            >
              <Text style={[styles.catLabel, activeCategory === i && styles.catLabelActive]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View style={{ height: 16 }} />

      {/* 继续学习（上次观看进度，模拟数据） */}
      {featured && (
        <View style={styles.section}>
          <View style={styles.pad}>
            <SectionHeader title="继续学习" />
          </View>
          <View style={{ height: 10 }} />
          <TouchableOpacity
            style={[styles.resumeCard, styles.mx]}
            activeOpacity={0.8}
            onPress={() => openLesson(
              { title: featured.title, authorName: featured.author?.nickname || '', cat: featured.category ?? '路亚', views: featured.viewsCount, duration: featured.duration || '', url: featured.videoUrl },
              resumeSeconds,
            )}
          >
            <View style={styles.resumeThumb}>
              <View style={styles.miniPlay}><Text style={styles.miniPlayIcon}>▶</Text></View>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.resumeLabel}>上次看到</Text>
              <Text style={styles.resumeTitle} numberOfLines={2}>{featured.title}</Text>
              <Text style={styles.resumeMeta}>{featured.author?.nickname} · 第 2 节 / 共 5 节</Text>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${Math.min(100, Math.round((resumeSeconds / FEATURED_TOTAL) * 100))}%` }]} />
              </View>
              <View style={styles.progressTimes}>
                <Text style={styles.progressTime}>
                  {String(Math.floor(resumeSeconds / 60)).padStart(2, '0')}:{String(resumeSeconds % 60).padStart(2, '0')}
                </Text>
                <Text style={styles.progressTime}>{featured.duration}</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      )}

      <View style={{ height: 16 }} />

      {/* 本周精选 */}
      <View style={styles.section}>
        <View style={styles.pad}>
          <SectionHeader title="本周精选" />
        </View>
        <View style={{ height: 10 }} />
        <QueryState isLoading={tutorials.isLoading} isError={tutorials.isError} refetch={() => tutorials.refetch()} minHeight={220}>
          {featured && (
            <TouchableOpacity
              style={[styles.featuredCard, styles.mx]}
              activeOpacity={0.85}
              onPress={() => openLesson(
                { title: featured.title, authorName: featured.author?.nickname || '', cat: featured.category ?? '路亚', views: featured.viewsCount, duration: featured.duration || '' },
              )}
            >
              <View style={styles.featuredThumb}>
                <View style={styles.featBadge}><Text style={styles.featBadgeText}>精选课程 · 免费</Text></View>
                <View style={styles.playBtn}><Text style={styles.playIcon}>▶</Text></View>
                <View style={styles.durationBadge}>
                  <Text style={styles.durationText}>{featured.duration}</Text>
                </View>
              </View>
              <View style={{ padding: 14 }}>
                <Text style={styles.featuredTitle}>{featured.title}</Text>
                <View style={styles.featMetaRow}>
                  <View style={styles.featAvatar}>
                    <Text style={styles.featAvatarText}>{(featured.author?.nickname ?? '渔').charAt(0)}</Text>
                  </View>
                  <Text style={styles.featuredMeta}>
                    {featured.author?.nickname} · 金牌探路者 · {formatViewCount(featured.viewsCount)}次观看
                  </Text>
                </View>
                <View style={styles.tagRow}>
                  {featured.tags.map((t) => <Tag key={t} label={t} />)}
                </View>
              </View>
            </TouchableOpacity>
          )}
        </QueryState>
      </View>

      <View style={{ height: 18 }} />

      {/* Tutorial list */}
      <View style={styles.pad}>
        <SectionHeader title="热门教程" actionLabel={`${filtered.length} 个`} />
        <View style={{ height: 8 }} />
        {filtered.length === 0 ? (
          <View style={styles.listEmpty}>
            <Text style={styles.listEmptyText}>该分类暂无教程，去别的分类看看</Text>
          </View>
        ) : filtered.map((tut) => (
          <TouchableOpacity key={tut.id} style={styles.tutItem} activeOpacity={0.7} onPress={() => openLesson(tut)}>
            <View style={styles.tutThumb}>
              <View style={styles.tutPlayBtn}><Text style={styles.tutPlayIcon}>▶</Text></View>
              <View style={styles.tutDuration}>
                <Text style={styles.tutDurationText}>{tut.duration}</Text>
              </View>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.tutTitle} numberOfLines={2}>{tut.title}</Text>
              <Text style={styles.tutAuthor}>{tut.authorName}</Text>
              <Text style={styles.tutMeta}>
                {tut.views >= 8600
                  ? <Text style={styles.tutHot}>{formatViewCount(tut.views)}</Text>
                  : <Text>{formatViewCount(tut.views)}</Text>}
                {' '}次观看 · {tut.time}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <View style={{ height: 18 }} />

      {/* Articles */}
      <View style={styles.pad}>
        <SectionHeader title="精选文章" actionLabel="更多 →" />
        <View style={{ height: 10 }} />
        {articles.map((art) => (
          <TouchableOpacity key={art.id} style={[styles.articleCard, styles.mx]} activeOpacity={0.75} onPress={() => openArticleDetail(art.id)}>
            <Text style={styles.articleEyebrow}>{art.eyebrow}</Text>
            <Text style={styles.articleTitle}>{art.title}</Text>
            <Text style={styles.articleExcerpt} numberOfLines={2}>{art.excerpt}</Text>
            <Text style={styles.articleMeta}>{art.meta}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={{ height: 80 }} />

      {/* 模拟视频播放浮层 */}
      <VideoPlayerOverlay
        visible={player !== null}
        title={player?.title ?? ''}
        sub={player?.sub ?? ''}
        duration={player?.duration ?? '00:00'}
        startSeconds={player?.start ?? 0}
        url={player?.url}
        onClose={() => setPlayer(null)}
        onProgress={(sec) => useSettingsStore.getState().setResumeSeconds(Math.round(sec))}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  mx: { marginHorizontal: spacing.screenPadding },
  section: { gap: 0 },
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
  catScroll: { paddingLeft: spacing.screenPadding },
  catRow: { flexDirection: 'row', gap: 6, paddingRight: spacing.screenPadding },
  catPill: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: radius.pill,
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
  },
  catPillActive: { backgroundColor: colors.fg, borderColor: colors.fg },
  catLabel: { fontSize: 13, fontWeight: '500', color: colors.fg },
  catLabelActive: { color: '#fff' },

  // 继续学习
  resumeCard: {
    padding: 14, borderRadius: radius.lg, gap: 12,
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
    flexDirection: 'row', alignItems: 'center',
  },
  resumeThumb: {
    width: 96, height: 64, borderRadius: 12, backgroundColor: colors.accentSoft,
    alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
  },
  miniPlay: {
    width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center', justifyContent: 'center',
  },
  miniPlayIcon: { color: colors.accent, fontSize: 11, marginLeft: 1 },
  resumeLabel: {
    fontFamily: 'monospace', fontSize: 10, color: colors.accent,
    letterSpacing: 0.06, textTransform: 'uppercase',
  },
  resumeTitle: { fontSize: 14, fontWeight: '600', color: colors.fg, lineHeight: 18, marginTop: 3 },
  resumeMeta: { fontSize: 11, color: colors.muted, marginTop: 3, marginBottom: 8 },
  progressTrack: { height: 4, borderRadius: 999, backgroundColor: colors.fgSoft, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 999, backgroundColor: colors.accent },
  progressTimes: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  progressTime: { fontFamily: 'monospace', fontSize: 9, color: colors.muted },

  // 本周精选
  featuredCard: {
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.lg, overflow: 'hidden',
  },
  featuredThumb: {
    height: 160, backgroundColor: colors.accentSoft,
    alignItems: 'center', justifyContent: 'center',
  },
  featBadge: {
    position: 'absolute', left: 10, top: 10,
    backgroundColor: colors.surface, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 999,
  },
  featBadgeText: { fontFamily: 'monospace', fontSize: 10, color: colors.fg, letterSpacing: 0.05 },
  playBtn: {
    width: 52, height: 52, borderRadius: 26, backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowRadius: 4, shadowOpacity: 0.15,
  },
  playIcon: { color: colors.accent, fontSize: 20, marginLeft: 3 },
  durationBadge: {
    position: 'absolute', bottom: 8, right: 10,
    backgroundColor: 'rgba(0,0,0,0.7)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6,
  },
  durationText: { fontFamily: 'monospace', fontSize: 11, color: '#fff' },
  featuredTitle: { fontSize: 16, fontWeight: '600', color: colors.fg, lineHeight: 22 },
  featMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  featAvatar: {
    width: 20, height: 20, borderRadius: 10, backgroundColor: colors.accentSoft,
    alignItems: 'center', justifyContent: 'center',
  },
  featAvatarText: { fontSize: 10, fontWeight: '700', color: colors.accent },
  featuredMeta: { fontSize: 12, color: colors.muted, flexShrink: 1 },
  tagRow: { flexDirection: 'row', gap: 4, flexWrap: 'wrap', marginTop: 8 },

  // 热门教程
  listEmpty: { paddingVertical: 18, alignItems: 'center' },
  listEmptyText: { fontSize: 13, color: colors.muted },
  tutItem: {
    flexDirection: 'row', gap: 12, paddingVertical: 12, alignItems: 'flex-start',
    borderTopWidth: 1, borderTopColor: colors.border,
  },
  tutThumb: {
    width: 96, height: 60, borderRadius: 10, backgroundColor: colors.accentSoft,
    alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
  },
  tutPlayBtn: {
    width: 24, height: 24, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.88)',
    alignItems: 'center', justifyContent: 'center',
  },
  tutPlayIcon: { color: colors.accent, fontSize: 10, marginLeft: 1 },
  tutDuration: {
    position: 'absolute', bottom: 3, right: 4,
    backgroundColor: 'rgba(0,0,0,0.65)', paddingHorizontal: 5, paddingVertical: 1, borderRadius: 4,
  },
  tutDurationText: { fontFamily: 'monospace', fontSize: 9, color: '#fff' },
  tutTitle: { fontSize: 14, fontWeight: '500', color: colors.fg, lineHeight: 19 },
  tutAuthor: { fontSize: 12, color: colors.muted, marginTop: 3 },
  tutMeta: { fontSize: 11, color: colors.muted, marginTop: 3 },
  tutHot: { color: colors.accent, fontWeight: '600' },

  // 精选文章
  articleCard: {
    padding: 16, marginBottom: 10,
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.lg,
  },
  articleEyebrow: {
    fontFamily: 'monospace', fontSize: 11, color: colors.accent,
    letterSpacing: 0.06, textTransform: 'uppercase',
  },
  articleTitle: { fontSize: 16, fontWeight: '600', color: colors.fg, marginTop: 4 },
  articleExcerpt: { fontSize: 13, color: colors.muted, marginTop: 4, lineHeight: 19 },
  articleMeta: { fontSize: 12, color: colors.muted, marginTop: 8 },
});

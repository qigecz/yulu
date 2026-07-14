import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing, fontSize, radius, SearchBar, Tag, SectionHeader } from '@yulu/ui';
import { formatViewCount } from '@yulu/shared';
import { useTutorials } from '../hooks/queries';
import { QueryState } from '../components/QueryState';

const categories = [
  { icon: '📚', label: '全部' },
  { icon: '⚡', label: '路亚' },
  { icon: '🎣', label: '台钓' },
  { icon: '🎋', label: '传统钓' },
  { icon: '📍', label: '坑点技巧' },
];

const extraTutorials = [
  { id: 't3', title: '水库作钓全攻略：选位、打窝、遛鱼技巧', authorName: '阿杰说鱼', views: 5340, duration: '24:18', time: '2周前' },
  { id: 't4', title: 'VIB 使用技巧：不同水深的收线速度', authorName: '路亚小王', views: 3120, duration: '9:47', time: '3周前' },
  { id: 't5', title: '传统钓长竿短线：草洞钓鲫鱼实战教学', authorName: '老钓翁', views: 4580, duration: '15:22', time: '1月前' },
];

const articles = [
  {
    id: 'a1', eyebrow: '经验分享',
    title: '如何通过水温判断当天鱼层位置',
    excerpt: '水温是影响鱼层分布最关键的因素之一。本文结合实际作钓经验，总结不同温度区间的鱼层规律…',
    meta: '老张 · 阅读 5 分钟 · 3,200 次阅读',
  },
  {
    id: 'a2', eyebrow: '装备指南',
    title: '夏季夜钓装备清单：从照明到安全防护',
    excerpt: '夜钓是夏季最爽的作钓方式，但安全和装备缺一不可。从夜钓灯、防蚊到安全绳，一份完整的…',
    meta: '阿杰 · 阅读 8 分钟 · 2,100 次阅读',
  },
];

type FlatTutorial = { id: string; title: string; authorName: string; views: number; duration: string; time: string };

export function LearnScreen() {
  const [activeCategory, setActiveCategory] = useState(0);
  const tutorials = useTutorials();

  const featured = tutorials.data?.[0];
  const fromData: FlatTutorial[] = (tutorials.data?.slice(1) ?? []).map((t) => ({
    id: t.id, title: t.title, authorName: t.author?.nickname || '',
    views: t.viewsCount, duration: t.duration || '', time: '1周前',
  }));
  const list: FlatTutorial[] = [...fromData, ...extraTutorials];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>学习</Text>
        <View style={styles.iconBtn}><Text>🔍</Text></View>
      </View>

      {/* Search */}
      <View style={styles.pad}>
        <SearchBar placeholder="搜索教程、技巧…" />
      </View>

      <View style={{ height: 14 }} />

      {/* Category pills */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
        <View style={styles.catRow}>
          {categories.map((cat, i) => (
            <TouchableOpacity
              key={cat.label}
              style={[styles.catPill, activeCategory === i && styles.catPillActive]}
              onPress={() => setActiveCategory(i)}
            >
              <Text style={styles.catIcon}>{cat.icon}</Text>
              <Text style={[styles.catLabel, activeCategory === i && styles.catLabelActive]}>{cat.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View style={{ height: 16 }} />

      {/* Featured video */}
      <QueryState isLoading={tutorials.isLoading} isError={tutorials.isError} refetch={() => tutorials.refetch()} minHeight={220}>
        {featured && (
          <View style={styles.featuredCard}>
            <View style={styles.featuredThumb}>
              <View style={styles.playBtn}><Text style={styles.playIcon}>▶</Text></View>
              <View style={styles.durationBadge}>
                <Text style={styles.durationText}>{featured.duration}</Text>
              </View>
            </View>
            <View style={{ padding: 14 }}>
              <Text style={styles.featuredTitle}>{featured.title}</Text>
              <Text style={styles.featuredMeta}>
                {featured.author?.nickname} · {formatViewCount(featured.viewsCount)}次观看 · 3天前
              </Text>
              <View style={styles.tagRow}>
                {featured.tags.map((t) => <Tag key={t} label={t} />)}
              </View>
            </View>
          </View>
        )}
      </QueryState>

      <View style={{ height: 18 }} />

      {/* Tutorial list */}
      <View style={styles.pad}>
        <SectionHeader title="热门教程" actionLabel="更多 →" />
        <View style={{ height: 8 }} />
        {list.map((tut) => (
          <View key={tut.id} style={styles.tutItem}>
            <View style={styles.tutThumb}>
              <View style={styles.tutPlayBtn}><Text style={styles.tutPlayIcon}>▶</Text></View>
              <View style={styles.tutDuration}>
                <Text style={styles.tutDurationText}>{tut.duration}</Text>
              </View>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.tutTitle} numberOfLines={2}>{tut.title}</Text>
              <Text style={styles.tutMeta}>
                {tut.authorName} · {formatViewCount(tut.views)} 次观看 · {tut.time}
              </Text>
            </View>
          </View>
        ))}
      </View>

      <View style={{ height: 18 }} />

      {/* Articles */}
      <View style={styles.pad}>
        <SectionHeader title="精选文章" actionLabel="更多 →" />
        <View style={{ height: 8 }} />
        {articles.map((art) => (
          <View key={art.id} style={styles.articleCard}>
            <Text style={styles.articleEyebrow}>{art.eyebrow}</Text>
            <Text style={styles.articleTitle}>{art.title}</Text>
            <Text style={styles.articleExcerpt} numberOfLines={2}>{art.excerpt}</Text>
            <Text style={styles.articleMeta}>{art.meta}</Text>
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
  pad: { paddingHorizontal: spacing.screenPadding },
  catScroll: { paddingLeft: spacing.screenPadding },
  catRow: { flexDirection: 'row', gap: 8, paddingRight: spacing.screenPadding },
  catPill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12,
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
  },
  catPillActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  catIcon: { fontSize: 14 },
  catLabel: { fontSize: 13, color: colors.fg },
  catLabelActive: { color: '#fff' },
  featuredCard: {
    marginHorizontal: spacing.screenPadding,
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.lg, overflow: 'hidden',
  },
  featuredThumb: {
    height: 160, backgroundColor: colors.accentSoft,
    alignItems: 'center', justifyContent: 'center',
  },
  playBtn: {
    width: 48, height: 48, borderRadius: 24, backgroundColor: '#fff',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowRadius: 4, shadowOpacity: 0.1,
  },
  playIcon: { color: colors.accent, fontSize: 18, marginLeft: 3 },
  durationBadge: {
    position: 'absolute', bottom: 8, right: 8,
    backgroundColor: 'rgba(0,0,0,0.7)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4,
  },
  durationText: { fontFamily: 'monospace', fontSize: 11, color: '#fff' },
  featuredTitle: { fontSize: 16, fontWeight: '600', color: colors.fg, lineHeight: 22 },
  featuredMeta: { fontSize: 12, color: colors.muted, marginTop: 4 },
  tagRow: { flexDirection: 'row', gap: 4, flexWrap: 'wrap', marginTop: 8 },
  tutItem: {
    flexDirection: 'row', gap: 10, paddingVertical: 10,
    borderTopWidth: 1, borderTopColor: colors.border,
  },
  tutThumb: {
    width: 80, height: 56, borderRadius: 10, backgroundColor: colors.accentSoft,
    alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
  },
  tutPlayBtn: {
    width: 24, height: 24, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center', justifyContent: 'center',
  },
  tutPlayIcon: { color: colors.accent, fontSize: 10, marginLeft: 1 },
  tutDuration: {
    position: 'absolute', bottom: 3, right: 3,
    backgroundColor: 'rgba(0,0,0,0.7)', paddingHorizontal: 4, paddingVertical: 1, borderRadius: 3,
  },
  tutDurationText: { fontFamily: 'monospace', fontSize: 9, color: '#fff' },
  tutTitle: { fontSize: 14, fontWeight: '500', color: colors.fg, lineHeight: 20 },
  tutMeta: { fontSize: 11, color: colors.muted, marginTop: 3 },
  articleCard: {
    paddingVertical: 12, borderTopWidth: 1, borderTopColor: colors.border,
  },
  articleEyebrow: {
    fontFamily: 'monospace', fontSize: 11, color: colors.accent,
    letterSpacing: 0.06, textTransform: 'uppercase',
  },
  articleTitle: { fontSize: 16, fontWeight: '600', color: colors.fg, marginTop: 4 },
  articleExcerpt: { fontSize: 13, color: colors.muted, marginTop: 4, lineHeight: 20 },
  articleMeta: { fontSize: 12, color: colors.muted, marginTop: 6 },
});

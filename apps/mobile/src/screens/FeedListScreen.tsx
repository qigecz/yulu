import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '@yulu/ui';
import type { Feed } from '@yulu/shared';
import { formatRelativeTime } from '@yulu/shared';
import { useFeeds } from '../hooks/queries';
import { useUIStore } from '../store/ui';
import { QueryState } from '../components/QueryState';
import { FeedSkeleton } from '../components/Skeletons';

type SortKey = 'latest' | 'hot';

const CATS = ['全部', '关注', '爆护', '坑点报告', '技巧分享'];
const SORTS: { key: SortKey; label: string }[] = [
  { key: 'latest', label: '最新' },
  { key: 'hot', label: '热门' },
];

export function FeedListScreen() {
  const close = useUIStore((s) => s.closeOverlay);
  const openFeedDetail = useUIStore((s) => s.openFeedDetail);
  const openUser = useUIStore((s) => s.openUser);
  const openComposeFeed = useUIStore((s) => s.openComposeFeed);
  const feeds = useFeeds();

  const [cat, setCat] = useState('全部');
  const [sort, setSort] = useState<SortKey>('latest');

  const list = useMemo(() => {
    let arr = feeds.data ? [...feeds.data] : [];
    if (cat === '关注') arr = arr.filter((f) => f.authorFollowed);
    else if (cat !== '全部') arr = arr.filter((f) => f.category === cat);
    if (sort === 'latest') arr.sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''));
    if (sort === 'hot') arr.sort((a, b) => (b.likesCount ?? 0) - (a.likesCount ?? 0));
    return arr;
  }, [feeds.data, cat, sort]);

  const sortLabel = SORTS.find((s) => s.key === sort)?.label ?? '';

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.iconBtn} onPress={close} activeOpacity={0.7}>
            <Ionicons name="chevron-back" size={20} color={colors.fg} />
          </TouchableOpacity>
          <Text style={styles.hTitle}>钓友动态</Text>
          <TouchableOpacity style={[styles.iconBtn, styles.iconBtnCompose]} onPress={openComposeFeed} activeOpacity={0.8}>
            <Ionicons name="create-outline" size={18} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Category filter chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {CATS.map((c) => (
            <TouchableOpacity
              key={c}
              style={[styles.fchip, cat === c && styles.fchipOn]}
              onPress={() => setCat(c)}
              activeOpacity={0.7}
            >
              <Text style={[styles.fchipT, cat === c && styles.fchipTOn]}>{c}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Result row */}
        <View style={styles.resultRow}>
          <Text style={styles.rCount}>
            共 <Text style={styles.rCountStrong}>{list.length}</Text> 条动态 · 按{sortLabel}排序
          </Text>
          <View style={styles.sortGroup}>
            {SORTS.map((s) => (
              <TouchableOpacity
                key={s.key}
                style={[styles.sortBtn, sort === s.key && styles.sortBtnOn]}
                onPress={() => setSort(s.key)}
                activeOpacity={0.7}
              >
                <Text style={[styles.sortBtnT, sort === s.key && styles.sortBtnTOn]}>{s.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* List */}
        <View style={styles.listWrap}>
          {feeds.isLoading ? (
            <FeedSkeleton count={3} />
          ) : (
            <QueryState
              isLoading={false}
              isError={feeds.isError}
              refetch={() => feeds.refetch()}
              empty={list.length === 0}
              emptyText="该分类下暂无动态，去关注几位钓友吧"
            >
              {list.map((f) => (
                <FeedCard key={f.id} feed={f} onPress={() => openFeedDetail(f.id)} onAuthor={() => openUser(f.userId)} />
              ))}
            </QueryState>
          )}
        </View>

        {list.length > 0 && (
          <Text style={styles.listEnd}>— 已加载全部 {list.length} 条动态 —</Text>
        )}
      </ScrollView>
    </View>
  );
}

function FeedCard({ feed, onPress, onAuthor }: { feed: Feed; onPress: () => void; onAuthor: () => void }) {
  const hot = (feed.likesCount ?? 0) >= 300;
  const imgCount = feed.images?.length ?? 0;
  return (
    <TouchableOpacity style={styles.feedCard} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.fHead}>
        <TouchableOpacity onPress={onAuthor} activeOpacity={0.7}>
          <View style={styles.avatar} />
        </TouchableOpacity>
        <View style={styles.fWho}>
          <View style={styles.fNameRow}>
            <Text style={styles.fName}>{feed.user?.nickname || '钓友'}</Text>
            {feed.category === '爆护' && <View style={styles.fBadge}><Text style={styles.fBadgeT}>爆护</Text></View>}
            {feed.category !== '爆护' && feed.authorBadge && (
              <View style={styles.fBadge}><Text style={styles.fBadgeT}>{feed.authorBadge}</Text></View>
            )}
          </View>
          <Text style={styles.fLoc} numberOfLines={1}>
            {formatRelativeTime(feed.createdAt)} · {feed.location || ''}
          </Text>
        </View>
        {feed.category && <Text style={styles.fTime}>{feed.category}</Text>}
      </View>

      <Text style={styles.fText} numberOfLines={2}>{feed.content}</Text>

      {imgCount > 0 && (
        <View style={styles.fImgs}>
          {feed.images.slice(0, 3).map((_, i) => (
            <View key={i} style={styles.fImg}><Text style={styles.fImgT}>[照片]</Text></View>
          ))}
        </View>
      )}

      <View style={styles.fFoot}>
        <View style={[styles.fStat, hot && styles.fStatHot]}>
          <Ionicons name="heart-outline" size={14} color={hot ? colors.accent : colors.muted} />
          <Text style={[styles.fStatT, hot && { color: colors.accent }]}>{feed.likesCount}</Text>
        </View>
        <View style={styles.fStat}>
          <Ionicons name="chatbubble-outline" size={14} color={colors.muted} />
          <Text style={styles.fStatT}>{feed.commentsCount ?? 0}</Text>
        </View>
        <View style={styles.fStat}>
          <Ionicons name="share-social-outline" size={14} color={colors.muted} />
        </View>
        <Text style={styles.fMore}>详情 →</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },

  header: { paddingHorizontal: spacing.screenPadding, paddingVertical: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  iconBtn: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: colors.surface,
    borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center',
  },
  iconBtnCompose: { backgroundColor: colors.accent, borderColor: 'transparent' },
  hTitle: { fontSize: 18, fontWeight: '600', color: colors.fg, fontFamily: 'Georgia' },

  filterScroll: { gap: 8, paddingHorizontal: spacing.screenPadding, paddingTop: 6 },
  fchip: {
    paddingHorizontal: 14, paddingVertical: 7, backgroundColor: colors.surface,
    borderWidth: 1, borderColor: colors.border, borderRadius: 999,
  },
  fchipOn: { backgroundColor: colors.accent, borderColor: 'transparent' },
  fchipT: { fontSize: 13, color: colors.fg },
  fchipTOn: { color: '#fff', fontWeight: '600' },

  resultRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.screenPadding, paddingTop: 12, paddingBottom: 10,
  },
  rCount: { fontSize: 13, color: colors.muted },
  rCountStrong: { color: colors.fg, fontWeight: '600' },
  sortGroup: { flexDirection: 'row', gap: 4 },
  sortBtn: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  sortBtnOn: { backgroundColor: colors.accentSoft },
  sortBtnT: { fontSize: 12, color: colors.muted },
  sortBtnTOn: { color: colors.accent, fontWeight: '600' },

  listWrap: { paddingHorizontal: spacing.screenPadding, gap: 10 },
  feedCard: {
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
    borderRadius: 16, padding: 14,
  },
  fHead: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.accentSoft, borderWidth: 1, borderColor: colors.border },
  fWho: { flex: 1, minWidth: 0 },
  fNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  fName: { fontSize: 14, fontWeight: '600', color: colors.fg },
  fBadge: { backgroundColor: colors.accentSoft, paddingHorizontal: 7, paddingVertical: 2, borderRadius: 5 },
  fBadgeT: { fontSize: 9, color: colors.accent, letterSpacing: 0.5 },
  fLoc: { fontSize: 11, color: colors.muted, marginTop: 2 },
  fTime: { fontSize: 11, color: colors.muted },
  fText: { fontSize: 13, color: colors.fg, opacity: 0.85, lineHeight: 20, marginTop: 10 },
  fImgs: { flexDirection: 'row', gap: 6, marginTop: 10 },
  fImg: {
    width: 60, height: 60, borderRadius: 10, backgroundColor: colors.accentSoft,
    borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center',
  },
  fImgT: { fontSize: 9, color: colors.muted },
  fFoot: {
    flexDirection: 'row', alignItems: 'center', gap: 16, marginTop: 12,
    borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 10,
  },
  fStat: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  fStatHot: {},
  fStatT: { fontSize: 12, color: colors.muted },
  fMore: { marginLeft: 'auto', color: colors.accent, fontSize: 12, fontWeight: '500' },

  listEnd: { fontSize: 11, color: colors.muted, textAlign: 'center', paddingTop: 16 },
});

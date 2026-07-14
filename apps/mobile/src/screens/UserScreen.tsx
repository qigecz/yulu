import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing, fontSize, radius } from '@yulu/ui';
import { formatRelativeTime } from '@yulu/shared';
import { useUser, useUserFeeds, useToggleFollow } from '../hooks/queries';
import { QueryState } from '../components/QueryState';
import { Header } from '../components/FormControls';
import { useUIStore } from '../store/ui';
import { useAuthStore } from '../store/auth';

export function UserScreen() {
  const userId = useUIStore((s) => s.userId);
  const openFeedDetail = useUIStore((s) => s.openFeedDetail);
  const currentUserId = useAuthStore((s) => s.user?.id);
  const user = useUser(userId);
  const feeds = useUserFeeds(userId);
  const toggleFollow = useToggleFollow();

  const isSelf = userId === currentUserId;
  const profile = user.data;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <Header title="钓友主页" />

      <QueryState isLoading={user.isLoading} isError={user.isError} refetch={() => user.refetch()} minHeight={160}>
        {profile && (
          <>
            <View style={styles.profileRow}>
              <View style={styles.avatar}><Text style={styles.avatarIcon}>👤</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{profile.nickname}</Text>
                <Text style={styles.bio}>{profile.bio || '还没有简介'}</Text>
              </View>
            </View>

            <View style={styles.stats}>
              <Stat value={profile.spotsCount} label="坑点" />
              <Stat value={profile.routesCount} label="路线" />
              <Stat value={profile.followersCount} label="粉丝" />
              <Stat value={profile.followingCount ?? 0} label="关注" />
            </View>

            {!isSelf && (
              <TouchableOpacity
                style={[styles.followBtn, profile.isFollowing && styles.followingBtn]}
                onPress={() => toggleFollow.mutate({ id: profile.id, following: !!profile.isFollowing })}
                activeOpacity={0.7}
              >
                <Text style={[styles.followBtnText, profile.isFollowing && styles.followingBtnText]}>
                  {profile.isFollowing ? '已关注' : '＋ 关注'}
                </Text>
              </TouchableOpacity>
            )}
          </>
        )}
      </QueryState>

      <View style={{ height: 18 }} />

      <Text style={styles.sectionTitle}>他的动态</Text>
      <QueryState isLoading={feeds.isLoading} isError={feeds.isError} refetch={() => feeds.refetch()} empty={!(feeds.data && feeds.data.length)} emptyText="暂无动态" minHeight={80}>
        {feeds.data!.map((feed) => (
          <TouchableOpacity key={feed.id} style={styles.feedItem} onPress={() => openFeedDetail(feed.id)} activeOpacity={0.6}>
            <Text style={styles.feedContent} numberOfLines={2}>{feed.content}</Text>
            <Text style={styles.feedMeta}>{formatRelativeTime(feed.createdAt)} · {feed.location || ''} · ❤ {feed.likesCount}</Text>
          </TouchableOpacity>
        ))}
      </QueryState>
    </ScrollView>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <View style={styles.statCell}>
      <Text style={styles.statVal}>{value}</Text>
      <Text style={styles.statLbl}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, paddingHorizontal: spacing.screenPadding },
  profileRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: 4 },
  avatar: {
    width: 60, height: 60, borderRadius: 30, backgroundColor: colors.accentSoft,
    borderWidth: 2, borderColor: colors.border, alignItems: 'center', justifyContent: 'center',
  },
  avatarIcon: { fontSize: 28 },
  name: { fontSize: fontSize.h2, fontWeight: '600', color: colors.fg },
  bio: { fontSize: fontSize.meta, color: colors.muted, marginTop: 3 },
  stats: {
    flexDirection: 'row', marginTop: 16, paddingVertical: 14,
    borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.border,
  },
  statCell: { flex: 1, alignItems: 'center' },
  statVal: { fontFamily: 'Georgia', fontSize: fontSize.h2, fontWeight: '600', color: colors.fg },
  statLbl: { fontSize: fontSize.tiny, color: colors.muted, marginTop: 2 },
  followBtn: {
    marginTop: 16, paddingVertical: 12, borderRadius: radius.md, backgroundColor: colors.accent, alignItems: 'center',
  },
  followingBtn: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  followBtnText: { color: '#fff', fontSize: fontSize.body, fontWeight: '600' },
  followingBtnText: { color: colors.muted },
  sectionTitle: { fontSize: fontSize.h3, fontWeight: '600', color: colors.fg, marginBottom: 8 },
  feedItem: { paddingVertical: 12, borderTopWidth: 1, borderTopColor: colors.border },
  feedContent: { fontSize: fontSize.body, color: colors.fg, lineHeight: 20 },
  feedMeta: { fontSize: fontSize.tiny, color: colors.muted, marginTop: 4 },
});

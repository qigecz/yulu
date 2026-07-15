import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { colors, spacing, fontSize, radius, SectionHeader } from '@yulu/ui';
import { useAuthStore } from '../store/auth';
import { useUIStore } from '../store/ui';
import { useRoutes, useTutorials } from '../hooks/queries';
import { QueryState } from '../components/QueryState';

export function ProfileScreen() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const openCreateSpot = useUIStore((s) => s.openCreateSpot);
  const openComposeFeed = useUIStore((s) => s.openComposeFeed);
  const openFavorites = useUIStore((s) => s.openFavorites);
  const openOfflineRoutes = useUIStore((s) => s.openOfflineRoutes);
  const routes = useRoutes();
  const tutorials = useTutorials();
  const [refreshing, setRefreshing] = useState(false);

  const myRoutes = routes.data ?? [];
  const myTutorials = (tutorials.data ?? []).slice(0, 2);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([routes.refetch(), tutorials.refetch()].map((p) => p.catch(() => undefined)));
    setRefreshing(false);
  };

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />}
    >
      {/* Profile header */}
      <View style={styles.profileHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarIcon}>👤</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.profileName}>{user?.nickname ?? '钓友'}</Text>
          <Text style={styles.profileBio}>{user?.bio ?? '还没有个人简介'}</Text>
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        {[
          { value: user?.spotsCount ?? 0, label: '分享坑点' },
          { value: user?.routesCount ?? 0, label: '分享路线' },
          { value: user?.likesCount ?? 0, label: '获赞' },
          { value: user?.followersCount ?? 0, label: '粉丝' },
        ].map((stat) => (
          <View key={stat.label} style={styles.statCell}>
            <Text style={styles.statVal}>{stat.value}</Text>
            <Text style={styles.statLbl}>{stat.label}</Text>
          </View>
        ))}
      </View>

      {/* Share actions */}
      <View style={styles.shareActions}>
        <TouchableOpacity style={styles.shareBtnPrimary} onPress={openCreateSpot} activeOpacity={0.7}>
          <Text style={styles.shareBtnText}>📍 分享坑点</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.shareBtn} onPress={openComposeFeed} activeOpacity={0.7}>
          <Text style={styles.shareBtnTextDark}>📝 发布动态</Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: 18 }} />

      {/* My routes */}
      <View style={styles.pad}>
        <SectionHeader title="我的路线" actionLabel="全部 →" />
        <QueryState isLoading={routes.isLoading} isError={routes.isError} refetch={() => routes.refetch()} empty={myRoutes.length === 0} emptyText="暂无分享路线">
          {myRoutes.map((route) => (
            <View key={route.id} style={styles.myItem}>
              <View style={styles.itemIcon}><Text>🗺</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemTitle}>{route.name}</Text>
                <Text style={styles.itemSub}>{route.totalDistance}km · {route.downloadsCount} 次下载</Text>
              </View>
              <Text style={styles.itemMeta}>3天前</Text>
            </View>
          ))}
        </QueryState>
      </View>

      <View style={{ height: 14 }} />

      {/* My tips */}
      <View style={styles.pad}>
        <SectionHeader title="我的技巧分享" actionLabel="全部 →" />
        <QueryState isLoading={tutorials.isLoading} isError={tutorials.isError} refetch={() => tutorials.refetch()} empty={myTutorials.length === 0} emptyText="暂无技巧分享">
          {myTutorials.map((tut) => (
            <View key={tut.id} style={styles.myItem}>
              <View style={styles.itemIcon}><Text>📖</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemTitle}>{tut.title}</Text>
                <Text style={styles.itemSub}>128 次收藏 · 42 条评论</Text>
              </View>
              <Text style={styles.itemMeta}>5天前</Text>
            </View>
          ))}
        </QueryState>
      </View>

      <View style={{ height: 14 }} />

      {/* Menu */}
      <View style={styles.pad}>
        {([
          { icon: '⭐', label: '我的收藏', onPress: openFavorites },
          { icon: '📥', label: '离线路线', onPress: openOfflineRoutes },
          { icon: '🛒', label: '渔具商城订单' },
          { icon: '⚙', label: '设置' },
        ] as { icon: string; label: string; onPress?: () => void }[]).map((item) => {
          const Row = (
            <>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Text>{item.icon}</Text>
                <Text style={styles.menuLabel}>{item.label}</Text>
              </View>
              <Text style={styles.menuArrow}>›</Text>
            </>
          );
          return item.onPress ? (
            <TouchableOpacity key={item.label} style={styles.menuItem} onPress={item.onPress} activeOpacity={0.6}>
              {Row}
            </TouchableOpacity>
          ) : (
            <View key={item.label} style={styles.menuItem}>{Row}</View>
          );
        })}

        {/* Logout */}
        <TouchableOpacity
          style={styles.logoutRow}
          onPress={() => Alert.alert('退出登录', '确定要退出当前账号吗？', [
            { text: '取消', style: 'cancel' },
            { text: '退出', style: 'destructive', onPress: () => void logout() },
          ])}
        >
          <Text style={styles.logoutText}>退出登录</Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: 80 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  profileHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    paddingHorizontal: spacing.screenPadding, paddingVertical: 12,
  },
  avatar: {
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: colors.accentSoft, borderWidth: 2, borderColor: colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarIcon: { fontSize: 28 },
  profileName: { fontSize: 20, fontWeight: '600', color: colors.fg },
  profileBio: { fontSize: 13, color: colors.muted, marginTop: 2 },
  statsRow: {
    flexDirection: 'row', marginHorizontal: spacing.screenPadding,
    paddingVertical: 14, borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.border,
  },
  statCell: { flex: 1, alignItems: 'center' },
  statVal: { fontFamily: 'Georgia', fontSize: 22, fontWeight: '600', color: colors.fg },
  statLbl: { fontSize: 11, color: colors.muted, marginTop: 2 },
  shareActions: {
    flexDirection: 'row', gap: 10, marginHorizontal: spacing.screenPadding, marginTop: 14,
  },
  shareBtnPrimary: {
    flex: 1, height: 44, borderRadius: radius.md,
    backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center',
  },
  shareBtn: {
    flex: 1, height: 44, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center',
  },
  shareBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  shareBtnTextDark: { color: colors.fg, fontSize: 14, fontWeight: '600' },
  pad: { paddingHorizontal: spacing.screenPadding },
  myItem: {
    flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10,
    borderTopWidth: 1, borderTopColor: colors.border,
  },
  itemIcon: {
    width: 36, height: 36, borderRadius: 10, backgroundColor: colors.accentSoft,
    alignItems: 'center', justifyContent: 'center',
  },
  itemTitle: { fontSize: 14, fontWeight: '500', color: colors.fg },
  itemSub: { fontSize: 11, color: colors.muted, marginTop: 1 },
  itemMeta: { fontSize: 11, color: colors.muted },
  menuItem: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 13, borderTopWidth: 1, borderTopColor: colors.border,
  },
  menuLabel: { fontSize: 15, color: colors.fg },
  menuArrow: { color: colors.muted, fontSize: 18 },
  logoutRow: {
    paddingVertical: 13, marginTop: 4, alignItems: 'center',
    borderTopWidth: 1, borderTopColor: colors.border,
  },
  logoutText: { fontSize: 15, color: colors.danger, fontWeight: '500' },
});

import React, { useRef, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, SectionHeader } from '@yulu/ui';
import { useAuthStore } from '../store/auth';
import { useUIStore } from '../store/ui';
import { useOfflineStore } from '../store/offline';
import { useRoutes, useTutorials, useFavoriteSpots, useFavoriteFeeds } from '../hooks/queries';
import { QueryState } from '../components/QueryState';
import { PublishSheet, type PublishType } from '../components/PublishSheet';

/** 发布面板模拟产出的条目（真实接口接入前仅存在于本地）。 */
type LocalItem = { id: string; title: string; sub: string; time: string };

export function ProfileScreen() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const openCreateSpot = useUIStore((s) => s.openCreateSpot);
  const openFavorites = useUIStore((s) => s.openFavorites);
  const openOfflineRoutes = useUIStore((s) => s.openOfflineRoutes);
  const openMall = useUIStore((s) => s.openMall);
  const routes = useRoutes();
  const tutorials = useTutorials();
  const favoriteSpots = useFavoriteSpots();
  const favoriteFeeds = useFavoriteFeeds();
  const offlineCount = useOfflineStore((s) => s.routes.length);
  const [refreshing, setRefreshing] = useState(false);

  // 发布面板：类型 + 可见性，以及模拟发布产出的本地条目/统计。
  const [sheet, setSheet] = useState<PublishType | null>(null);
  const [localRoutes, setLocalRoutes] = useState<LocalItem[]>([]);
  const [localTips, setLocalTips] = useState<LocalItem[]>([]);
  const [routeBump, setRouteBump] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const myRoutes = routes.data ?? [];
  const myTutorials = (tutorials.data ?? []).slice(0, 2);
  const favCount = (favoriteSpots.data?.length ?? 0) + (favoriteFeeds.data?.length ?? 0);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([routes.refetch(), tutorials.refetch()].map((p) => p.catch(() => undefined)));
    setRefreshing(false);
  };

  const showToast = (msg: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast(msg);
    toastTimer.current = setTimeout(() => setToast(null), 2200);
  };

  const handlePublished = (type: PublishType, title: string) => {
    if (type === 'route') {
      setLocalRoutes((prev) => [{ id: `local-r-${prev.length + 1}`, title, sub: '新路线 · 审核中', time: '刚刚' }, ...prev]);
      setRouteBump((n) => n + 1);
    } else {
      setLocalTips((prev) => [{ id: `local-t-${prev.length + 1}`, title, sub: '0 次收藏 · 0 条评论', time: '刚刚' }, ...prev]);
    }
    showToast('发布成功，感谢分享');
  };

  const menu = [
    { icon: 'bookmark-outline' as const, label: '我的收藏', count: favCount > 0 ? String(favCount) : undefined, onPress: openFavorites },
    { icon: 'download-outline' as const, label: '离线路线', count: offlineCount > 0 ? `${offlineCount} 已下载` : undefined, onPress: openOfflineRoutes },
    { icon: 'receipt-outline' as const, label: '渔具商城订单', count: '待收货 1', onPress: openMall },
    {
      icon: 'settings-outline' as const, label: '设置', count: undefined,
      onPress: () => Alert.alert('设置', '设置功能开发中，敬请期待'),
    },
  ];

  return (
    <View style={styles.wrapper}>
      <ScrollView
        style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />}
    >
      {/* Profile header */}
      <View style={styles.profileHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{(user?.nickname ?? '钓').charAt(0)}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <View style={styles.nameRow}>
            <Text style={styles.profileName}>{user?.nickname ?? '钓友'}</Text>
            <View style={styles.badge}>
              <Ionicons name="star" size={10} color="#b8860b" />
              <Text style={styles.badgeText}>金牌探路者</Text>
            </View>
          </View>
          <Text style={styles.profileBio} numberOfLines={1}>{user?.bio ?? '还没有个人简介'}</Text>
        </View>
        <TouchableOpacity
          style={styles.editBtn}
          activeOpacity={0.7}
          onPress={() => Alert.alert('编辑资料', '资料编辑功能开发中，敬请期待')}
        >
          <Text style={styles.editBtnText}>编辑资料</Text>
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        {[
          { value: user?.spotsCount ?? 0, label: '分享坑点' },
          { value: (user?.routesCount ?? 0) + routeBump, label: '分享路线' },
          { value: user?.likesCount ?? 0, label: '获赞' },
          { value: user?.followersCount ?? 0, label: '粉丝' },
        ].map((stat) => (
          <View key={stat.label} style={styles.statCell}>
            <Text style={styles.statVal}>{stat.value}</Text>
            <Text style={styles.statLbl}>{stat.label}</Text>
          </View>
        ))}
      </View>

      {/* Publish entries */}
      <View style={styles.publishRow}>
        <TouchableOpacity style={styles.pubBtnPrimary} onPress={openCreateSpot} activeOpacity={0.8}>
          <Ionicons name="location-outline" size={19} color="#fff" />
          <Text style={styles.pubBtnTextLight}>分享坑点</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.pubBtn} onPress={() => setSheet('route')} activeOpacity={0.8}>
          <Ionicons name="layers-outline" size={19} color={colors.fg} />
          <Text style={styles.pubBtnText}>分享路线</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.pubBtn} onPress={() => setSheet('tip')} activeOpacity={0.8}>
          <Ionicons name="book-outline" size={19} color={colors.fg} />
          <Text style={styles.pubBtnText}>技巧分享</Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: 18 }} />

      {/* My routes */}
      <View style={styles.pad}>
        <SectionHeader title="我的路线" actionLabel="全部 →" />
        <QueryState isLoading={routes.isLoading} isError={routes.isError} refetch={() => routes.refetch()} empty={myRoutes.length === 0 && localRoutes.length === 0} emptyText="暂无分享路线">
          {localRoutes.map((item) => (
            <View key={item.id} style={styles.myItem}>
              <View style={styles.itemIcon}><Ionicons name="map-outline" size={16} color={colors.accent} /></View>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemTitle} numberOfLines={1}>{item.title}</Text>
                <Text style={styles.itemSub}>{item.sub}</Text>
              </View>
              <Text style={styles.itemMetaFresh}>{item.time}</Text>
            </View>
          ))}
          {myRoutes.map((route) => (
            <View key={route.id} style={styles.myItem}>
              <View style={styles.itemIcon}><Ionicons name="map-outline" size={16} color={colors.accent} /></View>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemTitle} numberOfLines={1}>{route.name}</Text>
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
        <QueryState isLoading={tutorials.isLoading} isError={tutorials.isError} refetch={() => tutorials.refetch()} empty={myTutorials.length === 0 && localTips.length === 0} emptyText="暂无技巧分享">
          {localTips.map((item) => (
            <View key={item.id} style={styles.myItem}>
              <View style={styles.itemIcon}><Ionicons name="book-outline" size={16} color={colors.accent} /></View>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemTitle} numberOfLines={1}>{item.title}</Text>
                <Text style={styles.itemSub}>{item.sub}</Text>
              </View>
              <Text style={styles.itemMetaFresh}>{item.time}</Text>
            </View>
          ))}
          {myTutorials.map((tut) => (
            <View key={tut.id} style={styles.myItem}>
              <View style={styles.itemIcon}><Ionicons name="book-outline" size={16} color={colors.accent} /></View>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemTitle} numberOfLines={1}>{tut.title}</Text>
                <Text style={styles.itemSub}>{tut.likesCount} 次点赞 · {tut.viewsCount} 次观看</Text>
              </View>
              <Text style={styles.itemMeta}>5天前</Text>
            </View>
          ))}
        </QueryState>
      </View>

      <View style={{ height: 14 }} />

      {/* Menu (card) */}
      <View style={[styles.menuCard, styles.mx]}>
        {menu.map((item, i) => {
          const Row = (
            <>
              <View style={styles.menuLeft}>
                <View style={styles.menuIcon}>
                  <Ionicons name={item.icon} size={16} color={colors.fg} />
                </View>
                <Text style={styles.menuLabel}>{item.label}</Text>
              </View>
              <View style={styles.menuRight}>
                {!!item.count && <Text style={styles.menuCount}>{item.count}</Text>}
                <Text style={styles.menuArrow}>›</Text>
              </View>
            </>
          );
          return (
            <TouchableOpacity
              key={item.label}
              style={[styles.menuItem, i === 0 && { borderTopWidth: 0 }]}
              onPress={item.onPress}
              activeOpacity={0.6}
            >
              {Row}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Logout */}
      <View style={[styles.mx, { marginTop: 12 }]}>
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

      {/* 发布面板（路线/技巧） */}
      <PublishSheet
        visible={sheet !== null}
        initialType={sheet ?? 'route'}
        onClose={() => setSheet(null)}
        onPublished={handlePublished}
      />

      </ScrollView>

      {/* Toast */}
      {toast && (
        <View style={styles.toast}>
          <Ionicons name="checkmark" size={14} color="#7dd8c3" />
          <Text style={styles.toastText}>{toast}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1 },
  container: { flex: 1, backgroundColor: colors.bg },
  mx: { marginHorizontal: spacing.screenPadding },
  profileHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    paddingHorizontal: spacing.screenPadding, paddingVertical: 12,
  },
  avatar: {
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: colors.accentSoft, borderWidth: 2, borderColor: colors.surface,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontFamily: 'Georgia', fontSize: 24, fontWeight: '600', color: colors.accent },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  profileName: { fontFamily: 'Georgia', fontSize: 21, fontWeight: '600', color: colors.fg, letterSpacing: -0.01 },
  badge: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    paddingHorizontal: 8, paddingVertical: 2, borderRadius: radius.pill,
    backgroundColor: 'rgba(184, 134, 11, 0.14)',
  },
  badgeText: { fontSize: 10, fontWeight: '600', color: '#b8860b' },
  profileBio: { fontSize: 12, color: colors.muted, marginTop: 3 },
  editBtn: {
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: radius.pill,
    borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, flexShrink: 0,
  },
  editBtnText: { fontSize: 12, color: colors.fg },
  statsRow: {
    flexDirection: 'row', marginHorizontal: spacing.screenPadding,
    paddingVertical: 13, borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  statCell: { flex: 1, alignItems: 'center' },
  statVal: { fontFamily: 'Georgia', fontSize: 21, fontWeight: '600', color: colors.fg },
  statLbl: { fontSize: 11, color: colors.muted, marginTop: 2 },
  publishRow: {
    flexDirection: 'row', gap: 8, marginHorizontal: spacing.screenPadding, marginTop: 14,
  },
  pubBtnPrimary: {
    flex: 1, minHeight: 58, borderRadius: radius.md,
    backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center', gap: 5,
  },
  pubBtn: {
    flex: 1, minHeight: 58, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface,
    alignItems: 'center', justifyContent: 'center', gap: 5,
  },
  pubBtnTextLight: { color: '#fff', fontSize: 12, fontWeight: '600' },
  pubBtnText: { color: colors.fg, fontSize: 12, fontWeight: '600' },
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
  itemMeta: { fontFamily: 'monospace', fontSize: 11, color: colors.muted },
  itemMetaFresh: { fontFamily: 'monospace', fontSize: 11, color: colors.accent },
  menuCard: {
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.lg, paddingHorizontal: 16, paddingVertical: 4,
  },
  menuItem: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 13, borderTopWidth: 1, borderTopColor: colors.border,
  },
  menuLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  menuIcon: {
    width: 32, height: 32, borderRadius: 8, backgroundColor: colors.fgSoft,
    alignItems: 'center', justifyContent: 'center',
  },
  menuLabel: { fontSize: 15, color: colors.fg },
  menuRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  menuCount: { fontFamily: 'monospace', fontSize: 12, color: colors.muted },
  menuArrow: { color: colors.muted, fontSize: 16 },
  logoutRow: {
    paddingVertical: 13, alignItems: 'center',
    borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, backgroundColor: colors.surface,
  },
  logoutText: { fontSize: 15, color: colors.danger, fontWeight: '500' },
  toast: {
    position: 'absolute', bottom: 120, alignSelf: 'center',
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: colors.fg, paddingHorizontal: 18, paddingVertical: 10, borderRadius: 999,
    shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowRadius: 12, shadowOpacity: 0.3,
  },
  toastText: { fontSize: 13, color: '#fff' },
});

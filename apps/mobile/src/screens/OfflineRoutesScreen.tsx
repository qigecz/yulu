import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { colors, spacing, fontSize, radius } from '@yulu/ui';
import { useOfflineStore } from '../store/offline';

/**
 * Lists routes the user has downloaded for offline use (persisted in
 * AsyncStorage). Each entry can be removed after confirmation.
 */
export function OfflineRoutesScreen() {
  const routes = useOfflineStore((s) => s.routes);
  const removeRoute = useOfflineStore((s) => s.removeRoute);

  const confirmRemove = (id: string, name: string) => {
    Alert.alert('删除离线路线', `确定从离线缓存移除「${name}」吗？`, [
      { text: '取消', style: 'cancel' },
      { text: '删除', style: 'destructive', onPress: () => removeRoute(id) },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 60 }} showsVerticalScrollIndicator={false}>
      <Text style={styles.header}>离线路线</Text>
      <Text style={styles.subhead}>已下载的路线可在无网络下查看导航。</Text>

      {routes.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>📥</Text>
          <Text style={styles.emptyText}>还没有离线路线</Text>
          <Text style={styles.emptySub}>在「坑点」页下载路线，即可离线查看。</Text>
        </View>
      ) : (
        <View style={styles.list}>
          {routes.map((route) => (
            <View key={route.id} style={styles.item}>
              <View style={styles.icon}><Text>🗺</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemTitle}>{route.name}</Text>
                <Text style={styles.itemSub}>
                  {route.spots.length} 坑点 · {route.totalDistance ?? '-'}km · {route.uploader?.nickname || '未知'}
                </Text>
                <View style={styles.offlineTag}>
                  <Text style={styles.offlineTagText}>✓ 离线可用</Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.removeBtn}
                onPress={() => confirmRemove(route.id, route.name)}
                activeOpacity={0.6}
              >
                <Text style={styles.removeText}>删除</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: {
    fontFamily: 'Georgia', fontSize: fontSize.h1, letterSpacing: -0.02, color: colors.fg,
    paddingHorizontal: spacing.screenPadding, paddingTop: 10,
  },
  subhead: { fontSize: fontSize.meta, color: colors.muted, paddingHorizontal: spacing.screenPadding, marginTop: 4 },
  empty: { alignItems: 'center', justifyContent: 'center', paddingTop: 90 },
  emptyEmoji: { fontSize: 44 },
  emptyText: { fontSize: fontSize.body, color: colors.fg, marginTop: spacing.sm },
  emptySub: { fontSize: fontSize.meta, color: colors.muted, marginTop: 4 },
  list: { paddingHorizontal: spacing.screenPadding, marginTop: spacing.md },
  item: {
    flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12,
    borderTopWidth: 1, borderTopColor: colors.border,
  },
  icon: {
    width: 40, height: 40, borderRadius: radius.md, backgroundColor: colors.accentSoft,
    alignItems: 'center', justifyContent: 'center',
  },
  itemTitle: { fontSize: fontSize.body, fontWeight: '500', color: colors.fg },
  itemSub: { fontSize: fontSize.small, color: colors.muted, marginTop: 2 },
  offlineTag: {
    alignSelf: 'flex-start', marginTop: 6, paddingHorizontal: 8, paddingVertical: 2,
    borderRadius: 999, backgroundColor: colors.accentSoft,
  },
  offlineTagText: { fontSize: fontSize.tiny, color: colors.accent, fontWeight: '600' },
  removeBtn: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: radius.sm,
    borderWidth: 1, borderColor: colors.border,
  },
  removeText: { fontSize: fontSize.meta, color: colors.danger, fontWeight: '600' },
});

import React, { useMemo, useRef, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius } from '@yulu/ui';
import { useUIStore } from '../store/ui';
import { mockMessages, type MockMessage } from '../mock/data';

type MsgCat = MockMessage['cat'] | 'all';

const CATS: { key: MockMessage['cat']; name: string; icon: React.ComponentProps<typeof Ionicons>['name'] }[] = [
  { key: 'bite', name: '出鱼提醒', icon: 'water-outline' },
  { key: 'star', name: '赞与收藏', icon: 'star-outline' },
  { key: 'cmt', name: '评论与@', icon: 'chatbubble-outline' },
  { key: 'sys', name: '系统通知', icon: 'information-circle-outline' },
];
const catName = (c: MockMessage['cat']) => CATS.find((x) => x.key === c)?.name ?? '';

/**
 * 消息中心（对照 ios-messages.html）：四个分类入口（未读角标，点击筛选）、
 * 消息列表（分类、标题、摘要、时间、未读点）、全部已读。点击消息进详情并标记已读。
 */
export function MessagesScreen() {
  const close = useUIStore((s) => s.closeOverlay);
  const openMessageDetail = useUIStore((s) => s.openMessageDetail);
  const [filter, setFilter] = useState<MsgCat>('all');
  // 已读状态本页内存维护（推送未接真实数据源）。
  const [read, setRead] = useState<Record<number, boolean>>({});

  const messages = useMemo(
    () => mockMessages.map((m) => ({ ...m, unread: m.unread && !read[m.id] })),
    [read],
  );
  const list = messages.filter((m) => filter === 'all' || m.cat === filter);
  const badge = (c: MockMessage['cat']) => messages.filter((m) => m.cat === c && m.unread).length;

  const open = (m: MockMessage) => {
    setRead((r) => ({ ...r, [m.id]: true }));
    openMessageDetail(m.id);
  };

  const readAll = () => {
    const all: Record<number, boolean> = {};
    mockMessages.forEach((m) => { all[m.id] = true; });
    setRead(all);
  };

  return (
    <View style={styles.wrapper}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        {/* Navbar */}
        <View style={styles.navbar}>
          <TouchableOpacity style={styles.navSide} onPress={close} activeOpacity={0.7}>
            <Ionicons name="chevron-back" size={18} color={colors.accent} />
            <Text style={styles.backText}>首页</Text>
          </TouchableOpacity>
          <Text style={styles.navTitle}>消息中心</Text>
          <TouchableOpacity style={styles.readAllBtn} onPress={readAll} activeOpacity={0.7}>
            <Text style={styles.readAllT}>全部已读</Text>
          </TouchableOpacity>
        </View>

        {/* 分类入口 */}
        <View style={styles.cats}>
          {CATS.map((c) => {
            const n = badge(c.key);
            return (
              <TouchableOpacity key={c.key} style={[styles.cat, filter === c.key && styles.catOn]} onPress={() => setFilter(filter === c.key ? 'all' : c.key)} activeOpacity={0.7}>
                <Text style={styles.catName}>{c.name}</Text>
                {n > 0 ? (
                  <View style={styles.catBadge}><Text style={styles.catBadgeT}>{n}</Text></View>
                ) : (
                  <Text style={styles.catZero}>0</Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.listLabel}>{filter === 'all' ? '全部消息' : catName(filter)}</Text>

        <View style={{ paddingHorizontal: 16 }}>
          {list.map((m) => (
            <TouchableOpacity key={m.id} style={styles.msgRow} onPress={() => open(m)} activeOpacity={0.7}>
              <View style={[styles.msgIcon, m.cat === 'bite' && { backgroundColor: colors.accentSoft }]}>
                <Ionicons name={CATS.find((c) => c.key === m.cat)!.icon} size={17} color={m.cat === 'bite' ? colors.accent : colors.fg} />
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <View style={styles.msgHead}>
                  <Text style={styles.msgCat}>{catName(m.cat)}</Text>
                  <Text style={styles.msgTime}>{m.time}</Text>
                </View>
                <Text style={[styles.msgTitle, m.unread && styles.msgTitleUnread]} numberOfLines={1}>{m.title}</Text>
                <Text style={styles.msgText} numberOfLines={2}>{m.text}</Text>
              </View>
              {m.unread && <View style={styles.dot} />}
            </TouchableOpacity>
          ))}
          {list.every((m) => !m.unread) && (
            <Text style={styles.allReadNote}>— 所有消息都已读 —</Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1 },
  container: { flex: 1, backgroundColor: colors.bg },
  navbar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 12, paddingTop: 10, paddingBottom: 8,
  },
  navSide: { flexDirection: 'row', alignItems: 'center', width: 74, paddingHorizontal: 4 },
  backText: { color: colors.accent, fontSize: 15 },
  navTitle: { fontFamily: 'Georgia', fontSize: 17, fontWeight: '600', color: colors.fg },
  readAllBtn: { paddingHorizontal: 4 },
  readAllT: { fontSize: 13, color: colors.accent },
  cats: {
    flexDirection: 'row', gap: 8, paddingHorizontal: 16, marginTop: 6, marginBottom: 12,
  },
  cat: {
    flex: 1, alignItems: 'center', gap: 6, paddingVertical: 13,
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg,
  },
  catOn: { borderColor: colors.accent, backgroundColor: colors.accentSoft },
  catName: { fontSize: 12.5, color: colors.fg },
  catBadge: { minWidth: 20, height: 20, borderRadius: 999, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 5 },
  catBadgeT: { fontSize: 11, color: '#fff', fontWeight: '600', fontFamily: 'monospace' },
  catZero: { fontSize: 11, color: colors.muted, fontFamily: 'monospace' },
  listLabel: { fontSize: 12, fontWeight: '600', color: colors.muted, marginHorizontal: 20, marginBottom: 6 },
  msgRow: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 11,
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.lg, padding: 14, marginBottom: 8,
  },
  msgIcon: {
    width: 36, height: 36, borderRadius: 10, backgroundColor: colors.fgSoft,
    alignItems: 'center', justifyContent: 'center',
  },
  msgHead: { flexDirection: 'row', justifyContent: 'space-between' },
  msgCat: { fontSize: 11, color: colors.accent, fontWeight: '600' },
  msgTime: { fontSize: 11, color: colors.muted, fontFamily: 'monospace' },
  msgTitle: { fontSize: 14, fontWeight: '500', color: colors.fg, marginTop: 3 },
  msgTitleUnread: { fontWeight: '700' },
  msgText: { fontSize: 12, color: colors.muted, marginTop: 3, lineHeight: 17 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.accent, marginTop: 5 },
  allReadNote: { textAlign: 'center', fontSize: 11.5, color: colors.muted, paddingVertical: 16 },
});

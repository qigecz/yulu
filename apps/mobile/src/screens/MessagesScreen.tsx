import React, { useMemo, useRef, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius } from '@yulu/ui';
import { useUIStore } from '../store/ui';
import { mockMessages, type MockMessage } from '../mock/data';

type MsgCat = MockMessage['cat'] | 'all';

const CATS: { key: MockMessage['cat']; name: string; icon: React.ComponentProps<typeof Ionicons>['name']; color: string }[] = [
  { key: 'bite', name: '出鱼提醒', icon: 'water', color: colors.accent },
  { key: 'star', name: '赞与收藏', icon: 'star', color: '#b8860b' },
  { key: 'cmt', name: '评论与@', icon: 'chatbubble', color: '#4a7ba6' },
  { key: 'sys', name: '系统通知', icon: 'information-circle', color: '#8c9a93' },
];
const catName = (c: MockMessage['cat']) => CATS.find((x) => x.key === c)?.name ?? '';
const catColor = (c: MockMessage['cat']) => CATS.find((x) => x.key === c)?.color ?? colors.fg;
const catIcon = (c: MockMessage['cat']) => CATS.find((x) => x.key === c)?.icon ?? 'information-circle';

/**
 * 消息中心（对照 ios-messages.html）：四个分类入口（未读角标，点击筛选）、
 * 消息列表（分类、标题、摘要、时间、未读点）、全部已读。点击消息进详情并标记已读。
 */
export function MessagesScreen() {
  const close = useUIStore((s) => s.closeOverlay);
  const openMessageDetail = useUIStore((s) => s.openMessageDetail);
  const setMessagesUnread = useUIStore((s) => s.setMessagesUnread);
  const [filter, setFilter] = useState<MsgCat>('all');
  // 已读状态本页内存维护（推送未接真实数据源）。
  const [read, setRead] = useState<Record<number, boolean>>({});
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showToast = (msg: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast(msg);
    toastTimer.current = setTimeout(() => setToast(null), 1800);
  };

  const messages = useMemo(
    () => mockMessages.map((m) => ({ ...m, unread: m.unread && !read[m.id] })),
    [read],
  );
  const list = messages.filter((m) => filter === 'all' || m.cat === filter);
  const badge = (c: MockMessage['cat']) => messages.filter((m) => m.cat === c && m.unread).length;
  const unreadTotal = () => messages.filter((m) => m.unread).length;

  const open = (m: MockMessage) => {
    setRead((r) => ({ ...r, [m.id]: true }));
    // 读完最后一条未读时清掉首页红点。
    const restAllRead = mockMessages.every((x) => x.id === m.id || read[x.id] || !x.unread);
    if (restAllRead) setMessagesUnread(false);
    openMessageDetail(m.id);
  };

  const readAll = () => {
    if (unreadTotal() === 0) {
      showToast('没有未读消息');
      return;
    }
    const all: Record<number, boolean> = {};
    mockMessages.forEach((m) => { all[m.id] = true; });
    setRead(all);
    setMessagesUnread(false);
    showToast('已全部标记为已读');
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
                ) : null}
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.listLabel}>{filter === 'all' ? '全部消息' : catName(filter)}</Text>

        <View style={{ paddingHorizontal: 16 }}>
          {list.map((m) => (
            <TouchableOpacity
              key={m.id}
              style={[styles.msgRow, m.unread && styles.msgRowUnread]}
              onPress={() => open(m)}
              activeOpacity={0.7}
            >
              <View style={[styles.msgIcon, { backgroundColor: catColor(m.cat) }]}>
                <Ionicons name={catIcon(m.cat)} size={17} color="#fff" />
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <View style={styles.msgHead}>
                  <View style={styles.msgCatWrap}>
                    {m.unread && <View style={styles.msgDot} />}
                    <Text style={styles.msgCat}>{catName(m.cat)}</Text>
                  </View>
                  <Text style={styles.msgTime}>{m.time}</Text>
                </View>
                <Text style={[styles.msgTitle, m.unread && styles.msgTitleUnread]} numberOfLines={1}>{m.title}</Text>
                <Text style={styles.msgText} numberOfLines={2}>{m.text}</Text>
              </View>
            </TouchableOpacity>
          ))}
          {list.every((m) => !m.unread) && (
            <Text style={styles.allReadNote}>— 所有消息都已读 —</Text>
          )}
        </View>
      </ScrollView>

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
  catBadge: { minWidth: 20, height: 20, borderRadius: 999, backgroundColor: '#d9483a', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 5 },
  catBadgeT: { fontSize: 11, color: '#fff', fontWeight: '600', fontFamily: 'monospace' },
  listLabel: { fontSize: 12, fontWeight: '600', color: colors.muted, marginHorizontal: 20, marginBottom: 6 },
  msgRow: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 11,
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.lg, padding: 14, marginBottom: 8,
  },
  msgRowUnread: { borderColor: colors.accent },
  msgIcon: {
    width: 36, height: 36, borderRadius: 10, backgroundColor: colors.fgSoft,
    alignItems: 'center', justifyContent: 'center',
  },
  msgHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  msgCatWrap: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  msgDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#d9483a' },
  msgCat: { fontSize: 11, color: colors.accent, fontWeight: '600' },
  msgTime: { fontSize: 11, color: colors.muted, fontFamily: 'monospace' },
  msgTitle: { fontSize: 14, fontWeight: '500', color: colors.fg, marginTop: 3 },
  msgTitleUnread: { fontWeight: '700' },
  msgText: { fontSize: 12, color: colors.muted, marginTop: 3, lineHeight: 17 },
  allReadNote: { textAlign: 'center', fontSize: 11.5, color: colors.muted, paddingVertical: 16 },
  toast: {
    position: 'absolute', bottom: 110, alignSelf: 'center',
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: colors.fg, paddingHorizontal: 18, paddingVertical: 10, borderRadius: 999,
    shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowRadius: 12, shadowOpacity: 0.3,
  },
  toastText: { fontSize: 13, color: '#fff' },
});

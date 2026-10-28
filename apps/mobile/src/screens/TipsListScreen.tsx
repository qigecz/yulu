import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius } from '@yulu/ui';
import { useUIStore } from '../store/ui';
import { mockMyTips } from '../mock/data';

const CAT_CHIPS = ['全部', '路亚', '台钓', '装备', '绑钩'];

/**
 * 我的技巧分享列表（对照 ios-tips-list.html）：分类筛选 chips、计数行、
 * 技巧条目（收藏/评论数、发布时间、热门徽标）、空态。
 */
export function TipsListScreen() {
  const close = useUIStore((s) => s.closeOverlay);
  const setActiveTab = useUIStore((s) => s.setActiveTab);
  const closeAndGo = () => {
    close();
    setActiveTab('learn');
  };
  const [cat, setCat] = useState('全部');

  const list = useMemo(
    () => (cat === '全部' ? mockMyTips : mockMyTips.filter((t) => t.cat === cat)),
    [cat],
  );
  const totalFav = mockMyTips.reduce((s, t) => s + t.fav, 0);

  return (
    <View style={styles.wrapper}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        {/* Navbar */}
        <View style={styles.navbar}>
          <TouchableOpacity style={styles.navSide} onPress={close} activeOpacity={0.7}>
            <Ionicons name="chevron-back" size={18} color={colors.accent} />
            <Text style={styles.backText}>我的</Text>
          </TouchableOpacity>
          <Text style={styles.navTitle}>我的技巧分享</Text>
          <View style={styles.navSide} />
        </View>

        {/* 分类筛选 */}
        <View style={styles.chips}>
          {CAT_CHIPS.map((c) => (
            <TouchableOpacity
              key={c}
              style={[styles.chip, cat === c && styles.chipOn]}
              onPress={() => setCat(c)}
              activeOpacity={0.7}
            >
              <Text style={[styles.chipT, cat === c && styles.chipTOn]}>{c}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.countNote}>共 {mockMyTips.length} 篇 · 被收藏 {totalFav} 次</Text>

        {list.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>✍️</Text>
            <Text style={styles.emptyText}>这个分类下还没有技巧，去发一篇帮帮钓友们</Text>
            <TouchableOpacity style={styles.emptyBtn} onPress={closeAndGo} activeOpacity={0.8}>
              <Text style={styles.emptyBtnT}>去学习页看看</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={{ paddingHorizontal: 16 }}>
            {list.map((t) => (
              <View key={t.id} style={styles.tipRow}>
                <View style={styles.tipIcon}>
                  <Ionicons name="book-outline" size={17} color={colors.accent} />
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <View style={styles.tipHead}>
                    {t.hot && <View style={styles.hotTag}><Text style={styles.hotTagT}>热门</Text></View>}
                    <Text style={styles.tipTitle} numberOfLines={1}>{t.title}</Text>
                  </View>
                  <Text style={styles.tipNote} numberOfLines={2}>{t.note}</Text>
                  <View style={styles.tipFoot}>
                    <Ionicons name="star-outline" size={12} color={colors.muted} />
                    <Text style={styles.tipStat}>{t.fav}</Text>
                    <Ionicons name="chatbubble-outline" size={12} color={colors.muted} />
                    <Text style={styles.tipStat}>{t.cmt}</Text>
                    <Text style={styles.tipTime}>· {t.time}</Text>
                  </View>
                </View>
                <TouchableOpacity style={styles.tipCat} onPress={() => setCat(t.cat)} activeOpacity={0.7}>
                  <Text style={styles.tipCatT}>{t.cat}</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
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
  chips: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, marginTop: 4 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 999,
    borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface,
  },
  chipOn: { backgroundColor: colors.fg, borderColor: colors.fg },
  chipT: { fontSize: 12.5, color: colors.muted },
  chipTOn: { color: '#fff', fontWeight: '600' },
  countNote: { fontSize: 11.5, color: colors.muted, marginHorizontal: 20, marginTop: 12, marginBottom: 8, fontFamily: 'monospace' },
  tipRow: {
    flexDirection: 'row', alignItems: 'center', gap: 11,
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.lg, padding: 14, marginBottom: 8,
  },
  tipIcon: {
    width: 36, height: 36, borderRadius: 10, backgroundColor: colors.accentSoft,
    alignItems: 'center', justifyContent: 'center',
  },
  tipHead: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  hotTag: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 999, backgroundColor: 'rgba(232, 163, 61, 0.16)' },
  hotTagT: { fontSize: 10, color: '#e8a33d', fontWeight: '600' },
  tipTitle: { fontSize: 14, fontWeight: '500', color: colors.fg, flexShrink: 1 },
  tipNote: { fontSize: 11.5, color: colors.muted, marginTop: 4, lineHeight: 16 },
  tipFoot: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 7 },
  tipStat: { fontSize: 11, color: colors.muted, fontFamily: 'monospace', marginRight: 6 },
  tipTime: { fontSize: 11, color: colors.muted, fontFamily: 'monospace' },
  tipCat: { paddingHorizontal: 9, paddingVertical: 4, borderRadius: 999, backgroundColor: colors.fgSoft },
  tipCatT: { fontSize: 11, color: colors.muted },
  empty: { alignItems: 'center', paddingTop: 90 },
  emptyEmoji: { fontSize: 44 },
  emptyText: { fontSize: 13.5, color: colors.muted, marginTop: 12, marginHorizontal: 40, textAlign: 'center' },
  emptyBtn: { marginTop: 16, paddingHorizontal: 24, paddingVertical: 10, borderRadius: 999, backgroundColor: colors.accent },
  emptyBtnT: { color: '#fff', fontSize: 13.5, fontWeight: '600' },
});

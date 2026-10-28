import React, { useMemo, useRef, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius } from '@yulu/ui';
import { useUIStore } from '../store/ui';
import { mockMyTips } from '../mock/data';

const CAT_CHIPS = ['全部', '路亚', '台钓', '装备', '绑钩'];

/**
 * 我的技巧分享列表（对照 ios-tips-list.html）：分类筛选 chips、计数行
 * （全量/筛选两态）、技巧卡（可点、分类徽标、热门高亮、带词统计）、空态。
 */
export function TipsListScreen() {
  const close = useUIStore((s) => s.closeOverlay);
  const [cat, setCat] = useState('全部');

  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showToast = (msg: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast(msg);
    toastTimer.current = setTimeout(() => setToast(null), 1800);
  };

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

        <Text style={styles.countNote}>
          {cat === '全部' ? `共 ${mockMyTips.length} 篇 · 被收藏 ${totalFav} 次` : `「${cat}」分类 · 共 ${list.length} 篇`}
        </Text>

        {list.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>✍️</Text>
            <Text style={styles.emptyText}>这个分类下还没有技巧，去发一篇帮帮钓友们</Text>
            <TouchableOpacity style={styles.emptyBtn} onPress={close} activeOpacity={0.8}>
              <Text style={styles.emptyBtnT}>返回去分享</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={{ paddingHorizontal: 16 }}>
            {list.map((t) => (
              <TouchableOpacity
                key={t.id}
                style={styles.tipRow}
                activeOpacity={0.7}
                onPress={() => showToast('技巧详情即将上线，敬请期待')}
              >
                <View style={styles.tipIcon}>
                  <Ionicons name="book-outline" size={17} color={colors.accent} />
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={styles.tipTitle} numberOfLines={1}>{t.title}</Text>
                  <View style={styles.tipCatRow}>
                    <Text style={[styles.tipCatTag, t.hot && styles.tipCatTagHot]}>
                      {t.cat}{t.hot ? ' · 热门' : ''}
                    </Text>
                  </View>
                  <Text style={styles.tipNote} numberOfLines={2}>{t.note}</Text>
                  <View style={styles.tipFoot}>
                    <Text style={styles.tipStat}>{t.fav} 收藏 · {t.cmt} 评论</Text>
                    <Text style={styles.tipTime}>{t.time}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
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
  tipTitle: { fontSize: 14, fontWeight: '500', color: colors.fg, flexShrink: 1 },
  tipCatRow: { flexDirection: 'row', marginTop: 4 },
  tipCatTag: { fontSize: 10.5, color: colors.muted },
  tipCatTagHot: { color: colors.accent, fontWeight: '600' },
  tipNote: { fontSize: 11.5, color: colors.muted, marginTop: 4, lineHeight: 16 },
  tipFoot: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 7 },
  tipStat: { fontSize: 11, color: colors.muted },
  tipTime: { fontSize: 11, color: colors.muted, fontFamily: 'monospace' },
  empty: { alignItems: 'center', paddingTop: 90 },
  emptyEmoji: { fontSize: 44 },
  emptyText: { fontSize: 13.5, color: colors.muted, marginTop: 12, marginHorizontal: 40, textAlign: 'center' },
  emptyBtn: { marginTop: 16, paddingHorizontal: 24, paddingVertical: 10, borderRadius: 999, backgroundColor: colors.accent },
  emptyBtnT: { color: '#fff', fontSize: 13.5, fontWeight: '600' },
  toast: {
    position: 'absolute', bottom: 110, alignSelf: 'center',
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: colors.fg, paddingHorizontal: 18, paddingVertical: 10, borderRadius: 999,
    shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowRadius: 12, shadowOpacity: 0.3,
  },
  toastText: { fontSize: 13, color: '#fff' },
});

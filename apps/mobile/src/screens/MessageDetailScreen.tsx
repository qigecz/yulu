import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius } from '@yulu/ui';
import type { Route } from '@yulu/shared';
import { useUIStore } from '../store/ui';
import { useOfflineStore } from '../store/offline';
import { mockMessages, mockSpots, type MockMessage } from '../mock/data';

const CAT_NAMES: Record<MockMessage['cat'], string> = {
  bite: '出鱼提醒', star: '赞与收藏', cmt: '评论与@', sys: '系统通知',
};
const CAT_ICONS: Record<MockMessage['cat'], React.ComponentProps<typeof Ionicons>['name']> = {
  bite: 'water', star: 'star', cmt: 'chatbubble', sys: 'information-circle',
};

/**
 * 消息详情（对照 ios-message-detail.html）。出鱼提醒类渲染加强版：提醒主卡
 * （窗口指标 chips）+ 目标钓点卡 + 水温趋势示意；其余类别渲染通用正文卡。
 */
export function MessageDetailScreen({ message }: { message: MockMessage }) {
  const close = useUIStore((s) => s.closeOverlay);
  const openNavigation = useUIStore((s) => s.openNavigation);
  const downloadRoute = useOfflineStore((s) => s.downloadRoute);

  // 与钓点详情一致：以「碧溪湾」相关坑点合成单航点路线后进入应用内导航。
  const goNavigate = () => {
    const spot = mockSpots.find((s) => s.name.includes('碧溪湾'));
    if (!spot) return;
    const route: Route = {
      id: `spot-${spot.id}`, name: spot.name, tags: spot.fishSpecies,
      uploaderId: '', downloadsCount: 0, likesCount: spot.likesCount ?? 0,
      featured: false, spots: [{ spot, sortOrder: 1, distance: 0 }],
      createdAt: spot.createdAt, updatedAt: spot.updatedAt,
    };
    downloadRoute(route);
    openNavigation(route.id);
  };

  return (
    <View style={styles.wrapper}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        {/* Navbar */}
        <View style={styles.navbar}>
          <TouchableOpacity style={styles.navSide} onPress={close} activeOpacity={0.7}>
            <Ionicons name="chevron-back" size={18} color={colors.accent} />
            <Text style={styles.backText}>消息</Text>
          </TouchableOpacity>
          <Text style={styles.navTitle}>{CAT_NAMES[message.cat]}</Text>
          <View style={styles.navSide} />
        </View>

        {message.cat === 'bite' ? (
          <>
            {/* 提醒主卡 */}
            <View style={[styles.biteHero, styles.mx]}>
              <Text style={styles.biteEyebrow}>出鱼窗口提醒 · {message.time}</Text>
              <Text style={styles.biteTitle}>{message.title}</Text>
              <Text style={styles.biteSub}>{message.text}</Text>
              <View style={styles.winRow}>
                {[
                  { v: '18.5℃', l: '当前水温' },
                  { v: '86%', l: '近 7 天出鱼率' },
                  { v: '2.3km', l: '距你当前位置' },
                ].map((c) => (
                  <View key={c.l} style={styles.winChip}>
                    <Text style={styles.winV}>{c.v}</Text>
                    <Text style={styles.winL}>{c.l}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* 目标钓点 */}
            <View style={[styles.sect, styles.mx]}>
              <Text style={styles.sectTitle}>目标钓点</Text>
              <View style={styles.spotRow}>
                <View style={styles.spotThumb}>
                  <Ionicons name="location" size={16} color={colors.accent} />
                  <Text style={styles.spotThumbT}>碧溪湾</Text>
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={styles.spotName}>碧溪湾东岸乱石区 <Text style={styles.spotStars}>★ 4.8</Text></Text>
                  <View style={styles.spotStats}>
                    <Text style={styles.spotStat}><Text style={styles.spotStatB}>86</Text> 尾</Text>
                    <Text style={styles.spotStat}><Text style={styles.spotStatB}>2.3</Text> km</Text>
                    <Text style={styles.spotStat}>主攻 <Text style={styles.spotStatB}>路亚</Text></Text>
                  </View>
                  <Text style={styles.spotDesc}>千岛湖 · 东岸 · 乱石结构与回水湾交界</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.goBtn} onPress={goNavigate} activeOpacity={0.8}>
                <Ionicons name="compass-outline" size={15} color="#fff" />
                <Text style={styles.goBtnT}>导航前往</Text>
              </TouchableOpacity>
            </View>

            {/* 水温趋势（View 拼绘示意，对照原型 SVG 折线） */}
            <View style={[styles.sect, styles.mx]}>
              <Text style={styles.sectTitle}>今日水温趋势（水面下 0.5m）</Text>
              <View style={styles.chart}>
                {[16, 19, 22].map((t) => (
                  <Text key={t} style={styles.chartScale}>{t}℃</Text>
                ))}
                <View style={styles.chartBars}>
                  {[
                    { h: 34, w: false }, { h: 58, w: false }, { h: 86, w: true },
                    { h: 100, w: true }, { h: 72, w: false }, { h: 40, w: false },
                  ].map((b, i) => (
                    <View key={i} style={styles.chartCol}>
                      <View style={[styles.bar, { height: `${b.h}%` }, b.w && styles.barWin]} />
                    </View>
                  ))}
                </View>
                <Text style={styles.chartWinNote}>出鱼窗口 16-18 时</Text>
                <View style={styles.chartX}>
                  {['06时', '10时', '14时', '18时', '22时', '24时'].map((t) => (
                    <Text key={t} style={styles.chartXT}>{t}</Text>
                  ))}
                </View>
              </View>
            </View>
          </>
        ) : (
          <View style={[styles.sect, styles.mx]}>
            <View style={styles.genHead}>
              <View style={styles.genIcon}>
                <Ionicons name={CAT_ICONS[message.cat]} size={18} color={colors.accent} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.genTitle}>{message.title}</Text>
                <Text style={styles.genTime}>{CAT_NAMES[message.cat]} · {message.time}</Text>
              </View>
            </View>
            <Text style={styles.genText}>{message.text}</Text>
            {message.cat === 'sys' && (
              <TouchableOpacity style={styles.goBtn} onPress={close} activeOpacity={0.8}>
                <Text style={styles.goBtnT}>知道了</Text>
              </TouchableOpacity>
            )}
            {(message.cat === 'star' || message.cat === 'cmt') && (
              <TouchableOpacity style={[styles.goBtn, styles.goBtnGhost]} onPress={close} activeOpacity={0.8}>
                <Text style={[styles.goBtnT, styles.goBtnGhostT]}>查看我的内容</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1 },
  container: { flex: 1, backgroundColor: colors.bg },
  mx: { marginHorizontal: 16 },
  navbar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 12, paddingTop: 10, paddingBottom: 8,
  },
  navSide: { flexDirection: 'row', alignItems: 'center', width: 74, paddingHorizontal: 4 },
  backText: { color: colors.accent, fontSize: 15 },
  navTitle: { fontFamily: 'Georgia', fontSize: 17, fontWeight: '600', color: colors.fg },
  biteHero: {
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.lg, padding: 18, marginBottom: 12,
  },
  biteEyebrow: { fontSize: 11, color: colors.accent, fontWeight: '600', letterSpacing: 0.4 },
  biteTitle: { fontSize: 18, fontWeight: '700', color: colors.fg, marginTop: 8, lineHeight: 26 },
  biteSub: { fontSize: 13, color: colors.muted, marginTop: 6, lineHeight: 19 },
  winRow: { flexDirection: 'row', gap: 8, marginTop: 14 },
  winChip: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: radius.md, backgroundColor: colors.accentSoft },
  winV: { fontFamily: 'Georgia', fontSize: 17, fontWeight: '700', color: colors.accent },
  winL: { fontSize: 10.5, color: colors.muted, marginTop: 2 },
  sect: {
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.lg, padding: 16, marginBottom: 12,
  },
  sectTitle: { fontSize: 15, fontWeight: '600', color: colors.fg },
  spotRow: { flexDirection: 'row', gap: 12, marginTop: 12 },
  spotThumb: {
    width: 64, height: 64, borderRadius: 12, backgroundColor: '#dfe8e2',
    alignItems: 'center', justifyContent: 'center', gap: 3,
  },
  spotThumbT: { fontSize: 9, color: colors.muted },
  spotName: { fontSize: 14.5, fontWeight: '600', color: colors.fg },
  spotStars: { fontSize: 12, color: '#e8a33d' },
  spotStats: { flexDirection: 'row', gap: 12, marginTop: 5 },
  spotStat: { fontSize: 11.5, color: colors.muted },
  spotStatB: { fontSize: 13, fontWeight: '700', color: colors.fg },
  spotDesc: { fontSize: 11, color: colors.muted, marginTop: 5 },
  goBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    marginTop: 14, minHeight: 42, borderRadius: 999, backgroundColor: colors.accent,
  },
  goBtnT: { color: '#fff', fontSize: 14, fontWeight: '600' },
  goBtnGhost: { backgroundColor: colors.accentSoft },
  goBtnGhostT: { color: colors.accent },
  chart: { marginTop: 14 },
  chartScale: { fontSize: 9, color: colors.muted, fontFamily: 'monospace' },
  chartBars: { flexDirection: 'row', gap: 8, height: 110, marginTop: 2 },
  chartCol: { flex: 1, justifyContent: 'flex-end' },
  bar: { borderRadius: 4, backgroundColor: colors.fgSoft },
  barWin: { backgroundColor: colors.accent },
  chartWinNote: { fontSize: 10, color: colors.accent, marginTop: 6 },
  chartX: { flexDirection: 'row', gap: 8, marginTop: 3 },
  chartXT: { flex: 1, textAlign: 'center', fontSize: 9, color: colors.muted, fontFamily: 'monospace' },
  genHead: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  genIcon: {
    width: 40, height: 40, borderRadius: 12, backgroundColor: colors.accentSoft,
    alignItems: 'center', justifyContent: 'center',
  },
  genTitle: { fontSize: 15, fontWeight: '600', color: colors.fg, lineHeight: 21 },
  genTime: { fontSize: 11, color: colors.muted, marginTop: 3 },
  genText: { fontSize: 14, color: colors.fg, lineHeight: 22, marginTop: 12 },
});

import React, { useRef, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Share } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius } from '@yulu/ui';
import type { ArticleBlock, MockArticle } from '../mock/data';
import { useUIStore } from '../store/ui';

/**
 * 精选文章详情（对照 ios-article-detail.html / ios-article-night.html）：
 * 悬浮 navbar（返回学习/标题）、头图示意、eyebrow + 标题、作者行、正文块
 * （段落/小节/引用/表格）、相关课程（可点）+ 底部收藏/点赞/分享操作栏。
 */
export function ArticleDetailScreen({ article }: { article: MockArticle }) {
  const close = useUIStore((s) => s.closeOverlay);
  const [fav, setFav] = useState(false);
  const [liked, setLiked] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showToast = (msg: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast(msg);
    toastTimer.current = setTimeout(() => setToast(null), 1800);
  };

  const onShare = () => {
    void Share.share({
      message: `「${article.title}」${article.author} — 好文分享自渔路 YULU（链接：yulu://article/${article.id}）`,
    }).catch(() => {});
  };

  return (
    <View style={styles.wrapper}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 88 }}>
        {/* 头图（View 拼绘示意，temp 版带温度计） */}
        <View style={styles.hero}>
          <View style={styles.hSky} />
          <View style={styles.hWater} />
          {article.heroKind === 'temp' ? (
            <>
              <View style={{ marginTop: 56, marginLeft: 14, gap: 42 }}>
                {['表层 22℃ · 鲴鱼/白条', '中层 18℃ · 翘嘴窗口', '深层 14℃ · 鲈鱼伏底'].map((l) => (
                  <Text key={l} style={styles.hLabel}>{l}</Text>
                ))}
              </View>
              {/* 温度计示意（红柱水银） */}
              <View style={styles.thermo}>
                <View style={styles.thermoTube} />
                <View style={styles.thermoFill} />
                <View style={styles.thermoBulb} />
              </View>
            </>
          ) : (
            <>
              <View style={styles.hMoon} />
              <View style={styles.hLamp} />
              <Text style={styles.hNightMark}>NIGHT FISHING</Text>
            </>
          )}
        </View>

        {/* 悬浮 navbar（叠在头图上，毛玻璃感底） */}
        <View style={styles.navbar}>
          <TouchableOpacity style={styles.navBack} onPress={close} activeOpacity={0.8}>
            <Ionicons name="chevron-back" size={18} color={colors.accent} />
            <Text style={styles.navBackT}>学习</Text>
          </TouchableOpacity>
          <Text style={styles.navTitle}>文章详情</Text>
          <View style={{ width: 74 }} />
        </View>

        <View style={styles.body}>
          <Text style={styles.eyebrow}>{article.eyebrow}</Text>
          <Text style={styles.title}>{article.title}</Text>

          <View style={styles.authorRow}>
            <View style={styles.authorAva}>
              <Text style={styles.authorAvaT}>{article.author.charAt(0)}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.authorName}>{article.author}</Text>
              <Text style={styles.authorSub}>{article.authorSub}</Text>
            </View>
            <Text style={styles.readMeta}>{article.readMeta.replace(' · ', '\n')}</Text>
          </View>

          {article.blocks.map((b, i) => (
            <Block key={i} block={b} />
          ))}

          <Text style={styles.relLabel}>相关课程</Text>
          {article.related.map((r) => (
            <TouchableOpacity key={r.title} style={styles.relCard} activeOpacity={0.75} onPress={() => { close(); showToast('已回到学习页'); }}>
              <View style={styles.relPlay}>
                <Ionicons name="play" size={12} color="#fff" />
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={styles.relTitle} numberOfLines={1}>{r.title}</Text>
                <Text style={styles.relSub} numberOfLines={1}>{r.sub}</Text>
              </View>
              <View style={styles.relDur}>
                <Text style={styles.relDurT}>{r.dur}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* 底部操作栏：收藏 / 点赞 / 分享（对照原型） */}
      <View style={styles.actionbar}>
        <TouchableOpacity style={styles.actItem} onPress={() => { setFav((v) => !v); showToast(fav ? '已取消收藏' : '已收藏'); }} activeOpacity={0.7}>
          <Ionicons name={fav ? 'star' : 'star-outline'} size={20} color={fav ? colors.accent : colors.muted} />
          <Text style={[styles.actItemT, fav && { color: colors.accent }]}>收藏 {89 + (fav ? 1 : 0)}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actItem} onPress={() => { setLiked((v) => !v); showToast(liked ? '已取消点赞' : '已点赞'); }} activeOpacity={0.7}>
          <Ionicons name={liked ? 'heart' : 'heart-outline'} size={20} color={liked ? colors.accent : colors.muted} />
          <Text style={[styles.actItemT, liked && { color: colors.accent }]}>点赞 {156 + (liked ? 1 : 0)}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actItem} onPress={onShare} activeOpacity={0.7}>
          <Ionicons name="share-social-outline" size={20} color={colors.muted} />
          <Text style={styles.actItemT}>分享</Text>
        </TouchableOpacity>
      </View>

      {toast && (
        <View style={styles.toast}>
          <Ionicons name="checkmark" size={14} color="#7dd8c3" />
          <Text style={styles.toastText}>{toast}</Text>
        </View>
      )}
    </View>
  );
}

function Block({ block }: { block: ArticleBlock }) {
  if (block.type === 'h2') {
    return (
      <View style={styles.h2Row}>
        <View style={styles.h2Bar} />
        <Text style={styles.h2}>{block.text}</Text>
      </View>
    );
  }
  if (block.type === 'quote') {
    return (
      <View style={styles.quote}>
        <Text style={styles.quoteT}>{block.text}</Text>
      </View>
    );
  }
  if (block.type === 'table') {
    return (
      <View style={styles.table}>
        {!!block.caption && <Text style={styles.tableCap}>{block.caption}</Text>}
        <View style={[styles.tableRow, styles.tableHead]}>
          {block.header.map((h) => (
            <Text key={h} style={[styles.tableCell, styles.tableHeadT]}>{h}</Text>
          ))}
        </View>
        {block.rows.map((row, i) => (
          <View key={i} style={styles.tableRow}>
            {row.map((cell, j) => (
              <Text key={j} style={[styles.tableCell, j > 0 && styles.tableCellMuted]}>{cell}</Text>
            ))}
          </View>
        ))}
      </View>
    );
  }
  return <Text style={styles.p}>{block.text}</Text>;
}

const styles = StyleSheet.create({
  wrapper: { flex: 1 },
  container: { flex: 1, backgroundColor: colors.bg },
  hero: { height: 210, overflow: 'hidden', position: 'relative' },
  hSky: { ...StyleSheet.absoluteFillObject, backgroundColor: '#e7efe9' },
  hWater: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 70, backgroundColor: '#bcd6c9' },
  hLabel: { fontSize: 11, color: '#4c6a5e', fontFamily: 'Georgia' },
  thermo: { position: 'absolute', right: 44, top: 40, width: 22, height: 132, alignItems: 'center' },
  thermoTube: { width: 8, height: 108, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.85)', borderWidth: 1, borderColor: '#4c6a5e' },
  thermoFill: { position: 'absolute', bottom: 12, width: 4, height: 62, backgroundColor: '#c0503e', borderRadius: 2 },
  thermoBulb: {
    position: 'absolute', bottom: 0, width: 18, height: 18, borderRadius: 9,
    backgroundColor: '#c0503e', borderWidth: 1, borderColor: '#4c6a5e',
  },
  hMoon: { position: 'absolute', right: 44, top: 30, width: 44, height: 44, borderRadius: 22, backgroundColor: '#f3ede0' },
  hLamp: { position: 'absolute', left: 40, top: 44, width: 14, height: 14, borderRadius: 7, backgroundColor: '#7aa8d8', opacity: 0.8 },
  hNightMark: { position: 'absolute', right: 16, top: 16, fontSize: 11, color: '#647a70', fontFamily: 'Georgia', letterSpacing: 1 },
  /* 悬浮 navbar（叠在头图上沿） */
  navbar: {
    position: 'absolute', top: 0, left: 0, right: 0,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 12, paddingTop: 10, paddingBottom: 10,
    backgroundColor: 'rgba(243, 245, 242, 0.88)',
  },
  navBack: { flexDirection: 'row', alignItems: 'center', width: 74, paddingHorizontal: 4 },
  navBackT: { color: colors.accent, fontSize: 15 },
  navTitle: { fontFamily: 'Georgia', fontSize: 17, fontWeight: '600', color: colors.fg },
  body: { paddingHorizontal: 20, paddingTop: 18 },
  eyebrow: { fontSize: 11, color: colors.accent, fontWeight: '600', letterSpacing: 0.6, textTransform: 'uppercase' },
  title: { fontFamily: 'Georgia', fontSize: 23, fontWeight: '700', color: colors.fg, marginTop: 6, lineHeight: 32 },
  authorRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    marginTop: 16, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  authorAva: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: colors.accentSoft,
    alignItems: 'center', justifyContent: 'center',
  },
  authorAvaT: { fontFamily: 'Georgia', fontSize: 16, fontWeight: '600', color: colors.accent },
  authorName: { fontSize: 14, fontWeight: '600', color: colors.fg },
  authorSub: { fontSize: 11, color: colors.muted, marginTop: 2 },
  readMeta: { fontSize: 11, color: colors.muted, fontFamily: 'monospace', textAlign: 'right', lineHeight: 16 },
  p: { fontSize: 15, color: colors.fg, lineHeight: 27, marginTop: 10 },
  h2Row: { flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 22, marginBottom: 8 },
  h2Bar: { width: 3, height: 15, borderRadius: 2, backgroundColor: colors.accent },
  h2: { fontFamily: 'Georgia', fontSize: 17, fontWeight: '600', color: colors.fg },
  quote: {
    marginTop: 12, marginBottom: 4, paddingVertical: 10, paddingHorizontal: 14,
    borderLeftWidth: 3, borderLeftColor: colors.accent, backgroundColor: colors.accentSoft,
    borderRadius: 2,
  },
  quoteT: { fontSize: 13.5, color: colors.fg, lineHeight: 22 },
  table: { marginTop: 10, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, overflow: 'hidden', backgroundColor: colors.surface },
  tableCap: { fontSize: 11, color: colors.muted, paddingHorizontal: 12, paddingVertical: 8 },
  tableRow: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: colors.border },
  tableHead: { backgroundColor: colors.fgSoft },
  tableCell: { flex: 1, fontSize: 12.5, color: colors.fg, paddingHorizontal: 12, paddingVertical: 9 },
  tableHeadT: { fontWeight: '600' },
  tableCellMuted: { color: colors.muted },
  relLabel: { fontSize: 12, fontWeight: '600', color: colors.muted, marginTop: 22, marginBottom: 8 },
  relCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.lg, padding: 14, marginBottom: 8,
  },
  relPlay: {
    width: 34, height: 34, borderRadius: 17, backgroundColor: colors.accent,
    alignItems: 'center', justifyContent: 'center',
  },
  relTitle: { fontSize: 14, fontWeight: '600', color: colors.fg },
  relSub: { fontSize: 11, color: colors.muted, marginTop: 3 },
  relDur: { backgroundColor: colors.fgSoft, paddingHorizontal: 9, paddingVertical: 5, borderRadius: 999 },
  relDurT: { fontSize: 11, color: colors.fg, fontFamily: 'monospace' },
  /* 底部操作栏 */
  actionbar: {
    position: 'absolute', left: 0, right: 0, bottom: 0,
    flexDirection: 'row', alignItems: 'center', gap: 22,
    paddingHorizontal: 26, paddingVertical: 12, paddingBottom: 18,
    borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.surface,
  },
  actItem: { alignItems: 'center', gap: 3 },
  actItemT: { fontSize: 10.5, color: colors.muted },
  toast: {
    position: 'absolute', bottom: 96, alignSelf: 'center',
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: colors.fg, paddingHorizontal: 18, paddingVertical: 10, borderRadius: 999,
    shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowRadius: 12, shadowOpacity: 0.3,
  },
  toastText: { fontSize: 13, color: '#fff' },
});

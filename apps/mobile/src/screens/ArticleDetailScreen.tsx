import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius } from '@yulu/ui';
import type { ArticleBlock, MockArticle } from '../mock/data';
import { useUIStore } from '../store/ui';

/**
 * 精选文章详情（对照 ios-article-detail.html / ios-article-night.html）：
 * 头图示意、eyebrow + 标题、作者行、正文块（段落/小节/引用/表格）、相关课程。
 */
export function ArticleDetailScreen({ article }: { article: MockArticle }) {
  const close = useUIStore((s) => s.closeOverlay);

  return (
    <View style={styles.wrapper}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        {/* 头图（View 拼绘示意） */}
        <View style={styles.hero}>
          <View style={styles.hSky} />
          <View style={styles.hWater} />
          {article.heroKind === 'temp' ? (
            <View style={{ marginTop: 56, marginLeft: 14, gap: 42 }}>
              {[
                { t: '表层 22℃ · 鲴鱼/白条', top: 0 },
                { t: '中层 18℃ · 翘嘴窗口', top: 0 },
                { t: '深层 14℃ · 鲈鱼伏底', top: 0 },
              ].map((l) => (
                <Text key={l.t} style={styles.hLabel}>{l.t}</Text>
              ))}
            </View>
          ) : (
            <>
              <View style={styles.hMoon} />
              <View style={styles.hLamp} />
              <Text style={styles.hNightMark}>NIGHT FISHING</Text>
            </>
          )}
          {/* 返回浮钮 */}
          <TouchableOpacity style={styles.backBtn} onPress={close} activeOpacity={0.8}>
            <Ionicons name="chevron-back" size={20} color={colors.fg} />
          </TouchableOpacity>
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
            <View key={r.title} style={styles.relCard}>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={styles.relTitle} numberOfLines={1}>{r.title}</Text>
                <Text style={styles.relSub} numberOfLines={1}>{r.sub}</Text>
              </View>
              <View style={styles.relDur}>
                <Ionicons name="play" size={10} color="#fff" />
                <Text style={styles.relDurT}>{r.dur}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
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
  hMoon: { position: 'absolute', right: 44, top: 30, width: 44, height: 44, borderRadius: 22, backgroundColor: '#f3ede0' },
  hLamp: { position: 'absolute', left: 40, top: 44, width: 14, height: 14, borderRadius: 7, backgroundColor: '#7aa8d8', opacity: 0.8 },
  hNightMark: { position: 'absolute', right: 16, top: 16, fontSize: 11, color: '#647a70', fontFamily: 'Georgia', letterSpacing: 1 },
  backBtn: {
    position: 'absolute', left: 12, top: 12, width: 38, height: 38, borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.92)', borderWidth: 1, borderColor: colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
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
  relTitle: { fontSize: 14, fontWeight: '600', color: colors.fg },
  relSub: { fontSize: 11, color: colors.muted, marginTop: 3 },
  relDur: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 9, paddingVertical: 5, borderRadius: 999, backgroundColor: colors.accent,
  },
  relDurT: { fontSize: 11, color: '#fff', fontFamily: 'monospace' },
});

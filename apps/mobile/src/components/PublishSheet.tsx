import React, { useEffect, useState } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius } from '@yulu/ui';
import { useCreateRoute, useCreateTutorial } from '../hooks/queries';
import { USE_MOCK } from '../config';

export type PublishType = 'route' | 'tip';

interface Props {
  visible: boolean;
  initialType: PublishType;
  onClose: () => void;
  /** 发布成功后回调（real 模式已完成 API 提交，mock 模式为本地合成）。 */
  onPublished: (type: PublishType, title: string) => void;
}

const TYPE_CONF: Record<PublishType, { title: string; field: string; linkLabel: string; placeholder: string; links: string[] }> = {
  route: {
    title: '分享路线',
    field: '路线介绍',
    linkLabel: '关联区域',
    placeholder: '介绍这条路线的亮点：坑点数量、适钓鱼种、注意事项…',
    links: ['北岸环线', '东山半岛路线', '碧溪湾巡钓路线'],
  },
  tip: {
    title: '技巧分享',
    field: '技巧正文',
    linkLabel: '技巧分类',
    placeholder: '把你的独家心得写下来：适用场景、操作要点、装备选择…',
    links: ['路亚', '台钓', '筏钓', '装备', '绑钩'],
  },
};

/**
 * 「我的」页发布面板（对照 ios-profile.html 的 publisher sheet）。
 * 分享坑点走独立的 CreateSpotScreen；此面板承载 路线/技巧 两种发布：
 * real 模式走 create-route/create-tutorial API，mock 模式本地合成条目。
 */
export function PublishSheet({ visible, initialType, onClose, onPublished }: Props) {
  const [type, setType] = useState<PublishType>(initialType);
  const [content, setContent] = useState('');
  const [linkIdx, setLinkIdx] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const createRoute = useCreateRoute();
  const createTutorial = useCreateTutorial();

  // 每次打开重置表单（坑点类型从独立流程进入，不在 seg 中）。
  useEffect(() => {
    if (visible) {
      setType(initialType);
      setContent('');
      setLinkIdx(0);
      setError(null);
      setSubmitting(false);
    }
  }, [visible, initialType]);

  const conf = TYPE_CONF[type];

  const submit = async () => {
    if (submitting) return;
    if (!content.trim()) {
      setError('写点内容再发布吧，钓友们等着看呢');
      return;
    }
    if (!USE_MOCK && content.trim().length < 10) {
      setError('正文至少 10 个字才能发布');
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const text = content.trim();
      const link = conf.links[linkIdx];
      const shortTitle = text.length > 16 ? `${text.slice(0, 16)}…` : text;
      if (type === 'route') {
        // 路线：名称取正文开头，介绍保留全文，关联区域作为 tag。
        await createRoute.mutateAsync({ name: shortTitle, description: text, tags: [link] });
      } else {
        // 技巧：标题取正文开头，正文保留全文，分类用所选 chip。
        await createTutorial.mutateAsync({ title: shortTitle, content: text, category: link });
      }
      onPublished(type, shortTitle);
      onClose();
    } catch (e: any) {
      Alert.alert('发布失败', e?.message ?? '网络异常，请稍后再试');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <View style={styles.head}>
            <Text style={styles.title}>{conf.title}</Text>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.7}>
              <Ionicons name="close" size={14} color={colors.fg} />
            </TouchableOpacity>
          </View>

          {/* 类型切换 */}
          <View style={styles.seg}>
            {(['route', 'tip'] as PublishType[]).map((t) => (
              <TouchableOpacity
                key={t}
                style={[styles.segBtn, type === t && styles.segBtnActive]}
                onPress={() => { setType(t); setLinkIdx(0); setError(null); }}
                activeOpacity={0.8}
              >
                <Text style={[styles.segText, type === t && styles.segTextActive]}>
                  {t === 'route' ? '路线' : '技巧'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* 正文 */}
          <Text style={styles.fieldLabel}>{conf.field}</Text>
          <TextInput
            style={styles.composer}
            value={content}
            onChangeText={(v) => { setContent(v); if (v.trim()) setError(null); }}
            placeholder={conf.placeholder}
            placeholderTextColor={colors.muted}
            multiline
            maxLength={500}
          />
          {!!error && <Text style={styles.error}>{error}</Text>}
          <Text style={styles.charCount}>{content.length} / 500</Text>

          {/* 关联 chips */}
          <Text style={styles.fieldLabel}>{conf.linkLabel}</Text>
          <View style={styles.linkRow}>
            {conf.links.map((name, i) => (
              <TouchableOpacity
                key={name}
                style={[styles.linkChip, linkIdx === i && styles.linkChipActive]}
                onPress={() => setLinkIdx(i)}
                activeOpacity={0.8}
              >
                <Text style={[styles.linkText, linkIdx === i && styles.linkTextActive]}>{name}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* 现场照片（模拟占位，接入图片上传后替换） */}
          <Text style={styles.fieldLabel}>现场照片</Text>
          <View style={styles.photoRow}>
            <View style={[styles.photoSlot, styles.photoSlotFilled]}>
              <Ionicons name="location-outline" size={18} color="#fff" />
            </View>
            {[0, 1, 2].map((i) => (
              <View key={i} style={styles.photoSlot}>
                <Ionicons name="add" size={18} color={colors.muted} />
              </View>
            ))}
          </View>

          {/* 提交 */}
          <TouchableOpacity
            style={[styles.submitBtn, submitting && { opacity: 0.6 }]}
            onPress={() => void submit()}
            disabled={submitting}
            activeOpacity={0.8}
          >
            {submitting && <ActivityIndicator size="small" color="#fff" />}
            <Text style={styles.submitText}>{submitting ? '发布中…' : '发布'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(10, 14, 12, 0.4)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 22, borderTopRightRadius: 22,
    borderTopWidth: 1, borderTopColor: colors.border,
    paddingHorizontal: 16, paddingBottom: 24, paddingTop: 8, gap: 8,
  },
  handle: {
    width: 36, height: 4, borderRadius: 999, backgroundColor: colors.border,
    alignSelf: 'center', marginBottom: 4,
  },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontFamily: 'Georgia', fontSize: 17, fontWeight: '600', color: colors.fg },
  closeBtn: {
    width: 30, height: 30, borderRadius: 15, backgroundColor: colors.fgSoft,
    alignItems: 'center', justifyContent: 'center',
  },
  seg: {
    flexDirection: 'row', backgroundColor: colors.fgSoft, borderRadius: 999, padding: 2,
  },
  segBtn: { flex: 1, paddingVertical: 7, borderRadius: 999, alignItems: 'center' },
  segBtnActive: { backgroundColor: colors.fg },
  segText: { fontSize: 12, color: colors.muted },
  segTextActive: { color: '#fff', fontWeight: '600' },
  fieldLabel: { fontSize: 12, fontWeight: '600', color: colors.muted },
  composer: {
    minHeight: 88, padding: 12, borderWidth: 1, borderColor: colors.border,
    borderRadius: 12, backgroundColor: colors.bg, fontSize: 14, color: colors.fg,
    textAlignVertical: 'top', lineHeight: 20,
  },
  error: { fontSize: 11, color: colors.danger },
  charCount: { fontFamily: 'monospace', fontSize: 10, color: colors.muted, textAlign: 'right' },
  linkRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  linkChip: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999,
    borderWidth: 1, borderColor: colors.border, backgroundColor: colors.bg,
  },
  linkChipActive: { borderColor: colors.accent, backgroundColor: colors.accentSoft },
  linkText: { fontSize: 12, color: colors.fg },
  linkTextActive: { color: colors.accent },
  photoRow: { flexDirection: 'row', gap: 6 },
  photoSlot: {
    width: 64, height: 64, borderRadius: 10,
    borderWidth: 1, borderStyle: 'dashed', borderColor: colors.border,
    backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center',
  },
  photoSlotFilled: {
    borderWidth: 0, borderStyle: 'solid', backgroundColor: colors.accent,
  },
  submitBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    minHeight: 46, borderRadius: radius.md, backgroundColor: colors.accent, marginTop: 4,
  },
  submitText: { fontSize: 15, fontWeight: '600', color: '#fff' },
});

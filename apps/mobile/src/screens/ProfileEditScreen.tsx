import React, { useMemo, useRef, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Modal,
  Alert, Image, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { colors, spacing, radius, fontSize } from '@yulu/ui';
import type { User } from '@yulu/shared';
import { useAuthStore } from '../store/auth';
import { useUIStore } from '../store/ui';
import { usersApi, uploadsApi } from '../api/endpoints';
import { USE_MOCK } from '../config';

/** 钓龄档位（与后端枚举一致）。 */
const EXPERIENCE_OPTIONS: { value: NonNullable<User['fishingExperience']>; label: string }[] = [
  { value: 'lt1', label: '1年内' },
  { value: '1to3', label: '1–3年' },
  { value: '3to5', label: '3–5年' },
  { value: 'gt5', label: '5年以上' },
];

const LOCATIONS = ['浙江 · 千岛湖', '浙江 · 杭州', '江苏 · 苏州', '北京 · 密云'];
const METHOD_OPTIONS = ['路亚', '台钓', '筏钓'];
const SPECIES_OPTIONS = ['鲈鱼', '翘嘴', '鳜鱼'];

/** 表单快照：与初始 user 对比得出 dirty / 变更字段。 */
type Form = {
  nickname: string;
  bio: string;
  location: string;
  fishingExperience: User['fishingExperience'];
  fishingMethods: string[];
  targetSpecies: string[];
  avatarUrl?: string;
};

type SheetKind = 'avatar' | 'location' | null;

function toForm(user: User): Form {
  return {
    nickname: user.nickname,
    bio: user.bio ?? '',
    location: user.location ?? '',
    fishingExperience: user.fishingExperience,
    fishingMethods: user.fishingMethods ?? [],
    targetSpecies: user.targetSpecies ?? [],
    avatarUrl: user.avatarUrl,
  };
}

export function ProfileEditScreen() {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const close = useUIStore((s) => s.closeOverlay);

  const initial = useMemo(() => toForm(user ?? { nickname: '' } as User), [user]);
  const [form, setForm] = useState<Form>(initial);
  const [nickErr, setNickErr] = useState(false);
  const [showErrSummary, setShowErrSummary] = useState(false);
  const [sheet, setSheet] = useState<SheetKind>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const dirty = JSON.stringify(form) !== JSON.stringify(initial);
  const nickValid = form.nickname.trim().length >= 2;
  const canSave = dirty && nickValid && !saving;

  const patch = (p: Partial<Form>) => setForm((prev) => ({ ...prev, ...p }));

  const showToast = (msg: string, after?: () => void) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast(msg);
    toastTimer.current = setTimeout(() => {
      setToast(null);
      after?.();
    }, 1000);
  };

  const validateNick = () => {
    const bad = form.nickname.trim().length < 2;
    setNickErr(bad);
    return !bad;
  };

  const handleBack = () => {
    if (!dirty) return close();
    Alert.alert('放弃修改？', '你的资料改动还没有保存，离开后将丢失。', [
      { text: '继续编辑', style: 'cancel' },
      { text: '放弃修改', style: 'destructive', onPress: close },
    ]);
  };

  /* ── 头像 ── */
  const changeAvatar = async (source: 'camera' | 'album' | 'keep') => {
    setSheet(null);
    if (source === 'keep') {
      patch({ avatarUrl: initial.avatarUrl });
      showToast('已保留当前头像');
      return;
    }
    try {
      const perm = source === 'camera'
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (perm.status !== 'granted') {
        Alert.alert('需要权限', `请在系统设置中允许${source === 'camera' ? '相机' : '相册'}权限后再试。`);
        return;
      }
      const launch = source === 'camera'
        ? ImagePicker.launchCameraAsync
        : ImagePicker.launchImageLibraryAsync;
      const result = await launch({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8, allowsEditing: true, aspect: [1, 1] });
      if (result.canceled) return;
      patch({ avatarUrl: result.assets[0].uri });
      showToast('头像已更新');
    } catch {
      Alert.alert('出错了', '选择照片失败，请重试。');
    }
  };

  /* ── 保存 ── */
  const handleSave = async () => {
    if (!canSave) return;
    if (!validateNick()) {
      setShowErrSummary(true);
      return;
    }
    setShowErrSummary(false);
    setSaving(true);
    try {
      if (USE_MOCK) {
        // Mock 模式：本地合并保存（头像为本地 URI，仅本机可见）。
        await new Promise((r) => setTimeout(r, 900));
        const merged: User = { ...(user as User), ...form, nickname: form.nickname.trim() };
        await setUser(merged);
      } else {
        // 只提交变化的字段；新头像先上传拿 URL。
        const payload: Record<string, unknown> = {};
        if (form.nickname.trim() !== initial.nickname) payload.nickname = form.nickname.trim();
        if (form.bio !== initial.bio) payload.bio = form.bio;
        if (form.location !== initial.location) payload.location = form.location;
        if (form.fishingExperience !== initial.fishingExperience) payload.fishingExperience = form.fishingExperience;
        if (JSON.stringify(form.fishingMethods) !== JSON.stringify(initial.fishingMethods)) payload.fishingMethods = form.fishingMethods;
        if (JSON.stringify(form.targetSpecies) !== JSON.stringify(initial.targetSpecies)) payload.targetSpecies = form.targetSpecies;
        if (form.avatarUrl !== initial.avatarUrl && form.avatarUrl?.startsWith('file:')) {
          payload.avatarUrl = (await uploadsApi.upload([form.avatarUrl]))[0];
        }
        const updated = await usersApi.updateMe(payload);
        await setUser({ ...user, ...updated });
      }
      showToast('已保存', close);
    } catch (e: any) {
      Alert.alert('保存失败', e?.message ?? '请检查网络后重试。');
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {/* Navbar */}
      <View style={styles.navbar}>
        <TouchableOpacity style={styles.backBtn} onPress={handleBack} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={18} color={colors.accent} />
          <Text style={styles.backText}>我的</Text>
        </TouchableOpacity>
        <Text style={styles.navTitle}>编辑资料</Text>
        <TouchableOpacity
          style={[styles.saveBtn, !canSave && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={!canSave}
          activeOpacity={0.8}
        >
          {saving ? (
            <>
              <ActivityIndicator size="small" color="#fff" />
              <Text style={styles.saveText}>保存中</Text>
            </>
          ) : (
            <Text style={[styles.saveText, !canSave && styles.saveTextDisabled]}>保存</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {showErrSummary && !nickValid && (
          <View style={styles.errSummary}>
            <Ionicons name="alert-circle" size={14} color="#8c2f24" />
            <Text style={styles.errSummaryText}>还有 1 处问题（昵称 2–12 字）需要修正后才能保存</Text>
          </View>
        )}

        {/* Avatar card */}
        <View style={styles.avatarCard}>
          {form.avatarUrl ? (
            <Image source={{ uri: form.avatarUrl }} style={styles.avatarLg} />
          ) : (
            <View style={[styles.avatarLg, styles.avatarFallback]}>
              <Text style={styles.avatarLetter}>{form.nickname.charAt(0) || '钓'}</Text>
            </View>
          )}
          <View style={{ flex: 1 }}>
            <Text style={styles.avatarName} numberOfLines={1}>{form.nickname || '未命名'}</Text>
            <Text style={styles.avatarHint}>支持 JPG / PNG，相机拍摄或从相册选择</Text>
          </View>
          <TouchableOpacity style={styles.avatarEditBtn} onPress={() => setSheet('avatar')} activeOpacity={0.7}>
            <Text style={styles.avatarEditText}>更换头像</Text>
          </TouchableOpacity>
        </View>

        {/* Basic info */}
        <Text style={styles.groupLabel}>基本信息</Text>
        <View style={styles.formCard}>
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>昵称 <Text style={styles.req}>*</Text></Text>
            <TextInput
              style={[styles.input, nickErr && styles.inputErr]}
              value={form.nickname}
              maxLength={12}
              onChangeText={(v) => { patch({ nickname: v }); if (nickErr && v.trim().length >= 2) setNickErr(false); }}
              onBlur={validateNick}
              placeholder="给自己起个钓友都认识的名字"
              placeholderTextColor={colors.muted}
            />
            {nickErr && <Text style={styles.fieldErr}>昵称不能为空（2–12 字）</Text>}
          </View>
          <View style={styles.field}>
            <View style={styles.fieldLabelRow}>
              <Text style={styles.fieldLabel}>个性签名</Text>
              <Text style={styles.count}>{form.bio.length} / 50</Text>
            </View>
            <TextInput
              style={styles.textarea}
              value={form.bio}
              maxLength={50}
              multiline
              onChangeText={(v) => patch({ bio: v })}
              placeholder="一句话介绍自己的钓鱼风格"
              placeholderTextColor={colors.muted}
            />
          </View>
          <TouchableOpacity style={styles.field} activeOpacity={0.7} onPress={() => setSheet('location')}>
            <Text style={styles.fieldLabel}>所在地</Text>
            <View style={styles.locRow}>
              <Text style={styles.locText}>{form.location || '选择所在地'}</Text>
              <Text style={styles.chev}>›</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Fishing profile */}
        <Text style={styles.groupLabel}>钓鱼资料</Text>
        <View style={styles.formCard}>
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>钓龄</Text>
            <View style={styles.seg}>
              {EXPERIENCE_OPTIONS.map((opt) => {
                const active = form.fishingExperience === opt.value;
                return (
                  <TouchableOpacity
                    key={opt.value}
                    style={[styles.segBtn, active && styles.segBtnActive]}
                    onPress={() => patch({ fishingExperience: opt.value })}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.segLabel, active && styles.segLabelActive]}>{opt.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>常用钓法</Text>
            <View style={styles.chips}>
              {METHOD_OPTIONS.map((m) => (
                <Chip key={m} label={m} active={form.fishingMethods.includes(m)}
                  onPress={() => patch({ fishingMethods: toggle(form.fishingMethods, m) })} />
              ))}
            </View>
          </View>
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>主打鱼种</Text>
            <View style={styles.chips}>
              {SPECIES_OPTIONS.map((s) => (
                <Chip key={s} label={s} active={form.targetSpecies.includes(s)}
                  onPress={() => patch({ targetSpecies: toggle(form.targetSpecies, s) })} />
              ))}
            </View>
          </View>
        </View>

        {/* Badge */}
        <Text style={styles.groupLabel}>荣誉徽章</Text>
        <View style={styles.badgeRow}>
          <View style={styles.badgeMedal}>
            <Ionicons name="star" size={16} color="#b8860b" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.badgeName}>金牌探路者</Text>
            <Text style={styles.badgeSub}>2025 年度坑点路线贡献 TOP 50，由平台颁发</Text>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* 更换头像 sheet */}
      <Modal visible={sheet === 'avatar'} transparent animationType="slide" onRequestClose={() => setSheet(null)}>
        <TouchableOpacity style={styles.scrim} activeOpacity={1} onPress={() => setSheet(null)}>
          <TouchableOpacity style={styles.sheet} activeOpacity={1}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>更换头像</Text>
            <SheetAction icon="camera-outline" label="拍一张" onPress={() => void changeAvatar('camera')} />
            <SheetAction icon="images-outline" label="从相册选择" onPress={() => void changeAvatar('album')} />
            <SheetAction icon="time-outline" label="保留当前头像" muted onPress={() => void changeAvatar('keep')} />
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* 所在地 sheet */}
      <Modal visible={sheet === 'location'} transparent animationType="slide" onRequestClose={() => setSheet(null)}>
        <TouchableOpacity style={styles.scrim} activeOpacity={1} onPress={() => setSheet(null)}>
          <TouchableOpacity style={styles.sheet} activeOpacity={1}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>所在地</Text>
            {LOCATIONS.map((loc) => (
              <TouchableOpacity
                key={loc}
                style={styles.locOpt}
                activeOpacity={0.7}
                onPress={() => { patch({ location: loc }); setSheet(null); }}
              >
                <Text style={[styles.locOptText, form.location === loc && styles.locOptActive]}>{loc}</Text>
                {form.location === loc && <Ionicons name="checkmark" size={16} color={colors.accent} />}
              </TouchableOpacity>
            ))}
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Toast */}
      {toast && (
        <View style={styles.toast}>
          <Ionicons name="checkmark" size={14} color="#7dd8c3" />
          <Text style={styles.toastText}>{toast}</Text>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

function toggle(list: string[], v: string): string[] {
  return list.includes(v) ? list.filter((x) => x !== v) : [...list, v];
}

function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity
      style={[styles.chip, active && styles.chipActive]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.chipLabel, active && styles.chipLabelActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

function SheetAction({ icon, label, onPress, muted }: { icon: React.ComponentProps<typeof Ionicons>['name']; label: string; onPress: () => void; muted?: boolean }) {
  return (
    <TouchableOpacity style={styles.sheetAction} onPress={onPress} activeOpacity={0.7}>
      <Ionicons name={icon} size={18} color={muted ? colors.muted : colors.accent} />
      <Text style={[styles.sheetActionLabel, muted && styles.sheetActionMuted]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  navbar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 12, paddingTop: 10, paddingBottom: 8,
  },
  backBtn: { flexDirection: 'row', alignItems: 'center', width: 74, paddingHorizontal: 4 },
  backText: { color: colors.accent, fontSize: 15 },
  navTitle: { fontFamily: 'Georgia', fontSize: 17, fontWeight: '600', color: colors.fg },
  saveBtn: {
    width: 74, minHeight: 34, borderRadius: 999, backgroundColor: colors.accent,
    alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 5,
  },
  saveBtnDisabled: { backgroundColor: colors.border },
  saveText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  saveTextDisabled: { color: colors.muted },

  errSummary: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    marginHorizontal: spacing.screenPadding, marginBottom: 4,
    padding: 9, borderRadius: 12, backgroundColor: '#fbeae7',
  },
  errSummaryText: { fontSize: 12, color: '#8c2f24' },

  avatarCard: {
    marginHorizontal: spacing.screenPadding, marginTop: 6, padding: 16,
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.lg, flexDirection: 'row', alignItems: 'center', gap: 14,
  },
  avatarLg: { width: 68, height: 68, borderRadius: 34 },
  avatarFallback: { backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center' },
  avatarLetter: { fontFamily: 'Georgia', fontSize: 28, fontWeight: '600', color: colors.accent },
  avatarName: { fontSize: 14, fontWeight: '600', color: colors.fg },
  avatarHint: { fontSize: 11, color: colors.muted, marginTop: 3 },
  avatarEditBtn: {
    paddingHorizontal: 13, paddingVertical: 7, borderRadius: 999, flexShrink: 0,
    borderWidth: 1, borderColor: colors.border, backgroundColor: colors.bg,
  },
  avatarEditText: { fontSize: 12, color: colors.fg },

  groupLabel: {
    marginHorizontal: spacing.screenPadding, marginTop: 18, marginBottom: 8,
    fontSize: 12, fontWeight: '600', color: colors.muted,
  },
  formCard: {
    marginHorizontal: spacing.screenPadding, paddingVertical: 4, paddingHorizontal: 16,
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg,
  },
  field: { paddingVertical: 11, borderTopWidth: 1, borderTopColor: colors.border },
  fieldLabel: { fontSize: 12, fontWeight: '600', color: colors.muted, marginBottom: 6 },
  fieldLabelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  req: { color: colors.accent },
  count: { fontFamily: 'monospace', fontSize: 11, fontWeight: '400', color: colors.muted },
  input: { fontSize: 15, color: colors.fg, padding: 0, lineHeight: 22 },
  inputErr: { color: '#8c2f24' },
  fieldErr: { fontSize: 11, color: '#b03a2e', marginTop: 5 },
  textarea: { fontSize: 15, color: colors.fg, padding: 0, minHeight: 44, textAlignVertical: 'top', lineHeight: 22 },
  locRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  locText: { fontSize: 15, color: colors.fg },
  chev: { color: colors.muted, fontSize: 16 },

  seg: { flexDirection: 'row', backgroundColor: colors.fgSoft, borderRadius: 999, padding: 2 },
  segBtn: { flex: 1, paddingVertical: 7, borderRadius: 999, alignItems: 'center' },
  segBtnActive: { backgroundColor: colors.fg },
  segLabel: { fontSize: 12, color: colors.muted },
  segLabelActive: { color: '#fff', fontWeight: '600' },

  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  chip: {
    paddingHorizontal: 13, paddingVertical: 6, borderRadius: 999,
    borderWidth: 1, borderColor: colors.border, backgroundColor: colors.bg,
  },
  chipActive: { borderColor: colors.accent, backgroundColor: colors.accentSoft },
  chipLabel: { fontSize: 12, color: colors.fg },
  chipLabelActive: { color: colors.accent },

  badgeRow: {
    marginHorizontal: spacing.screenPadding, padding: 12, gap: 10,
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg,
    flexDirection: 'row', alignItems: 'center',
  },
  badgeMedal: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: 'rgba(184, 134, 11, 0.14)', alignItems: 'center', justifyContent: 'center',
  },
  badgeName: { fontSize: 14, fontWeight: '600', color: '#b8860b' },
  badgeSub: { fontSize: 11, color: colors.muted, marginTop: 1 },

  scrim: { flex: 1, backgroundColor: 'rgba(10, 14, 12, 0.4)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: colors.surface, borderTopLeftRadius: 22, borderTopRightRadius: 22,
    borderTopWidth: 1, borderColor: colors.border, paddingBottom: 16,
  },
  sheetHandle: {
    width: 36, height: 4, borderRadius: 999, backgroundColor: colors.border,
    alignSelf: 'center', marginTop: 8, marginBottom: 10,
  },
  sheetTitle: { fontFamily: 'Georgia', fontSize: 16, fontWeight: '600', color: colors.fg, paddingHorizontal: 20, paddingBottom: 8 },
  sheetAction: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingVertical: 14, paddingHorizontal: 20, borderTopWidth: 1, borderTopColor: colors.border,
  },
  sheetActionLabel: { fontSize: 15, color: colors.fg },
  sheetActionMuted: { color: colors.muted },
  locOpt: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 14, paddingHorizontal: 20, borderTopWidth: 1, borderTopColor: colors.border,
  },
  locOptText: { fontSize: 15, color: colors.fg },
  locOptActive: { color: colors.accent, fontWeight: '600' },

  toast: {
    position: 'absolute', bottom: 90, alignSelf: 'center',
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: colors.fg, paddingHorizontal: 18, paddingVertical: 10, borderRadius: 999,
    shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowRadius: 20, shadowOpacity: 0.4,
  },
  toastText: { fontSize: 13, color: '#fff' },
});

import React, { useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { colors, spacing, fontSize, radius } from '@yulu/ui';
import { useAuthStore } from '../store/auth';
import { USE_MOCK } from '../config';
import { ApiError } from '../api/client';

type Mode = 'login' | 'register';

export function AuthScreen() {
  const { login, register } = useAuthStore();
  const [mode, setMode] = useState<Mode>('login');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async () => {
    setError(null);
    if (phone.length < 11) {
      setError('请输入 11 位手机号');
      return;
    }
    if (password.length < 6) {
      setError('密码至少 6 位');
      return;
    }
    if (mode === 'register' && nickname.trim().length < 2) {
      setError('昵称至少 2 个字');
      return;
    }
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(phone, password);
      } else {
        await register(phone, password, nickname.trim());
      }
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : '登录失败，请重试';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const isLogin = mode === 'login';

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        {/* Brand */}
        <View style={styles.brand}>
          <Text style={styles.logo}>渔路</Text>
          <Text style={styles.tagline}>钓鱼人的专属地图</Text>
        </View>

        {/* Card */}
        <View style={styles.card}>
          <View style={styles.tabs}>
            <TabButton active={isLogin} onPress={() => { setMode('login'); setError(null); }} label="登录" />
            <TabButton active={!isLogin} onPress={() => { setMode('register'); setError(null); }} label="注册" />
          </View>

          <Field label="手机号">
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              placeholder="11 位手机号"
              placeholderTextColor={colors.muted}
              keyboardType="number-pad"
              maxLength={11}
            />
          </Field>

          {!isLogin && (
            <Field label="昵称">
              <TextInput
                style={styles.input}
                value={nickname}
                onChangeText={setNickname}
                placeholder="钓友称呼"
                placeholderTextColor={colors.muted}
                maxLength={20}
              />
            </Field>
          )}

          <Field label="密码">
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="至少 6 位"
              placeholderTextColor={colors.muted}
              secureTextEntry
            />
          </Field>

          {error && <Text style={styles.error}>{error}</Text>}

          <TouchableOpacity
            style={[styles.submit, loading && styles.submitDisabled]}
            onPress={onSubmit}
            disabled={loading}
            activeOpacity={0.7}
          >
            <Text style={styles.submitText}>{loading ? '请稍候…' : isLogin ? '登录' : '注册并登录'}</Text>
          </TouchableOpacity>
        </View>

        {USE_MOCK && (
          <Text style={styles.mockHint}>
            开发模式 · 后端未连接，可直接「免登录进入」体验界面
          </Text>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function TabButton({ active, onPress, label }: { active: boolean; onPress: () => void; label: string }) {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.tab, active && styles.tabActive]}>
      <Text style={[styles.tabText, active && styles.tabTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.bg },
  container: { flexGrow: 1, paddingHorizontal: spacing.screenPadding, justifyContent: 'center', paddingVertical: 32 },
  brand: { alignItems: 'center', marginBottom: 28 },
  logo: { fontFamily: 'Georgia', fontSize: 40, fontWeight: '700', color: colors.accent, letterSpacing: 2 },
  tagline: { fontSize: fontSize.meta, color: colors.muted, marginTop: 6 },
  card: {
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.lg, padding: 18,
  },
  tabs: { flexDirection: 'row', backgroundColor: colors.bg, borderRadius: radius.md, padding: 4, marginBottom: 16 },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: radius.sm },
  tabActive: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  tabText: { fontSize: fontSize.body, color: colors.muted, fontWeight: '500' },
  tabTextActive: { color: colors.fg, fontWeight: '600' },
  field: { marginBottom: 14 },
  label: { fontSize: fontSize.tiny, color: colors.muted, marginBottom: 6, letterSpacing: 0.06, textTransform: 'uppercase' },
  input: {
    borderWidth: 1, borderColor: colors.border, borderRadius: radius.md,
    paddingHorizontal: 14, paddingVertical: 12, fontSize: fontSize.body, color: colors.fg,
  },
  error: { fontSize: fontSize.meta, color: colors.danger, marginBottom: 10 },
  submit: {
    backgroundColor: colors.accent, borderRadius: radius.md,
    paddingVertical: 13, alignItems: 'center', marginTop: 4,
  },
  submitDisabled: { opacity: 0.6 },
  submitText: { color: '#fff', fontSize: fontSize.body, fontWeight: '600' },
  mockHint: { textAlign: 'center', fontSize: fontSize.tiny, color: colors.muted, marginTop: 18, lineHeight: 18 },
});

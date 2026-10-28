import React, { useRef, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, Switch, Modal, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { colors, radius } from '@yulu/ui';
import { useAuthStore } from '../store/auth';
import { useUIStore } from '../store/ui';
import { useOfflineStore } from '../store/offline';
import { useSettingsStore } from '../store/settings';
import { authApi, usersApi } from '../api/endpoints';
import { USE_MOCK } from '../config';

/** 138****6688 形式的手机号脱敏。 */
function maskPhone(phone: string): string {
  return phone.length === 11 ? `${phone.slice(0, 3)}****${phone.slice(7)}` : phone;
}

/**
 * 设置页（“我的”→ 设置），布局与交互对照原型
 * prototypes/screens/ios-settings.html：分组卡片列表（账号与安全 / 通知与提醒 /
 * 使用偏好 / 关于渔路）+ 退出登录 + 版本脚注。开关持久化在 settings store；
 * 清除缓存清空离线路线 store。修改密码 / 账号注销等依赖后端的能力暂以提示占位。
 */
export function SettingsScreen() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const close = useUIStore((s) => s.closeOverlay);
  const openArticleDetail = useUIStore((s) => s.openArticleDetail);
  const offlineRoutes = useOfflineStore((s) => s.routes);
  const clearOffline = useOfflineStore((s) => s.clearAll);
  const settings = useSettingsStore();

  const version = Constants.expoConfig?.version ?? '0.1.0';

  const [checking, setChecking] = useState(false);
  const [pwdOpen, setPwdOpen] = useState(false);
  const [pwd, setPwd] = useState({ old: '', next: '', confirm: '' });
  const [pwdSaving, setPwdSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = (msg: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast(msg);
    toastTimer.current = setTimeout(() => setToast(null), 1800);
  };

  /** 开关切换：写设置 store 并按原型 toast「XX 已开启/已关闭」。 */
  const toggle = (label: string, value: boolean, set: (v: boolean) => void) => {
    set(!value);
    showToast(`${label}已${!value ? '开启' : '关闭'}`);
  };

  const confirmClearCache = () => {
    if (offlineRoutes.length === 0) {
      showToast('没有可清理的离线缓存');
      return;
    }
    Alert.alert('清除缓存？', `将删除已下载的 ${offlineRoutes.length} 条离线路线，需要时可重新下载。`, [
      { text: '取消', style: 'cancel' },
      {
        text: '清除',
        style: 'destructive',
        onPress: () => {
          clearOffline();
          showToast('缓存已清理');
        },
      },
    ]);
  };

  const checkUpdate = () => {
    if (checking) return;
    setChecking(true);
    setTimeout(() => {
      setChecking(false);
      showToast(`已是最新版本 v${version}`);
    }, 1200);
  };

  const confirmLogout = () => {
    Alert.alert('确认退出登录？', '退出后需要重新登录才能发布坑点和路线。', [
      { text: '取消', style: 'cancel' },
      { text: '退出', style: 'destructive', onPress: () => void logout() },
    ]);
  };

  const openPwdSheet = () => {
    setPwd({ old: '', next: '', confirm: '' });
    setPwdOpen(true);
  };

  const savePassword = async () => {
    if (pwdSaving) return;
    if (!pwd.old || pwd.next.length < 6) {
      showToast('请填写原密码，新密码至少 6 位');
      return;
    }
    if (pwd.next !== pwd.confirm) {
      showToast('两次输入的新密码不一致');
      return;
    }
    setPwdSaving(true);
    try {
      if (USE_MOCK) {
        await new Promise((r) => setTimeout(r, 600));
      } else {
        await authApi.changePassword(pwd.old, pwd.next);
      }
      setPwdOpen(false);
      showToast('密码已修改');
    } catch (e: any) {
      Alert.alert('修改失败', e?.response?.data?.error ?? e?.message ?? '请检查原密码后重试');
    } finally {
      setPwdSaving(false);
    }
  };

  const confirmDeleteAccount = () => {
    Alert.alert('账号注销', '注销后所有坑点、路线、技巧与收藏将被永久删除，且无法恢复。', [
      { text: '取消', style: 'cancel' },
      {
        text: '确认注销',
        style: 'destructive',
        onPress: () => {
          if (USE_MOCK) {
            showToast('Mock 模式不支持注销，真机连后端后可用');
            return;
          }
          void usersApi
            .deleteAccount()
            .then(() => {
              showToast('账号已注销');
              return logout();
            })
            .catch(() => Alert.alert('注销失败', '网络异常，请稍后再试'));
        },
      },
    ]);
  };

  return (
    <View style={styles.wrapper}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        {/* Navbar（对照原型：返回“我的” + 居中标题） */}
        <View style={styles.navbar}>
          <TouchableOpacity style={styles.navSide} onPress={close} activeOpacity={0.7}>
            <Ionicons name="chevron-back" size={18} color={colors.accent} />
            <Text style={styles.backText}>我的</Text>
          </TouchableOpacity>
          <Text style={styles.navTitle}>设置</Text>
          <View style={styles.navSide} />
        </View>

        {/* 账号与安全 */}
        <Text style={styles.groupLabel}>账号与安全</Text>
        <View style={styles.group}>
          <TouchableOpacity style={styles.row} activeOpacity={0.6} onPress={() => showToast(user?.phone ? '手机号暂不支持自助修改' : '当前账号未绑定手机号')}>
            <View style={styles.rowName}>
              <View style={styles.rowIcon}>
                <Ionicons name="phone-portrait-outline" size={15} color={colors.fg} />
              </View>
              <Text style={styles.rowText}>手机号</Text>
            </View>
            <View style={styles.rowRight}>
              <Text style={styles.rowVal}>{user?.phone ? maskPhone(user.phone) : '未绑定'}</Text>
              <Text style={styles.chev}>›</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.row, styles.rowBorder]} activeOpacity={0.6} onPress={openPwdSheet}>
            <View style={styles.rowName}>
              <View style={styles.rowIcon}>
                <Ionicons name="lock-closed-outline" size={15} color={colors.fg} />
              </View>
              <Text style={styles.rowText}>修改密码</Text>
            </View>
            <View style={styles.rowRight}>
              <Text style={styles.chev}>›</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.row, styles.rowBorder]} activeOpacity={0.6} onPress={confirmDeleteAccount}>
            <View style={styles.rowName}>
              <View style={[styles.rowIcon, styles.rowIconDanger]}>
                <Ionicons name="ban-outline" size={15} color={colors.danger} />
              </View>
              <Text style={[styles.rowText, styles.rowDanger]}>账号注销</Text>
            </View>
            <View style={styles.rowRight}>
              <Text style={styles.chev}>›</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* 通知与提醒 */}
        <Text style={styles.groupLabel}>通知与提醒</Text>
        <View style={styles.group}>
          <View style={styles.row}>
            <View style={styles.rowName}>
              <View style={styles.rowIcon}>
                <Ionicons name="water-outline" size={15} color={colors.fg} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.rowText}>出鱼高峰提醒</Text>
                <Text style={styles.rowSub}>钓点进入出鱼窗口时推送通知</Text>
              </View>
            </View>
            <Switch
              value={settings.notifyFishWindow}
              onValueChange={() => toggle('出鱼高峰提醒', settings.notifyFishWindow, settings.setNotifyFishWindow)}
              trackColor={{ false: colors.border, true: colors.accent }}
              thumbColor="#fff"
            />
          </View>
          <View style={[styles.row, styles.rowBorder]}>
            <View style={styles.rowName}>
              <View style={styles.rowIcon}>
                <Ionicons name="people-outline" size={15} color={colors.fg} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.rowText}>关注的新动态</Text>
                <Text style={styles.rowSub}>关注的钓友发布坑点、路线时提醒</Text>
              </View>
            </View>
            <Switch
              value={settings.notifyFollowUpdates}
              onValueChange={() => toggle('关注的新动态', settings.notifyFollowUpdates, settings.setNotifyFollowUpdates)}
              trackColor={{ false: colors.border, true: colors.accent }}
              thumbColor="#fff"
            />
          </View>
          <View style={[styles.row, styles.rowBorder]}>
            <View style={styles.rowName}>
              <View style={styles.rowIcon}>
                <Ionicons name="information-circle-outline" size={15} color={colors.fg} />
              </View>
              <Text style={styles.rowText}>系统通知</Text>
            </View>
            <Switch
              value={settings.notifySystem}
              onValueChange={() => toggle('系统通知', settings.notifySystem, settings.setNotifySystem)}
              trackColor={{ false: colors.border, true: colors.accent }}
              thumbColor="#fff"
            />
          </View>
        </View>

        {/* 使用偏好 */}
        <Text style={styles.groupLabel}>使用偏好</Text>
        <View style={styles.group}>
          <View style={styles.row}>
            <View style={styles.rowName}>
              <View style={styles.rowIcon}>
                <Ionicons name="wifi-outline" size={15} color={colors.fg} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.rowText}>仅 Wi-Fi 下载离线地图</Text>
                <Text style={styles.rowSub}>避免路线离线包消耗蜂窝流量</Text>
              </View>
            </View>
            <Switch
              value={settings.wifiOnlyDownloads}
              onValueChange={() => toggle('仅 Wi-Fi 下载', settings.wifiOnlyDownloads, settings.setWifiOnlyDownloads)}
              trackColor={{ false: colors.border, true: colors.accent }}
              thumbColor="#fff"
            />
          </View>
          <TouchableOpacity style={[styles.row, styles.rowBorder]} activeOpacity={0.6} onPress={confirmClearCache}>
            <View style={styles.rowName}>
              <View style={styles.rowIcon}>
                <Ionicons name="trash-outline" size={15} color={colors.fg} />
              </View>
              <Text style={styles.rowText}>清除缓存</Text>
            </View>
            <View style={styles.rowRight}>
              <Text style={styles.rowVal}>{offlineRoutes.length > 0 ? `${offlineRoutes.length} 条离线路线` : '已清理'}</Text>
              <Text style={styles.chev}>›</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* 关于渔路 */}
        <Text style={styles.groupLabel}>关于渔路</Text>
        <View style={styles.group}>
          <TouchableOpacity style={styles.row} activeOpacity={0.6} onPress={() => openArticleDetail('terms')}>
            <Text style={styles.rowTextPlain}>用户协议</Text>
            <View style={styles.rowRight}>
              <Text style={styles.chev}>›</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.row, styles.rowBorder]} activeOpacity={0.6} onPress={() => openArticleDetail('privacy')}>
            <Text style={styles.rowTextPlain}>隐私政策</Text>
            <View style={styles.rowRight}>
              <Text style={styles.chev}>›</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.row, styles.rowBorder]} activeOpacity={0.6} onPress={checkUpdate}>
            <Text style={styles.rowTextPlain}>检查更新</Text>
            <View style={styles.rowRight}>
              {checking ? (
                <Text style={styles.checking}>检查中…</Text>
              ) : (
                <>
                  <Text style={styles.rowVal}>v{version}</Text>
                  <Text style={styles.chev}>›</Text>
                </>
              )}
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.row, styles.rowBorder]} activeOpacity={0.6} onPress={() => showToast('感谢支持，评分入口为示意')}>
            <Text style={styles.rowTextPlain}>给我们评分</Text>
            <View style={styles.rowRight}>
              {/* 对照原型的 4.5 星评分示意 */}
              <Text style={styles.stars}>
                <Text style={{ color: '#b8860b' }}>★★★★</Text>
                <Text style={{ color: colors.border }}>★</Text>
              </Text>
              <Text style={styles.chev}>›</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* 退出登录 */}
        <TouchableOpacity style={styles.logoutBtn} activeOpacity={0.7} onPress={confirmLogout}>
          <Text style={styles.logoutText}>退出登录</Text>
        </TouchableOpacity>
        <Text style={styles.versionNote}>渔路 YULU · 当前版本 v{version}</Text>
      </ScrollView>

      {/* 修改密码弹层 */}
      <Modal visible={pwdOpen} transparent animationType="slide" onRequestClose={() => setPwdOpen(false)}>
        <View style={styles.pwdOverlay}>
          <TouchableOpacity style={styles.pwdMask} activeOpacity={1} onPress={() => setPwdOpen(false)} />
          <View style={styles.pwdSheet}>
            <View style={styles.pwdHead}>
              <Text style={styles.pwdTitle}>修改密码</Text>
              <TouchableOpacity onPress={() => setPwdOpen(false)} activeOpacity={0.7}>
                <Ionicons name="close" size={20} color={colors.muted} />
              </TouchableOpacity>
            </View>
            {[
              { key: 'old' as const, label: '原密码', placeholder: '当前登录密码' },
              { key: 'next' as const, label: '新密码', placeholder: '至少 6 位' },
              { key: 'confirm' as const, label: '确认新密码', placeholder: '再输入一次新密码' },
            ].map((f) => (
              <React.Fragment key={f.key}>
                <Text style={styles.pwdLabel}>{f.label}</Text>
                <TextInput
                  style={styles.pwdInput}
                  value={pwd[f.key]}
                  onChangeText={(v) => setPwd((p) => ({ ...p, [f.key]: v }))}
                  placeholder={f.placeholder}
                  placeholderTextColor={colors.muted}
                  secureTextEntry
                  autoCorrect={false}
                />
              </React.Fragment>
            ))}
            <TouchableOpacity
              style={[styles.pwdSave, pwdSaving && { opacity: 0.6 }]}
              onPress={() => void savePassword()}
              disabled={pwdSaving}
              activeOpacity={0.8}
            >
              {pwdSaving ? <Text style={styles.pwdSaveT}>保存中…</Text> : <Text style={styles.pwdSaveT}>保存</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Toast */}
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
  groupLabel: {
    fontSize: 12, fontWeight: '600', color: colors.muted,
    marginHorizontal: 20, marginTop: 16, marginBottom: 7,
  },
  group: {
    marginHorizontal: 20,
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.lg,
  },
  row: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 13, minHeight: 46,
  },
  rowBorder: { borderTopWidth: 1, borderTopColor: colors.border },
  rowName: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  rowIcon: {
    width: 28, height: 28, borderRadius: 7, backgroundColor: colors.fgSoft,
    alignItems: 'center', justifyContent: 'center',
  },
  rowIconDanger: { backgroundColor: 'rgba(176, 58, 46, 0.12)' },
  rowText: { fontSize: 15, color: colors.fg },
  rowTextPlain: { fontSize: 15, color: colors.fg },
  rowDanger: { color: colors.danger },
  rowSub: { fontSize: 11, color: colors.muted, marginTop: 1 },
  rowRight: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  rowVal: { fontFamily: 'monospace', fontSize: 12, color: colors.muted },
  chev: { color: colors.muted, fontSize: 16 },
  checking: { fontSize: 12, color: colors.accent },
  stars: { fontSize: 11, letterSpacing: 1 },
  logoutBtn: {
    marginHorizontal: 20, marginTop: 22, paddingVertical: 13,
    borderRadius: radius.lg, backgroundColor: colors.surface,
    borderWidth: 1, borderColor: colors.border, alignItems: 'center',
  },
  logoutText: { fontSize: 15, fontWeight: '600', color: colors.danger },
  versionNote: { textAlign: 'center', fontSize: 11, color: colors.muted, marginTop: 18 },
  toast: {
    position: 'absolute', bottom: 120, alignSelf: 'center',
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: colors.fg, paddingHorizontal: 18, paddingVertical: 10, borderRadius: 999,
    shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowRadius: 12, shadowOpacity: 0.3,
  },
  toastText: { fontSize: 13, color: '#fff' },
  pwdOverlay: { flex: 1, justifyContent: 'flex-end' },
  pwdMask: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(10, 14, 12, 0.45)' },
  pwdSheet: {
    backgroundColor: colors.bg, borderTopLeftRadius: 22, borderTopRightRadius: 22,
    paddingHorizontal: 20, paddingBottom: 24, paddingTop: 14,
  },
  pwdHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  pwdTitle: { fontFamily: 'Georgia', fontSize: 17, fontWeight: '600', color: colors.fg },
  pwdLabel: { fontSize: 12, color: colors.muted, marginTop: 12, marginBottom: 6 },
  pwdInput: {
    borderWidth: 1, borderColor: colors.border, borderRadius: radius.md,
    backgroundColor: colors.surface, paddingHorizontal: 12, paddingVertical: 10,
    fontSize: 14, color: colors.fg,
  },
  pwdSave: {
    marginTop: 18, minHeight: 44, borderRadius: 999, backgroundColor: colors.accent,
    alignItems: 'center', justifyContent: 'center',
  },
  pwdSaveT: { color: '#fff', fontSize: 15, fontWeight: '600' },
});

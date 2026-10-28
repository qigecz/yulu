import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform,
  ScrollView, Modal, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, radius } from '@yulu/ui';
import { useAuthStore } from '../store/auth';
import { USE_MOCK } from '../config';
import { ApiError } from '../api/client';
import { mockArticles, type MockArticle } from '../mock/data';

type Mode = 'login' | 'register';
type LoginTab = 'code' | 'pwd';
/** 字段行内错误（对照原型 cause + remedy 两段）。 */
type FieldErrors = Record<string, string | null>;

const validPhone = (v: string) => /^1\d{10}$/.test(v);

/** 密码强度（对照原型 3 段条）：弱 / 中 / 强。 */
function pwdLevel(pwd: string): 0 | 1 | 2 | 3 {
  if (!pwd) return 0;
  let score = 0;
  if (pwd.length >= 8) score += 1;
  if (/[a-zA-Z]/.test(pwd) && /\d/.test(pwd)) score += 1;
  if (/[^a-zA-Z0-9]/.test(pwd) || pwd.length >= 14) score += 1;
  return Math.max(1, score) as 1 | 2 | 3;
}

/**
 * 登录 / 注册（对照 ios-login.html / ios-register.html）。
 * 登录：品牌区 + 验证码/密码双 Tab（行内校验）+ 协议勾选 + 第三方示意。
 * 注册：五字段表单 + 密码强度条 + 协议。短信验证码服务未接入：发送按钮给
 * 倒计时与提示，real 模式验证码登录暂引导走密码登录；注册验证码前端必填
 * （后端暂不校验）。协议全文用本地 Modal 渲染（未认证阶段无 overlay 体系）。
 */
export function AuthScreen() {
  const { login, register } = useAuthStore();
  const [mode, setMode] = useState<Mode>('login');

  // 认证页局部 toast（页面无全局 toast 体系，模块级 toast() 触发）。
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    toastListener = (m) => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
      setToastMsg(m);
      toastTimer.current = setTimeout(() => setToastMsg(null), 2200);
    };
    return () => { toastListener = null; if (toastTimer.current) clearTimeout(toastTimer.current); };
  }, []);

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.flex}>
        {mode === 'login' ? <LoginView onGoRegister={() => setMode('register')} /> : <RegisterView onBack={() => setMode('login')} />}
        {toastMsg && (
          <View style={styles.toastWrap}>
            <Ionicons name="checkmark" size={14} color="#7dd8c3" />
            <Text style={styles.toastT}>{toastMsg}</Text>
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );

  /* ─────────────── 登录 ─────────────── */
  function LoginView({ onGoRegister }: { onGoRegister: () => void }) {
    const [tab, setTab] = useState<LoginTab>('pwd');
    const [phone, setPhone] = useState('');
    const [sms, setSms] = useState('');
    const [pwd, setPwd] = useState('');
    const [showPwd, setShowPwd] = useState(false);
    const [agree, setAgree] = useState(false);
    const [errors, setErrors] = useState<FieldErrors>({});
    const [loading, setLoading] = useState(false);
    const [legal, setLegal] = useState<MockArticle | null>(null);

    const err = (k: string) => {
      if (k === 'agree') return !agree && errors.agree ? errors.agree : null;
      return errors[k] ?? null;
    };

    const onSubmit = async () => {
      const errs: FieldErrors = {};
      if (!validPhone(phone)) errs.phone = '请输入 11 位大陆手机号';
      if (tab === 'code' && !/^\d{6}$/.test(sms)) errs.sms = '请输入 6 位短信验证码';
      if (tab === 'pwd' && pwd.length < 6) errs.pwd = '密码至少 6 位，可尝试「忘记密码」重置';
      if (!agree) errs.agree = '请先阅读并勾选同意《用户协议》和《隐私政策》';
      setErrors(errs);
      if (Object.keys(errs).length > 0) return;

      // 验证码登录依赖短信服务，当前引导走密码登录（对照原型预留入口）。
      if (tab === 'code' && !USE_MOCK) {
        setErrors({ sms: '短信验证码服务暂未接入，请使用密码登录' });
        setTab('pwd');
        return;
      }

      setLoading(true);
      try {
        await login(phone, pwd || '888888');
      } catch (e) {
        setErrors({ pwd: e instanceof ApiError ? e.message : '登录失败，请检查网络后重试' });
      } finally {
        setLoading(false);
      }
    };

    return (
      <ScrollView style={styles.flex} contentContainerStyle={styles.loginContainer} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        {/* 品牌区 */}
        <View style={styles.hero}>
          <View style={styles.logoMark}>
            <Text style={styles.logoEmoji}>🎣</Text>
          </View>
          <Text style={styles.heroTitle}>
            渔路 <Text style={styles.heroEn}>YULU · Fishing Routes</Text>
          </Text>
          <Text style={styles.slogan}>找坑点，走渔路 —— 和 12 万钓友一起出钓</Text>
        </View>

        {/* 登录方式切换 */}
        <View style={styles.tabs}>
          {(['code', 'pwd'] as LoginTab[]).map((t) => (
            <TouchableOpacity key={t} style={[styles.tab, tab === t && styles.tabOn]} onPress={() => { setTab(t); setErrors({}); }} activeOpacity={0.8}>
              <Text style={[styles.tabT, tab === t && styles.tabTOn]}>{t === 'code' ? '验证码登录' : '密码登录'}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 表单 */}
        <View style={styles.form}>
          <FieldRow pre="+86" error={err('phone')}>
            <Input
              value={phone}
              onChange={(v) => { setPhone(v); setErrors((e) => ({ ...e, phone: null })); }}
              placeholder="请输入手机号"
              keyboardType="number-pad"
              maxLength={11}
            />
          </FieldRow>

          {tab === 'code' ? (
            <FieldRow pre="验证码" error={err('sms')}>
              <Input
                value={sms}
                onChange={(v) => { setSms(v); setErrors((e) => ({ ...e, sms: null })); }}
                placeholder="6 位短信验证码"
                keyboardType="number-pad"
                maxLength={6}
                mono
              />
              <CodeButton />
            </FieldRow>
          ) : (
            <FieldRow pre="密码" error={err('pwd')}>
              <Input
                value={pwd}
                onChange={(v) => { setPwd(v); setErrors((e) => ({ ...e, pwd: null })); }}
                placeholder="请输入密码"
                secureTextEntry={!showPwd}
              />
              <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowPwd((s) => !s)} activeOpacity={0.7}>
                <Ionicons name={showPwd ? 'eye-off-outline' : 'eye-outline'} size={18} color={colors.muted} />
              </TouchableOpacity>
            </FieldRow>
          )}
        </View>

        {/* 协议 */}
        <AgreeRow
          agree={agree}
          onToggle={() => { setAgree((v) => !v); setErrors((e) => ({ ...e, agree: null })); }}
          error={err('agree')}
          onOpenLegal={setLegal}
          withPush
        />

        {/* 登录按钮 */}
        <TouchableOpacity style={[styles.loginBtn, loading && styles.btnOff]} onPress={() => void onSubmit()} disabled={loading} activeOpacity={0.8}>
          {loading ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.loginBtnT}>登 录</Text>}
        </TouchableOpacity>

        {/* 第三方登录 */}
        <View style={styles.alt}>
          <Text style={styles.altLbl}>其他登录方式</Text>
          <View style={styles.altBtns}>
            <TouchableOpacity style={styles.altBtn} onPress={() => toast('微信登录即将上线')} activeOpacity={0.8}>
              <Text style={styles.altWx}>微</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.altBtn} onPress={() => toast('Apple 登录即将上线')} activeOpacity={0.8}>
              <Ionicons name="logo-apple" size={24} color={colors.fg} />
            </TouchableOpacity>
          </View>
        </View>

        {/* 注册入口 */}
        <Text style={styles.toRegister}>
          还没有账号？<Text style={styles.toRegisterLink} onPress={onGoRegister}>创建渔路账号</Text>
        </Text>

        {USE_MOCK && <Text style={styles.mockHint}>开发模式 · 后端未连接</Text>}

        <LegalModal article={legal} onClose={() => setLegal(null)} />
      </ScrollView>
    );
  }

  /* ─────────────── 注册 ─────────────── */
  function RegisterView({ onBack }: { onBack: () => void }) {
    const [phone, setPhone] = useState('');
    const [sms, setSms] = useState('');
    const [pwd, setPwd] = useState('');
    const [pwd2, setPwd2] = useState('');
    const [nick, setNick] = useState('钓友8866');
    const [showPwd, setShowPwd] = useState(false);
    const [agree, setAgree] = useState(false);
    const [errors, setErrors] = useState<FieldErrors>({});
    const [loading, setLoading] = useState(false);
    const [legal, setLegal] = useState<MockArticle | null>(null);

    const level = pwdLevel(pwd);
    const levelLabel = ['弱', '中', '强'][Math.max(0, level - 1)] ?? '';

    const onSubmit = async () => {
      const errs: FieldErrors = {};
      if (!validPhone(phone)) errs.phone = '请输入 11 位大陆手机号';
      if (!/^\d{6}$/.test(sms)) errs.sms = '请输入 6 位短信验证码';
      if (pwd.length < 8 || pwd.length > 20) errs.pwd = '密码需 8-20 位，字母 + 数字更安全';
      if (pwd2 !== pwd) errs.pwd2 = '两次输入的密码不一致';
      if (nick.trim().length < 2) errs.nick = '昵称至少 2 个字';
      if (!agree) errs.agree = '请先阅读并勾选同意《用户协议》和《隐私政策》';
      setErrors(errs);
      if (Object.keys(errs).length > 0) return;

      setLoading(true);
      try {
        await register(phone, pwd, nick.trim());
      } catch (e) {
        setErrors({ phone: e instanceof ApiError ? e.message : '注册失败，请检查网络后重试' });
      } finally {
        setLoading(false);
      }
    };

    return (
      <ScrollView style={styles.flex} contentContainerStyle={styles.regContainer} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        {/* Navbar */}
        <View style={styles.navbar}>
          <TouchableOpacity style={styles.navBack} onPress={onBack} activeOpacity={0.7}>
            <Ionicons name="chevron-back" size={18} color={colors.accent} />
            <Text style={styles.navBackT}>登录</Text>
          </TouchableOpacity>
          <Text style={styles.navTitle}>注册</Text>
          <View style={{ width: 74 }} />
        </View>

        {/* 品牌头 */}
        <View style={styles.regHead}>
          <View style={styles.logoMini}>
            <Text style={styles.logoMiniEmoji}>🎣</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.regHeadTitle}>加入渔路</Text>
            <Text style={styles.regHeadSub}>注册即可收藏坑点、下载离线路线</Text>
          </View>
        </View>

        {/* 表单 */}
        <View style={styles.form}>
          <FieldRow pre="手机号" error={errors.phone ?? null}>
            <Input
              value={phone}
              onChange={(v) => { setPhone(v); setErrors((e) => ({ ...e, phone: null })); }}
              placeholder="用于登录和找回密码"
              keyboardType="number-pad"
              maxLength={11}
            />
          </FieldRow>
          <FieldRow pre="验证码" error={errors.sms ?? null}>
            <Input
              value={sms}
              onChange={(v) => { setSms(v); setErrors((e) => ({ ...e, sms: null })); }}
              placeholder="6 位短信验证码"
              keyboardType="number-pad"
              maxLength={6}
              mono
            />
            <CodeButton />
          </FieldRow>
          <FieldRow pre="设置密码" error={errors.pwd ?? null}>
            <Input
              value={pwd}
              onChange={(v) => { setPwd(v); setErrors((e) => ({ ...e, pwd: null })); }}
              placeholder="8-20 位，字母 + 数字更安全"
              secureTextEntry={!showPwd}
            />
            <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowPwd((s) => !s)} activeOpacity={0.7}>
              <Ionicons name={showPwd ? 'eye-off-outline' : 'eye-outline'} size={18} color={colors.muted} />
            </TouchableOpacity>
          </FieldRow>
          <FieldRow pre="确认密码" error={errors.pwd2 ?? null}>
            <Input
              value={pwd2}
              onChange={(v) => { setPwd2(v); setErrors((e) => ({ ...e, pwd2: null })); }}
              placeholder="再输入一次密码"
              secureTextEntry={!showPwd}
            />
          </FieldRow>
          <FieldRow pre="昵称" error={errors.nick ?? null}>
            <Input
              value={nick}
              onChange={(v) => { setNick(v); setErrors((e) => ({ ...e, nick: null })); }}
              placeholder="钓友昵称"
              maxLength={12}
            />
          </FieldRow>
        </View>

        {/* 密码强度 */}
        {pwd ? (
          <View style={styles.strength}>
            <View style={styles.bars}>
              {[1, 2, 3].map((i) => (
                <View key={i} style={[styles.bar, level >= i && (level === 3 ? styles.barStrong : level === 2 ? styles.barMid : styles.barWeak)]} />
              ))}
            </View>
            <Text style={[styles.strengthTag, level === 3 && { color: colors.accent }]}>{levelLabel}</Text>
          </View>
        ) : null}
        <Text style={styles.hint}>{pwd ? '建议使用字母、数字搭配，8 位以上更安全' : '建议使用字母、数字搭配，8 位以上更安全'}</Text>

        {/* 协议 */}
        <AgreeRow
          agree={agree}
          onToggle={() => { setAgree((v) => !v); setErrors((e) => ({ ...e, agree: null })); }}
          error={errors.agree ?? null}
          onOpenLegal={setLegal}
        />

        {/* 注册按钮 */}
        <TouchableOpacity style={[styles.regBtn, loading && styles.btnOff]} onPress={() => void onSubmit()} disabled={loading} activeOpacity={0.8}>
          {loading ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.regBtnT}>注 册</Text>}
        </TouchableOpacity>

        <LegalModal article={legal} onClose={() => setLegal(null)} />
      </ScrollView>
    );
  }

  /* ─────────────── 共用小组件 ─────────────── */

  /** 获取验证码按钮：60 秒倒计时；短信服务未接入时提示。 */
  function CodeButton() {
    const [left, setLeft] = useState(0);
    useEffect(() => {
      if (left <= 0) return;
      const t = setTimeout(() => setLeft((n) => n - 1), 1000);
      return () => clearTimeout(t);
    }, [left]);
    return (
      <TouchableOpacity
        style={[styles.codeBtn, left > 0 && styles.codeBtnOff]}
        onPress={() => {
          if (left > 0) return;
          setLeft(60);
          toast('验证码已发送（短信服务即将接入，请先使用密码登录）');
        }}
        activeOpacity={0.8}
      >
        <Text style={styles.codeBtnT}>{left > 0 ? `${left}s 后重发` : '获取验证码'}</Text>
      </TouchableOpacity>
    );
  }

  /** 协议勾选行（《用户协议》《隐私政策》可打开全文）。 */
  function AgreeRow({ agree, onToggle, error, onOpenLegal, withPush }: {
    agree: boolean; onToggle: () => void; error: string | null;
    onOpenLegal: (a: MockArticle) => void; withPush?: boolean;
  }) {
    return (
      <View>
        <TouchableOpacity style={styles.agree} onPress={onToggle} activeOpacity={0.7}>
          <Ionicons name={agree ? 'checkbox' : 'square-outline'} size={16} color={agree ? colors.accent : colors.muted} />
          <Text style={styles.agreeT}>
            我已阅读并同意{' '}
            <Text style={styles.agreeLink} onPress={() => onOpenLegal(mockArticles.find((a) => a.id === 'terms')!)}>《用户协议》</Text>
            和
            <Text style={styles.agreeLink} onPress={() => onOpenLegal(mockArticles.find((a) => a.id === 'privacy')!)}>《隐私政策》</Text>
            {withPush ? '，并同意接收出鱼提醒通知' : ''}
          </Text>
        </TouchableOpacity>
        {!!error && <Text style={styles.agreeErr}>{error}</Text>}
      </View>
    );
  }
}

/* ─────────────── 无状态子组件（组件外定义，避免重建） ─────────────── */

function FieldRow({ pre, error, children }: { pre: string; error?: string | null; children: React.ReactNode }) {
  return (
    <View style={{ marginBottom: 14 }}>
      <View style={[styles.field, !!error && styles.fieldErr]}>
        <Text style={styles.pre}>{pre}</Text>
        {children}
      </View>
      {!!error && <Text style={styles.fieldErrT}>{error}</Text>}
    </View>
  );
}

function Input({
  value, onChange, placeholder, keyboardType, maxLength, secureTextEntry, mono,
}: {
  value: string; onChange: (v: string) => void; placeholder: string;
  keyboardType?: 'default' | 'number-pad'; maxLength?: number; secureTextEntry?: boolean; mono?: boolean;
}) {
  return (
    <TextInput
      style={[styles.input, mono && styles.inputMono]}
      value={value}
      onChangeText={onChange}
      placeholder={placeholder}
      placeholderTextColor={colors.muted}
      keyboardType={keyboardType}
      maxLength={maxLength}
      secureTextEntry={secureTextEntry}
      autoCorrect={false}
    />
  );
}

/** 协议全文弹层：简版正文块渲染（复用 mockArticles 的法律文稿）。 */
function LegalModal({ article, onClose }: { article: MockArticle | null; onClose: () => void }) {
  return (
    <Modal visible={!!article} animationType="slide" onRequestClose={onClose}>
      <View style={styles.legalWrap}>
        <View style={styles.legalNav}>
          <TouchableOpacity style={styles.navBack} onPress={onClose} activeOpacity={0.7}>
            <Ionicons name="chevron-back" size={18} color={colors.accent} />
            <Text style={styles.navBackT}>返回</Text>
          </TouchableOpacity>
          <Text style={styles.navTitle}>{article?.eyebrow}</Text>
          <View style={{ width: 74 }} />
        </View>
        <ScrollView style={styles.flex} contentContainerStyle={{ padding: 20 }} showsVerticalScrollIndicator={false}>
          <Text style={styles.legalTitle}>{article?.title}</Text>
          {article?.blocks.map((b, i) => {
            if (b.type === 'h2') return <Text key={i} style={styles.legalH2}>{b.text}</Text>;
            if (b.type === 'quote') return <Text key={i} style={styles.legalQuote}>{b.text}</Text>;
            if (b.type === 'table') {
              return (
                <View key={i} style={styles.legalTable}>
                  {b.rows.map((row, r) => (
                    <Text key={r} style={styles.legalTableRow}>{row.join(' · ')}</Text>
                  ))}
                </View>
              );
            }
            return <Text key={i} style={styles.legalP}>{b.text}</Text>;
          })}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.bg },
  /* 登录容器 */
  loginContainer: { paddingHorizontal: spacing.screenPadding, paddingTop: 54, paddingBottom: 32 },
  hero: { alignItems: 'center', marginBottom: 30 },
  logoMark: {
    width: 96, height: 96, borderRadius: 28, backgroundColor: colors.accentSoft,
    borderWidth: 2, borderColor: '#fff', alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowRadius: 18, shadowOpacity: 0.12,
  },
  logoEmoji: { fontSize: 46 },
  heroTitle: { fontFamily: 'Georgia', fontSize: 26, fontWeight: '700', color: colors.fg, marginTop: 14 },
  heroEn: { fontSize: 12, fontWeight: '400', color: colors.muted, letterSpacing: 0.5 },
  slogan: { fontSize: fontSize.meta, color: colors.muted, marginTop: 6 },
  /* Tab */
  tabs: {
    flexDirection: 'row', backgroundColor: colors.fgSoft, borderRadius: 999, padding: 2, marginBottom: 18,
  },
  tab: { flex: 1, paddingVertical: 9, borderRadius: 999, alignItems: 'center' },
  tabOn: { backgroundColor: colors.fg },
  tabT: { fontSize: 13, color: colors.muted },
  tabTOn: { color: '#fff', fontWeight: '600' },
  /* 表单 */
  form: {},
  field: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    borderWidth: 1, borderColor: colors.border, borderRadius: radius.md,
    backgroundColor: colors.surface, paddingHorizontal: 14, minHeight: 48,
  },
  fieldErr: { borderColor: colors.danger },
  fieldErrT: { fontSize: fontSize.tiny, color: colors.danger, marginTop: 5, marginLeft: 2 },
  pre: { fontSize: 13, color: colors.muted, width: 44, flexShrink: 0 },
  input: { flex: 1, fontSize: fontSize.body, color: colors.fg, paddingVertical: 12 },
  inputMono: { fontFamily: 'monospace', letterSpacing: 2 },
  eyeBtn: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center' },
  codeBtn: {
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999,
    borderWidth: 1, borderColor: colors.accent, flexShrink: 0,
  },
  codeBtnOff: { borderColor: colors.border },
  codeBtnT: { fontSize: 12, color: colors.accent },
  /* 协议 */
  agree: { flexDirection: 'row', alignItems: 'flex-start', gap: 7, marginTop: 2 },
  agreeT: { flex: 1, fontSize: fontSize.tiny, color: colors.muted, lineHeight: 17 },
  agreeLink: { color: colors.accent },
  agreeErr: { fontSize: fontSize.tiny, color: colors.danger, marginTop: 5, marginLeft: 23 },
  /* 按钮 */
  loginBtn: {
    backgroundColor: colors.accent, borderRadius: radius.md, minHeight: 48,
    alignItems: 'center', justifyContent: 'center', marginTop: 20,
  },
  loginBtnT: { color: '#fff', fontSize: 16, fontWeight: '600', letterSpacing: 6 },
  regBtn: {
    backgroundColor: colors.accent, borderRadius: radius.md, minHeight: 48,
    alignItems: 'center', justifyContent: 'center', marginTop: 18,
  },
  regBtnT: { color: '#fff', fontSize: 16, fontWeight: '600', letterSpacing: 6 },
  btnOff: { opacity: 0.6 },
  /* 第三方登录 */
  alt: { alignItems: 'center', marginTop: 26 },
  altLbl: { fontSize: fontSize.tiny, color: colors.muted },
  altBtns: { flexDirection: 'row', gap: 18, marginTop: 14 },
  altBtn: {
    width: 48, height: 48, borderRadius: 24, backgroundColor: colors.surface,
    borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center',
  },
  altWx: { fontSize: 20, color: '#2aae67', fontWeight: '600' },
  toRegister: { textAlign: 'center', fontSize: fontSize.meta, color: colors.muted, marginTop: 24 },
  toRegisterLink: { color: colors.accent, fontWeight: '600' },
  mockHint: { textAlign: 'center', fontSize: fontSize.tiny, color: colors.muted, marginTop: 14 },
  /* 注册容器 */
  regContainer: { paddingHorizontal: spacing.screenPadding, paddingBottom: 32 },
  navbar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 8, paddingBottom: 6, marginHorizontal: -4,
  },
  navBack: { flexDirection: 'row', alignItems: 'center', width: 74 },
  navBackT: { color: colors.accent, fontSize: 15 },
  navTitle: { fontFamily: 'Georgia', fontSize: 17, fontWeight: '600', color: colors.fg },
  regHead: { flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: 16, marginBottom: 22 },
  logoMini: {
    width: 62, height: 62, borderRadius: 18, backgroundColor: colors.accentSoft,
    borderWidth: 2, borderColor: '#fff', alignItems: 'center', justifyContent: 'center',
  },
  logoMiniEmoji: { fontSize: 30 },
  regHeadTitle: { fontFamily: 'Georgia', fontSize: 22, fontWeight: '700', color: colors.fg },
  regHeadSub: { fontSize: fontSize.meta, color: colors.muted, marginTop: 4 },
  /* 密码强度 */
  strength: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: -2, marginBottom: 6, marginLeft: 2 },
  bars: { flexDirection: 'row', gap: 4 },
  bar: { width: 28, height: 4, borderRadius: 2, backgroundColor: colors.fgSoft },
  barWeak: { backgroundColor: '#d9483a' },
  barMid: { backgroundColor: '#e8a33d' },
  barStrong: { backgroundColor: colors.accent },
  strengthTag: { fontSize: fontSize.tiny, color: colors.muted },
  hint: { fontSize: fontSize.tiny, color: colors.muted, marginLeft: 2, marginBottom: 6 },
  /* 协议全文弹层 */
  legalWrap: { flex: 1, backgroundColor: colors.bg, paddingTop: 6 },
  legalNav: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 12, paddingVertical: 8,
  },
  legalTitle: { fontFamily: 'Georgia', fontSize: 21, fontWeight: '700', color: colors.fg, marginBottom: 6 },
  legalH2: { fontFamily: 'Georgia', fontSize: 16, fontWeight: '600', color: colors.fg, marginTop: 18, marginBottom: 6 },
  legalP: { fontSize: 14, color: colors.fg, lineHeight: 23, marginTop: 6 },
  legalQuote: {
    fontSize: 13, color: colors.fg, lineHeight: 21, marginTop: 10,
    paddingVertical: 8, paddingHorizontal: 12, borderLeftWidth: 3,
    borderLeftColor: colors.accent, backgroundColor: colors.accentSoft,
  },
  legalTable: {
    borderWidth: 1, borderColor: colors.border, borderRadius: radius.md,
    backgroundColor: colors.surface, marginTop: 10, padding: 12, gap: 6,
  },
  legalTableRow: { fontSize: 12, color: colors.muted, lineHeight: 18 },
  toastWrap: {
    position: 'absolute', bottom: 90, alignSelf: 'center',
    flexDirection: 'row', alignItems: 'center', gap: 6, maxWidth: '86%',
    backgroundColor: colors.fg, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 999,
    shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowRadius: 12, shadowOpacity: 0.3,
  },
  toastT: { fontSize: 12.5, color: '#fff', flexShrink: 1 },
});

/* Toast：模块级简单实现（认证页无全局 toast 体系）。 */
let toastListener: ((msg: string) => void) | null = null;
function toast(msg: string) {
  toastListener?.(msg);
}

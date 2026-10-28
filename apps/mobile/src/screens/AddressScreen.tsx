import React, { useRef, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius } from '@yulu/ui';
import { useUIStore } from '../store/ui';
import { mockAddresses, type MockAddress } from '../mock/data';

/**
 * 收货地址管理（对照 ios-address.html）：地址卡（默认实心徽标 + 设为默认/
 * 编辑/删除三按钮）、全宽「新增收货地址」底栏、编辑抽屉（把手 + 必填星号 +
 * 字段级错误文案 + 「保存地址」）、删除确认。端上 mock。
 */
export function AddressScreen() {
  const close = useUIStore((s) => s.closeOverlay);
  const [addresses, setAddresses] = useState<MockAddress[]>(mockAddresses);
  const [editing, setEditing] = useState<MockAddress | null>(null); // null = 关闭
  const [sheetOpen, setSheetOpen] = useState(false);
  const [form, setForm] = useState({ name: '', tel: '', region: '', detail: '', def: false });
  const [fieldErr, setFieldErr] = useState<Record<string, string>>({});

  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showToast = (msg: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast(msg);
    toastTimer.current = setTimeout(() => setToast(null), 1800);
  };

  const openNew = () => {
    setEditing(null);
    setForm({ name: '', tel: '', region: '', detail: '', def: addresses.length === 0 });
    setFieldErr({});
    setSheetOpen(true);
  };

  const openEdit = (a: MockAddress) => {
    setEditing(a);
    setForm({ name: a.name, tel: a.tel, region: a.region, detail: a.detail, def: a.def });
    setFieldErr({});
    setSheetOpen(true);
  };

  /** 字段级校验（文案对照原型）。返回是否全部通过。 */
  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = '请填写联系人姓名';
    if (!/^1\d{10}$/.test(form.tel.trim())) errs.tel = '手机号应为 11 位数字，请检查';
    if (!form.region.trim()) errs.region = '请填写省市区';
    if (!form.detail.trim()) errs.detail = '请填写详细地址，如街道、门牌号、附近标志物';
    setFieldErr(errs);
    return Object.keys(errs).length === 0;
  };

  const save = () => {
    if (!validate()) return;
    setAddresses((prev) => {
      let next: MockAddress[];
      if (editing) {
        next = prev.map((a) => (a.id === editing.id ? { ...a, ...form } : a));
      } else {
        const id = Math.max(0, ...prev.map((a) => a.id)) + 1;
        next = [...prev, { id, ...form }];
      }
      if (form.def) {
        const me = editing ? editing.id : Math.max(...next.map((a) => a.id));
        next = next.map((a) => (a.id === me ? a : { ...a, def: false }));
      }
      return next;
    });
    setSheetOpen(false);
    showToast(editing ? '地址已更新' : '已添加收货地址');
  };

  const confirmDelete = (a: MockAddress) => {
    Alert.alert('删除地址', `确定删除「${a.region}」的收货地址吗？`, [
      { text: '取消', style: 'cancel' },
      {
        text: '删除',
        style: 'destructive',
        onPress: () => {
          setAddresses((prev) => {
            const next = prev.filter((x) => x.id !== a.id);
            if (a.def && next.length > 0) next[0] = { ...next[0], def: true };
            return next;
          });
          showToast('地址已删除');
        },
      },
    ]);
  };

  const setDefault = (a: MockAddress) => {
    setAddresses((prev) => prev.map((x) => (x.id === a.id ? { ...x, def: true } : { ...x, def: false })));
    showToast('已设为默认地址');
  };

  const fields: { key: 'name' | 'tel' | 'region' | 'detail'; label: string; placeholder: string; multiline?: boolean }[] = [
    { key: 'name', label: '联系人', placeholder: '收件人姓名' },
    { key: 'tel', label: '手机号', placeholder: '11 位手机号码' },
    { key: 'region', label: '所在地区', placeholder: '省 市 区' },
    { key: 'detail', label: '详细地址', placeholder: '街道、门牌号、附近标志物', multiline: true },
  ];

  return (
    <View style={styles.wrapper}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Navbar */}
        <View style={styles.navbar}>
          <TouchableOpacity style={styles.navSide} onPress={close} activeOpacity={0.7}>
            <Ionicons name="chevron-back" size={18} color={colors.accent} />
            <Text style={styles.backText}>订单</Text>
          </TouchableOpacity>
          <Text style={styles.navTitle}>收货地址</Text>
          <View style={styles.navSide} />
        </View>

        {addresses.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>📍</Text>
            <Text style={styles.emptyText}>还没有收货地址，添加一个方便渔具到家</Text>
          </View>
        ) : (
          <View style={{ paddingHorizontal: 16 }}>
            {addresses.map((a) => (
              <View key={a.id} style={styles.card}>
                <TouchableOpacity style={styles.cardMain} onPress={() => openEdit(a)} activeOpacity={0.7}>
                  <View style={styles.addrHead}>
                    <Text style={styles.addrName}>{a.name}</Text>
                    <Text style={styles.addrTel}>{a.tel.slice(0, 3)}****{a.tel.slice(7)}</Text>
                    {a.def && <View style={styles.defTag}><Text style={styles.defTagT}>默认</Text></View>}
                  </View>
                  <Text style={styles.addrDetail} numberOfLines={2}>{a.region} · {a.detail}</Text>
                </TouchableOpacity>
                <View style={styles.cardFoot}>
                  {!a.def ? (
                    <TouchableOpacity style={styles.footBtn} onPress={() => setDefault(a)} activeOpacity={0.7}>
                      <Ionicons name="star-outline" size={13} color={colors.muted} />
                      <Text style={styles.footBtnT}>设为默认</Text>
                    </TouchableOpacity>
                  ) : (
                    <View style={styles.footBtn}>
                      <Ionicons name="star" size={13} color={colors.accent} />
                      <Text style={[styles.footBtnT, { color: colors.accent }]}>默认地址</Text>
                    </View>
                  )}
                  <TouchableOpacity style={styles.footBtn} onPress={() => openEdit(a)} activeOpacity={0.7}>
                    <Ionicons name="create-outline" size={13} color={colors.muted} />
                    <Text style={styles.footBtnT}>编辑</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.footBtn} onPress={() => confirmDelete(a)} activeOpacity={0.7}>
                    <Ionicons name="trash-outline" size={13} color={colors.danger} />
                    <Text style={[styles.footBtnT, { color: colors.danger }]}>删除</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* 全宽底栏：新增收货地址 */}
      <TouchableOpacity style={styles.addBtn} onPress={openNew} activeOpacity={0.8}>
        <Ionicons name="add" size={17} color="#fff" />
        <Text style={styles.addBtnT}>新增收货地址</Text>
      </TouchableOpacity>

      {/* 编辑/新增抽屉 */}
      <Modal visible={sheetOpen} transparent animationType="slide" onRequestClose={() => setSheetOpen(false)}>
        <View style={styles.sheetOverlay}>
          <TouchableOpacity style={styles.sheetMask} activeOpacity={1} onPress={() => setSheetOpen(false)} />
          <View style={styles.sheet}>
            <View style={styles.sheetHandle} />
            <View style={styles.sheetHead}>
              <Text style={styles.sheetTitle}>{editing ? '编辑收货地址' : '新增收货地址'}</Text>
              <TouchableOpacity onPress={() => setSheetOpen(false)} activeOpacity={0.7}>
                <Ionicons name="close" size={20} color={colors.muted} />
              </TouchableOpacity>
            </View>

            {fields.map((f) => (
              <React.Fragment key={f.key}>
                <Text style={styles.fieldLabel}>
                  {f.label}
                  <Text style={styles.fieldStar}> *</Text>
                </Text>
                <TextInput
                  style={[styles.input, f.multiline && { minHeight: 64 }]}
                  value={form[f.key]}
                  onChangeText={(v) => {
                    setForm((s) => ({ ...s, [f.key]: f.key === 'tel' ? v.replace(/[^0-9]/g, '').slice(0, 11) : v }));
                    setFieldErr((e) => ({ ...e, [f.key]: '' }));
                  }}
                  placeholder={f.placeholder}
                  placeholderTextColor={colors.muted}
                  keyboardType={f.key === 'tel' ? 'number-pad' : 'default'}
                  multiline={f.multiline}
                />
                {!!fieldErr[f.key] && <Text style={styles.fieldErr}>{fieldErr[f.key]}</Text>}
              </React.Fragment>
            ))}

            <TouchableOpacity
              style={styles.defRow}
              onPress={() => setForm((f) => ({ ...f, def: !f.def }))}
              activeOpacity={0.7}
            >
              <Ionicons name={form.def ? 'checkbox' : 'square-outline'} size={18} color={form.def ? colors.accent : colors.muted} />
              <Text style={styles.defRowT}>设为默认地址</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.saveBtn} onPress={save} activeOpacity={0.8}>
              <Text style={styles.saveBtnT}>保存地址</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

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
  empty: { alignItems: 'center', paddingTop: 100 },
  emptyEmoji: { fontSize: 44 },
  emptyText: { fontSize: 13.5, color: colors.muted, marginTop: 12, marginHorizontal: 40, textAlign: 'center' },
  card: {
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.lg, padding: 14, marginBottom: 10,
  },
  cardMain: {},
  addrHead: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  addrName: { fontSize: 15, fontWeight: '600', color: colors.fg },
  addrTel: { fontSize: 12, color: colors.muted, fontFamily: 'monospace' },
  defTag: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999, backgroundColor: colors.accent },
  defTagT: { fontSize: 10, color: '#fff', fontWeight: '600' },
  addrDetail: { fontSize: 12.5, color: colors.muted, marginTop: 5, lineHeight: 18 },
  cardFoot: {
    flexDirection: 'row', justifyContent: 'flex-end', gap: 18,
    marginTop: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: colors.border,
  },
  footBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  footBtnT: { fontSize: 12, color: colors.muted },
  addBtn: {
    position: 'absolute', left: 16, right: 16, bottom: 20,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    minHeight: 48, borderRadius: radius.lg, backgroundColor: colors.accent,
    shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowRadius: 12, shadowOpacity: 0.3,
  },
  addBtnT: { color: '#fff', fontSize: 15, fontWeight: '600' },
  sheetOverlay: { flex: 1, justifyContent: 'flex-end' },
  sheetMask: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(10, 14, 12, 0.45)' },
  sheet: {
    backgroundColor: colors.bg, borderTopLeftRadius: 22, borderTopRightRadius: 22,
    paddingHorizontal: 20, paddingBottom: 24, paddingTop: 8,
  },
  sheetHandle: {
    width: 36, height: 4, borderRadius: 999, backgroundColor: colors.border,
    alignSelf: 'center', marginBottom: 10,
  },
  sheetHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  sheetTitle: { fontFamily: 'Georgia', fontSize: 17, fontWeight: '600', color: colors.fg },
  fieldLabel: { fontSize: 12, color: colors.muted, marginTop: 12, marginBottom: 6 },
  fieldStar: { color: colors.danger },
  fieldErr: { fontSize: 11, color: colors.danger, marginTop: 4 },
  input: {
    borderWidth: 1, borderColor: colors.border, borderRadius: radius.md,
    backgroundColor: colors.surface, paddingHorizontal: 12, paddingVertical: 10,
    fontSize: 14, color: colors.fg, textAlignVertical: 'top',
  },
  defRow: { flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 14 },
  defRowT: { fontSize: 13.5, color: colors.fg },
  saveBtn: {
    marginTop: 18, minHeight: 46, borderRadius: radius.lg, backgroundColor: colors.accent,
    alignItems: 'center', justifyContent: 'center',
  },
  saveBtnT: { color: '#fff', fontSize: 15, fontWeight: '600' },
  toast: {
    position: 'absolute', bottom: 110, alignSelf: 'center',
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: colors.fg, paddingHorizontal: 18, paddingVertical: 10, borderRadius: 999,
    shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowRadius: 12, shadowOpacity: 0.3,
  },
  toastText: { fontSize: 13, color: '#fff' },
});

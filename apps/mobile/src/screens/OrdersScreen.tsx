import React, { useMemo, useRef, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius } from '@yulu/ui';
import { useUIStore } from '../store/ui';
import { mockOrders, mockAddresses, type MockOrder } from '../mock/data';

type OrderFilter = 'all' | 'unpaid' | 'shipping' | 'done';

/**
 * 我的订单（对照 ios-orders.html）：默认地址卡 → 地址管理；状态 Tab
 * （全部/待付款/待收货/已完成）+ 订单卡（去支付 / 确认收货）。端上 mock。
 */
export function OrdersScreen() {
  const close = useUIStore((s) => s.closeOverlay);
  const openAddress = useUIStore((s) => s.openAddress);
  const [filter, setFilter] = useState<OrderFilter>('all');
  // 状态变更（支付/收货）只改本页内存态。
  const [overrides, setOverrides] = useState<Record<string, Partial<MockOrder>>>({});

  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showToast = (msg: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast(msg);
    toastTimer.current = setTimeout(() => setToast(null), 1900);
  };

  const orders = useMemo(
    () => mockOrders.map((o) => ({ ...o, ...(overrides[o.id] ?? {}) })),
    [overrides],
  );
  const list = orders.filter((o) => filter === 'all' || o.status === filter);
  const shippingCount = orders.filter((o) => o.status === 'shipping').length;
  const defAddr = mockAddresses.find((a) => a.def) ?? mockAddresses[0];

  const pay = (o: MockOrder) => {
    Alert.alert('确认支付', `${o.name} · 应付 ¥${o.price}`, [
      { text: '取消', style: 'cancel' },
      {
        text: '去支付',
        onPress: () => {
          setOverrides((m) => ({
            ...m,
            [o.id]: { status: 'shipping', statusLabel: '待收货 · 商家已发货', logi: '商家已发货 · 等待揽收' },
          }));
          showToast('支付成功');
        },
      },
    ]);
  };

  const receive = (o: MockOrder) => {
    Alert.alert('确认收货？', '请确认已收到商品且无质量问题。', [
      { text: '取消', style: 'cancel' },
      {
        text: '确认收货',
        onPress: () => {
          setOverrides((m) => ({ ...m, [o.id]: { status: 'done', statusLabel: '已完成', logi: undefined } }));
          showToast('已确认收货');
        },
      },
    ]);
  };

  const tabs: { key: OrderFilter; label: string; dot?: number }[] = [
    { key: 'all', label: '全部' },
    { key: 'unpaid', label: '待付款' },
    { key: 'shipping', label: '待收货', dot: shippingCount },
    { key: 'done', label: '已完成' },
  ];

  return (
    <View style={styles.wrapper}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        {/* Navbar */}
        <View style={styles.navbar}>
          <TouchableOpacity style={styles.navSide} onPress={close} activeOpacity={0.7}>
            <Ionicons name="chevron-back" size={18} color={colors.accent} />
            <Text style={styles.backText}>我的</Text>
          </TouchableOpacity>
          <Text style={styles.navTitle}>我的订单</Text>
          <View style={styles.navSide} />
        </View>

        {/* 默认收货地址卡 */}
        {defAddr && (
          <TouchableOpacity style={styles.addrCard} onPress={openAddress} activeOpacity={0.7}>
            <View style={styles.addrIcon}>
              <Ionicons name="location-outline" size={16} color={colors.accent} />
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={styles.addrName}>{defAddr.name} {defAddr.tel.slice(0, 3)}****{defAddr.tel.slice(7)}</Text>
              <Text style={styles.addrDetail} numberOfLines={1}>{defAddr.region} · {defAddr.detail}</Text>
            </View>
            <Text style={styles.addrManage}>管理 ›</Text>
          </TouchableOpacity>
        )}

        {/* 状态 Tab */}
        <View style={styles.tabs}>
          {tabs.map((t) => (
            <TouchableOpacity
              key={t.key}
              style={[styles.tabBtn, filter === t.key && styles.tabBtnOn]}
              onPress={() => setFilter(t.key)}
              activeOpacity={0.7}
            >
              <Text style={[styles.tabT, filter === t.key && styles.tabTOn]}>{t.label}</Text>
              {!!t.dot && t.dot > 0 && <View style={styles.tabDot}><Text style={styles.tabDotT}>{t.dot}</Text></View>}
            </TouchableOpacity>
          ))}
        </View>

        {/* 订单列表 */}
        {list.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>📦</Text>
            <Text style={styles.emptyText}>这个状态下还没有订单</Text>
          </View>
        ) : (
          <View style={{ paddingHorizontal: 16 }}>
            {list.map((o) => (
              <View key={o.id} style={styles.orderCard}>
                <View style={styles.ocHead}>
                  <Text style={styles.ocId}>{o.id}</Text>
                  <Text style={[styles.ocStatus, o.status === 'done' && { color: colors.muted }]}>{o.statusLabel}</Text>
                </View>
                <View style={styles.ocBody}>
                  <View style={styles.ocIcon}>
                    <Ionicons name={o.icon as keyof typeof Ionicons.glyphMap} size={20} color={colors.accent} />
                  </View>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={styles.ocName} numberOfLines={1}>{o.name}</Text>
                    <Text style={styles.ocSpec} numberOfLines={1}>{o.spec}</Text>
                  </View>
                  <Text style={styles.ocPrice}>¥{o.price}</Text>
                </View>
                {o.status === 'shipping' && o.logi && (
                  <View style={styles.ocLogi}>
                    <Ionicons name="cube-outline" size={12} color={colors.accent} />
                    <Text style={styles.ocLogiT}>{o.logi}</Text>
                  </View>
                )}
                <Text style={styles.ocTime}>{o.time}</Text>
                <View style={styles.ocActions}>
                  {o.status === 'unpaid' && (
                    <TouchableOpacity style={styles.payBtn} onPress={() => pay(o)} activeOpacity={0.8}>
                      <Text style={styles.payBtnT}>去支付</Text>
                    </TouchableOpacity>
                  )}
                  {o.status === 'shipping' && (
                    <TouchableOpacity style={styles.payBtn} onPress={() => receive(o)} activeOpacity={0.8}>
                      <Text style={styles.payBtnT}>确认收货</Text>
                    </TouchableOpacity>
                  )}
                  {o.status === 'done' && (
                    <TouchableOpacity style={styles.plainBtn} onPress={() => showToast('客服通道即将上线')} activeOpacity={0.8}>
                      <Text style={styles.plainBtnT}>售后</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
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
  addrCard: {
    flexDirection: 'row', alignItems: 'center', gap: 10, marginHorizontal: 16, marginBottom: 12,
    padding: 12, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 16,
  },
  addrIcon: { width: 32, height: 32, borderRadius: 9, backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center' },
  addrName: { fontSize: 14, fontWeight: '600', color: colors.fg },
  addrDetail: { fontSize: 11, color: colors.muted, marginTop: 2 },
  addrManage: { fontSize: 12, color: colors.accent },
  tabs: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, marginBottom: 12 },
  tabBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 13, paddingVertical: 7, borderRadius: 999,
    borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface,
  },
  tabBtnOn: { backgroundColor: colors.fg, borderColor: colors.fg },
  tabT: { fontSize: 12.5, color: colors.muted },
  tabTOn: { color: '#fff', fontWeight: '600' },
  tabDot: { minWidth: 16, height: 16, borderRadius: 999, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3 },
  tabDotT: { fontSize: 10, color: '#fff', fontWeight: '600', fontFamily: 'monospace' },
  orderCard: {
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.lg, padding: 14, marginBottom: 10,
  },
  ocHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  ocId: { fontSize: 11, color: colors.muted, fontFamily: 'monospace' },
  ocStatus: { fontSize: 12, color: colors.accent, fontWeight: '600' },
  ocBody: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 12 },
  ocIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center' },
  ocName: { fontSize: 14, fontWeight: '500', color: colors.fg },
  ocSpec: { fontSize: 11, color: colors.muted, marginTop: 2 },
  ocPrice: { fontFamily: 'Georgia', fontSize: 16, fontWeight: '700', color: colors.fg },
  ocLogi: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10 },
  ocLogiT: { fontSize: 11, color: colors.accent, flex: 1 },
  ocTime: { fontSize: 11, color: colors.muted, marginTop: 8, fontFamily: 'monospace' },
  ocActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginTop: 10 },
  payBtn: { paddingHorizontal: 18, paddingVertical: 8, borderRadius: 999, backgroundColor: colors.accent },
  payBtnT: { color: '#fff', fontSize: 12.5, fontWeight: '600' },
  plainBtn: { paddingHorizontal: 18, paddingVertical: 8, borderRadius: 999, borderWidth: 1, borderColor: colors.border },
  plainBtnT: { color: colors.muted, fontSize: 12.5 },
  empty: { alignItems: 'center', paddingTop: 90 },
  emptyEmoji: { fontSize: 44 },
  emptyText: { fontSize: 13.5, color: colors.muted, marginTop: 12 },
  toast: {
    position: 'absolute', bottom: 110, alignSelf: 'center',
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: colors.fg, paddingHorizontal: 18, paddingVertical: 10, borderRadius: 999,
    shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowRadius: 12, shadowOpacity: 0.3,
  },
  toastText: { fontSize: 13, color: '#fff' },
});

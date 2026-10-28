import React, { useMemo, useRef, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius } from '@yulu/ui';
import { useUIStore } from '../store/ui';
import { mockOrders, mockMallProducts, mockAddresses, type MockOrder } from '../mock/data';

type OrderFilter = 'all' | 'unpaid' | 'shipping' | 'done';

/** 订单状态 → 底部双按钮（对照 ios-orders.html：每状态两个操作）。 */
function actionsFor(o: MockOrder): { label: string; kind: 'primary' | 'ghost'; act: string }[] {
  if (o.status === 'unpaid') {
    return [
      { label: '取消订单', kind: 'ghost', act: 'cancel' },
      { label: '去支付', kind: 'primary', act: 'pay' },
    ];
  }
  if (o.status === 'shipping') {
    return [
      { label: '查看物流', kind: 'ghost', act: 'logi' },
      { label: '确认收货', kind: 'primary', act: 'receive' },
    ];
  }
  return [
    { label: '再次购买', kind: 'ghost', act: 'rebuy' },
    { label: '评价晒单', kind: 'primary', act: 'review' },
  ];
}

/**
 * 我的订单（对照 ios-orders.html）：默认地址卡 → 地址管理；一体式分段
 * 状态 Tab（待收货红点）；订单卡（订单号+时间一行、含运费、物流条、
 * "共 N 元"合计、状态双按钮）。端上 mock。
 */
export function OrdersScreen() {
  const close = useUIStore((s) => s.closeOverlay);
  const openAddress = useUIStore((s) => s.openAddress);
  const openMall = useUIStore((s) => s.openMall);
  const openProductDetail = useUIStore((s) => s.openProductDetail);
  const [filter, setFilter] = useState<OrderFilter>('all');
  // 状态变更（支付/收货/取消）只改本页内存态。
  const [overrides, setOverrides] = useState<Record<string, Partial<MockOrder>>>({});
  const [hidden, setHidden] = useState<Record<string, boolean>>({});

  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showToast = (msg: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast(msg);
    toastTimer.current = setTimeout(() => setToast(null), 1900);
  };

  const orders = useMemo(
    () => mockOrders.map((o) => ({ ...o, ...(overrides[o.id] ?? {}) })).filter((o) => !hidden[o.id]),
    [overrides, hidden],
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

  const cancel = (o: MockOrder) => {
    Alert.alert('取消订单', `确定取消「${o.name}」这笔订单吗？`, [
      { text: '再想想', style: 'cancel' },
      {
        text: '取消订单',
        style: 'destructive',
        onPress: () => {
          setHidden((h) => ({ ...h, [o.id]: true }));
          showToast('订单已取消');
        },
      },
    ]);
  };

  const viewLogi = (o: MockOrder) => {
    Alert.alert('物流信息', o.logi ?? '商家已发货 · 等待揽收', [{ text: '知道了' }]);
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

  const rebuy = (o: MockOrder) => {
    const p = mockMallProducts.find((x) => o.name.startsWith(x.name.split(' ·')[0]) || o.name.includes(x.name.split(' ·')[0]));
    if (p) openProductDetail(p.id);
    else openMall();
  };

  const review = () => showToast('评价晒单即将上线');

  const run = (o: MockOrder, act: string) => {
    if (act === 'pay') pay(o);
    else if (act === 'cancel') cancel(o);
    else if (act === 'logi') viewLogi(o);
    else if (act === 'receive') receive(o);
    else if (act === 'rebuy') rebuy(o);
    else review();
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

        {/* 一体式分段状态 Tab（待收货红点角标） */}
        <View style={styles.segTabs}>
          {tabs.map((t) => (
            <TouchableOpacity
              key={t.key}
              style={[styles.segTab, filter === t.key && styles.segTabOn]}
              onPress={() => setFilter(t.key)}
              activeOpacity={0.7}
            >
              <Text style={[styles.segTabT, filter === t.key && styles.segTabTOn]}>{t.label}</Text>
              {!!t.dot && t.dot > 0 && <View style={styles.segDot}><Text style={styles.segDotT}>{t.dot}</Text></View>}
            </TouchableOpacity>
          ))}
        </View>

        {/* 订单列表 */}
        {list.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>📦</Text>
            <Text style={styles.emptyText}>这个状态下还没有订单</Text>
            <TouchableOpacity style={styles.emptyBtn} onPress={() => { close(); openMall(); }} activeOpacity={0.8}>
              <Text style={styles.emptyBtnT}>去商城逛逛</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={{ paddingHorizontal: 16 }}>
            {list.map((o) => (
              <View key={o.id} style={styles.orderCard}>
                {/* 头部：订单号 · 时间一行 + 状态 */}
                <View style={styles.ocHead}>
                  <Text style={styles.ocMeta} numberOfLines={1}>{o.id} · {o.time}</Text>
                  <Text style={[styles.ocStatus, o.status === 'done' && { color: colors.muted }]}>{o.statusLabel}</Text>
                </View>
                <View style={styles.ocBody}>
                  <View style={styles.ocIcon}>
                    <Ionicons name={o.icon as keyof typeof Ionicons.glyphMap} size={20} color={colors.accent} />
                  </View>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={styles.ocName} numberOfLines={1}>{o.name}</Text>
                    <Text style={styles.ocSpec} numberOfLines={1}>{o.spec}</Text>
                    <Text style={styles.ocPriceRow}>¥{o.price} <Text style={styles.ocShip}>含运费</Text></Text>
                  </View>
                </View>
                {o.status === 'shipping' && o.logi && (
                  <View style={styles.ocLogi}>
                    <Ionicons name="cube-outline" size={12} color={colors.accent} />
                    <Text style={styles.ocLogiT}>{o.logi}</Text>
                  </View>
                )}
                {/* 合计行 + 状态双按钮 */}
                <View style={styles.ocFoot}>
                  <Text style={styles.ocTotal}>共 <Text style={styles.ocTotalV}>¥{o.price}</Text></Text>
                  <View style={styles.ocActions}>
                    {actionsFor(o).map((a) => (
                      <TouchableOpacity
                        key={a.act}
                        style={a.kind === 'primary' ? styles.payBtn : styles.plainBtn}
                        onPress={() => run(o, a.act)}
                        activeOpacity={0.8}
                      >
                        <Text style={a.kind === 'primary' ? styles.payBtnT : styles.plainBtnT}>{a.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
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
  /* 一体式分段胶囊 */
  segTabs: {
    flexDirection: 'row', marginHorizontal: 16, marginBottom: 12,
    backgroundColor: colors.fgSoft, borderRadius: 999, padding: 2,
  },
  segTab: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4,
    paddingVertical: 8, borderRadius: 999,
  },
  segTabOn: { backgroundColor: colors.fg },
  segTabT: { fontSize: 12.5, color: colors.muted },
  segTabTOn: { color: '#fff', fontWeight: '600' },
  segDot: { minWidth: 15, height: 15, borderRadius: 999, backgroundColor: '#d9483a', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
  segDotT: { fontSize: 10, color: '#fff', fontWeight: '600', fontFamily: 'monospace' },
  orderCard: {
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.lg, padding: 14, marginBottom: 10,
  },
  ocHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 },
  ocMeta: { flex: 1, fontSize: 11, color: colors.muted, fontFamily: 'monospace' },
  ocStatus: { fontSize: 12, color: colors.accent, fontWeight: '600', flexShrink: 0 },
  ocBody: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 12 },
  ocIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center' },
  ocName: { fontSize: 14, fontWeight: '500', color: colors.fg },
  ocSpec: { fontSize: 11, color: colors.muted, marginTop: 2 },
  ocPriceRow: { fontSize: 16, fontWeight: '700', color: colors.fg, fontFamily: 'Georgia', marginTop: 4 },
  ocShip: { fontSize: 10, color: colors.muted, fontWeight: '400', fontFamily: 'monospace' },
  ocLogi: {
    flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10,
    backgroundColor: colors.accentSoft, borderRadius: 9, paddingHorizontal: 9, paddingVertical: 7,
  },
  ocLogiT: { fontSize: 11, color: colors.accent, flex: 1 },
  ocFoot: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginTop: 12, paddingTop: 11, borderTopWidth: 1, borderTopColor: colors.border,
  },
  ocTotal: { fontSize: 12, color: colors.muted },
  ocTotalV: { fontSize: 15, fontWeight: '700', color: colors.fg, fontFamily: 'Georgia' },
  ocActions: { flexDirection: 'row', gap: 8 },
  payBtn: { paddingHorizontal: 15, paddingVertical: 7, borderRadius: 999, backgroundColor: colors.accent },
  payBtnT: { color: '#fff', fontSize: 12.5, fontWeight: '600' },
  plainBtn: { paddingHorizontal: 15, paddingVertical: 7, borderRadius: 999, borderWidth: 1, borderColor: colors.border },
  plainBtnT: { color: colors.muted, fontSize: 12.5 },
  empty: { alignItems: 'center', paddingTop: 90 },
  emptyEmoji: { fontSize: 44 },
  emptyText: { fontSize: 13.5, color: colors.muted, marginTop: 12 },
  emptyBtn: { marginTop: 16, paddingHorizontal: 24, paddingVertical: 10, borderRadius: 999, backgroundColor: colors.accent },
  emptyBtnT: { color: '#fff', fontSize: 13.5, fontWeight: '600' },
  toast: {
    position: 'absolute', bottom: 110, alignSelf: 'center',
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: colors.fg, paddingHorizontal: 18, paddingVertical: 10, borderRadius: 999,
    shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowRadius: 12, shadowOpacity: 0.3,
  },
  toastText: { fontSize: 13, color: '#fff' },
});

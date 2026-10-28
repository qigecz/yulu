import React, { useMemo, useRef, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius } from '@yulu/ui';
import { useUIStore } from '../store/ui';
import { useCartStore } from '../store/cart';
import { mockMallProducts } from '../mock/data';

/**
 * 购物车页（对照 ios-cart.html）：勾选/数量/删除、结算栏（全选 + 合计 +
 * 去结算 N 件）、空态。下单成功后跳订单页并清掉已勾选商品。
 */
export function CartScreen() {
  const close = useUIStore((s) => s.closeOverlay);
  const openOrders = useUIStore((s) => s.openOrders);
  const items = useCartStore((s) => s.items);
  const setQty = useCartStore((s) => s.setQty);
  const remove = useCartStore((s) => s.remove);
  const toggle = useCartStore((s) => s.toggle);
  const selectAll = useCartStore((s) => s.selectAll);
  const clearSelected = useCartStore((s) => s.clearSelected);

  const [paying, setPaying] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showToast = (msg: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast(msg);
    toastTimer.current = setTimeout(() => setToast(null), 1800);
  };

  // 商品信息从 mock 目录反查（商城未接后端）。
  const rows = useMemo(
    () =>
      items
        .map((it) => ({ it, product: mockMallProducts.find((p) => p.id === it.id) }))
        .filter((r): r is { it: typeof items[number]; product: NonNullable<typeof r.product> } => !!r.product),
    [items],
  );
  const sel = rows.filter((r) => r.it.selected);
  const total = sel.reduce((s, r) => s + r.product.price * r.it.qty, 0);
  const totalCount = rows.reduce((s, r) => s + r.it.qty, 0);
  const allOn = rows.length > 0 && rows.every((r) => r.it.selected);

  const checkout = () => {
    if (sel.length === 0 || paying) return;
    setPaying(true);
    const n = sel.reduce((s, r) => s + r.it.qty, 0);
    const sum = sel.reduce((s, r) => s + r.product.price * r.it.qty, 0);
    setTimeout(() => {
      clearSelected();
      setPaying(false);
      showToast(`下单成功 · ${n} 件共 ¥${sum}`);
      setTimeout(openOrders, 800);
    }, 1000);
  };

  return (
    <View style={styles.wrapper}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        {/* Navbar */}
        <View style={styles.navbar}>
          <TouchableOpacity style={styles.navSide} onPress={close} activeOpacity={0.7}>
            <Ionicons name="chevron-back" size={18} color={colors.accent} />
            <Text style={styles.backText}>商城</Text>
          </TouchableOpacity>
          <Text style={styles.navTitle}>购物车{totalCount > 0 ? ` (${totalCount})` : ''}</Text>
          <View style={styles.navSide} />
        </View>

        {rows.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🛒</Text>
            <Text style={styles.emptyText}>购物车空空如也，先去商城挑几件趁手的装备吧</Text>
            <TouchableOpacity style={styles.emptyBtn} onPress={close} activeOpacity={0.8}>
              <Text style={styles.emptyBtnT}>去逛逛</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={{ paddingHorizontal: 20 }}>
            {rows.map(({ it, product }) => (
              <View key={it.id} style={styles.item}>
                <TouchableOpacity style={[styles.ck, it.selected && styles.ckOn]} onPress={() => toggle(it.id)} activeOpacity={0.7}>
                  {it.selected && <Ionicons name="checkmark" size={13} color="#fff" />}
                </TouchableOpacity>
                <View style={styles.ciBody}>
                  <Text style={styles.ciName} numberOfLines={1}>{product.name}</Text>
                  <Text style={styles.ciSpec} numberOfLines={1}>{product.spec}</Text>
                  <View style={styles.ciFoot}>
                    <Text style={styles.ciPrice}>¥{product.price * it.qty}</Text>
                    <View style={styles.qtyCtl}>
                      <TouchableOpacity
                        style={[styles.qtyBtn, it.qty <= 1 && styles.qtyBtnOff]}
                        disabled={it.qty <= 1}
                        onPress={() => setQty(it.id, it.qty - 1)}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.qtyBtnT}>−</Text>
                      </TouchableOpacity>
                      <Text style={styles.qtyVal}>{it.qty}</Text>
                      <TouchableOpacity style={styles.qtyBtn} onPress={() => setQty(it.id, it.qty + 1)} activeOpacity={0.7}>
                        <Text style={styles.qtyBtnT}>+</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
                <TouchableOpacity style={styles.delBtn} onPress={() => remove(it.id)} activeOpacity={0.7}>
                  <Ionicons name="trash-outline" size={15} color={colors.danger} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* 结算栏 */}
      {rows.length > 0 && (
        <View style={styles.settlebar}>
          <TouchableOpacity style={[styles.ck, allOn && styles.ckOn]} onPress={() => selectAll(!allOn)} activeOpacity={0.7}>
            {allOn && <Ionicons name="checkmark" size={13} color="#fff" />}
          </TouchableOpacity>
          <Text style={styles.selAll}>全选</Text>
          <View style={styles.totalWrap}>
            <Text style={styles.totalLine}>
              合计 <Text style={styles.totalPrice}>¥{total}</Text>
            </Text>
            <Text style={styles.totalSub}>不含运费 · 顺丰包邮</Text>
          </View>
          <TouchableOpacity
            style={[styles.checkoutBtn, (sel.length === 0 || paying) && styles.checkoutOff]}
            disabled={sel.length === 0 || paying}
            onPress={checkout}
            activeOpacity={0.8}
          >
            <Text style={styles.checkoutT}>{paying ? '结算中…' : `去结算(${sel.length})`}</Text>
          </TouchableOpacity>
        </View>
      )}

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
  empty: { alignItems: 'center', paddingTop: 110 },
  emptyEmoji: { fontSize: 44 },
  emptyText: { fontSize: 13.5, color: colors.muted, marginTop: 12, marginHorizontal: 40, textAlign: 'center', lineHeight: 20 },
  emptyBtn: { marginTop: 16, paddingHorizontal: 26, paddingVertical: 10, borderRadius: 999, backgroundColor: colors.accent },
  emptyBtnT: { color: '#fff', fontSize: 14, fontWeight: '600' },
  item: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.lg, padding: 14, marginBottom: 10,
  },
  ck: {
    width: 20, height: 20, borderRadius: 999, borderWidth: 1.5, borderColor: colors.border,
    alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg,
  },
  ckOn: { backgroundColor: colors.accent, borderColor: colors.accent },
  ciBody: { flex: 1, minWidth: 0 },
  ciName: { fontSize: 14, fontWeight: '500', color: colors.fg },
  ciSpec: { fontSize: 11, color: colors.muted, marginTop: 2 },
  ciFoot: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
  ciPrice: { fontFamily: 'Georgia', fontSize: 17, fontWeight: '700', color: colors.fg },
  qtyCtl: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm, overflow: 'hidden' },
  qtyBtn: { width: 30, height: 28, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
  qtyBtnOff: { opacity: 0.4 },
  qtyBtnT: { fontSize: 16, color: colors.fg },
  qtyVal: { minWidth: 30, textAlign: 'center', fontSize: 13, color: colors.fg, fontFamily: 'monospace' },
  delBtn: {
    width: 32, height: 32, borderRadius: 8, backgroundColor: 'rgba(176, 58, 46, 0.1)',
    alignItems: 'center', justifyContent: 'center',
  },
  settlebar: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 20, paddingVertical: 12, paddingBottom: 18,
    borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.surface,
  },
  selAll: { fontSize: 13, color: colors.fg },
  totalWrap: { flex: 1, marginLeft: 6 },
  totalLine: { fontSize: 13, color: colors.muted },
  totalPrice: { fontFamily: 'Georgia', fontSize: 20, fontWeight: '700', color: colors.fg },
  totalSub: { fontSize: 10, color: colors.muted, marginTop: 1 },
  checkoutBtn: {
    paddingHorizontal: 22, paddingVertical: 11, borderRadius: 999, backgroundColor: colors.accent,
  },
  checkoutOff: { backgroundColor: colors.border },
  checkoutT: { color: '#fff', fontSize: 14, fontWeight: '600' },
  toast: {
    position: 'absolute', bottom: 110, alignSelf: 'center',
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: colors.fg, paddingHorizontal: 18, paddingVertical: 10, borderRadius: 999,
    shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowRadius: 12, shadowOpacity: 0.3,
  },
  toastText: { fontSize: 13, color: '#fff' },
});

import React, { useMemo, useRef, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '@yulu/ui';
import type { MallProduct } from '@yulu/shared';
import { useUIStore } from '../store/ui';
import { mockMallProducts } from '../mock/data';

const CATS = ['全部', '路亚竿', '渔轮', '假饵', '台钓', '配件'];

function soldLabel(n: number): string {
  return n >= 1000 ? `${(n / 1000).toFixed(1).replace(/\.0$/, '')}k` : String(n);
}

export function MallScreen() {
  const close = useUIStore((s) => s.closeOverlay);
  const openSearch = useUIStore((s) => s.openSearch);

  const [cat, setCat] = useState('全部');
  const [cart, setCart] = useState<Record<string, boolean>>({});
  const [cartCount, setCartCount] = useState(2);
  const toastOpacity = useRef(new Animated.Value(0)).current;
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const list = useMemo(
    () => (cat === '全部' ? mockMallProducts : mockMallProducts.filter((p) => p.category === cat)),
    [cat],
  );

  const showToast = (msg: string) => {
    // toast 内容通过状态渲染，这里只做动画
    Animated.sequence([
      Animated.timing(toastOpacity, { toValue: 1, duration: 180, useNativeDriver: true }),
      Animated.delay(1200),
      Animated.timing(toastOpacity, { toValue: 0, duration: 220, useNativeDriver: true }),
    ]).start();
    if (toastTimer.current) clearTimeout(toastTimer.current);
  };

  const [toastMsg, setToastMsg] = useState('');

  const addToCart = (p: MallProduct) => {
    if (cart[p.id]) return;
    setCart((c) => ({ ...c, [p.id]: true }));
    setCartCount((n) => n + 1);
    setToastMsg(`已加入购物车 · ${p.name}`);
    showToast(p.name);
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.iconBtn} onPress={close} activeOpacity={0.7}>
            <Ionicons name="chevron-back" size={20} color={colors.fg} />
          </TouchableOpacity>
          <Text style={styles.hTitle}>渔具商城</Text>
          <View style={styles.headerRight}>
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() => { close(); openSearch(); }}
              activeOpacity={0.7}
            >
              <Ionicons name="search" size={18} color={colors.fg} />
            </TouchableOpacity>
            <View>
              <TouchableOpacity style={styles.iconBtn} onPress={() => {}} activeOpacity={0.7}>
                <Ionicons name="cart-outline" size={18} color={colors.fg} />
              </TouchableOpacity>
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeT}>{cartCount}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Promo banner */}
        <View style={styles.promo}>
          <View style={styles.promoIcon}>
            <Ionicons name="fish-outline" size={22} color={colors.accent} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.promoTitle}>夏季路亚竿专场</Text>
            <Text style={styles.promoDesc}>精选入门到竞技款 · 满 299 减 50</Text>
            <View style={styles.promoTag}>
              <Text style={styles.promoTagT}>8 月 31 日截止</Text>
            </View>
          </View>
        </View>

        {/* Category chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {CATS.map((c) => (
            <TouchableOpacity
              key={c}
              style={[styles.fchip, cat === c && styles.fchipOn]}
              onPress={() => setCat(c)}
              activeOpacity={0.7}
            >
              <Text style={[styles.fchipT, cat === c && styles.fchipTOn]}>{c}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Result row */}
        <View style={styles.resultRow}>
          <Text style={styles.rCount}>
            共 <Text style={styles.rCountStrong}>{list.length}</Text> 件商品
          </Text>
        </View>

        {/* Product grid */}
        <View style={styles.grid}>
          {list.map((p) => (
            <ProductCard key={p.id} product={p} added={!!cart[p.id]} onAdd={() => addToCart(p)} />
          ))}
        </View>

        <Text style={styles.listEnd}>— 已加载全部 {list.length} 件商品 —</Text>
      </ScrollView>

      {/* Toast */}
      <Animated.View pointerEvents="none" style={[styles.toast, { opacity: toastOpacity }]}>
        <Text style={styles.toastT} numberOfLines={1}>{toastMsg}</Text>
      </Animated.View>
    </View>
  );
}

function ProductCard({ product, added, onAdd }: { product: MallProduct; added: boolean; onAdd: () => void }) {
  return (
    <View style={styles.pCard}>
      <View style={styles.pImg}>
        <Text style={styles.pImgT}>[商品图]</Text>
        {product.flag && (
          <View style={[styles.pFlag, product.flag === '新品' && styles.pFlagNew]}>
            <Text style={[styles.pFlagT, product.flag === '新品' && styles.pFlagTNew]}>{product.flag}</Text>
          </View>
        )}
      </View>
      <View style={styles.pBody}>
        <Text style={styles.pName} numberOfLines={2}>{product.name}</Text>
        <Text style={styles.pSpec} numberOfLines={1}>{product.spec}</Text>
        <View style={styles.pFoot}>
          <View>
            <View style={styles.pPriceRow}>
              <Text style={styles.pPriceCur}>¥</Text>
              <Text style={styles.pPrice}>{product.price}</Text>
            </View>
            <Text style={styles.pSold}>已售 {soldLabel(product.sold)}</Text>
          </View>
          <TouchableOpacity
            style={[styles.addBtn, added && styles.addBtnOn]}
            onPress={onAdd}
            activeOpacity={0.8}
          >
            <Ionicons name={added ? 'checkmark' : 'add'} size={15} color={added ? '#fff' : colors.accent} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },

  header: { paddingHorizontal: spacing.screenPadding, paddingVertical: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerRight: { flexDirection: 'row', gap: 10 },
  iconBtn: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: colors.surface,
    borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center',
  },
  hTitle: { fontSize: 18, fontWeight: '600', color: colors.fg, fontFamily: 'Georgia' },
  cartBadge: {
    position: 'absolute', top: -4, right: -4, minWidth: 17, height: 17,
    borderRadius: 999, backgroundColor: colors.accent, borderWidth: 2, borderColor: colors.bg,
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3,
  },
  cartBadgeT: { color: '#fff', fontSize: 10, fontWeight: '600' },

  promo: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    marginHorizontal: spacing.screenPadding, padding: 16,
    backgroundColor: colors.accentSoft, borderWidth: 1, borderColor: 'rgba(42,143,122,0.3)', borderRadius: 16,
  },
  promoIcon: {
    width: 46, height: 46, borderRadius: 14, backgroundColor: colors.surface,
    borderWidth: 1, borderColor: 'rgba(42,143,122,0.3)', alignItems: 'center', justifyContent: 'center',
  },
  promoTitle: { fontSize: 15, fontWeight: '600', color: colors.fg },
  promoDesc: { fontSize: 12, color: colors.muted, marginTop: 3 },
  promoTag: {
    alignSelf: 'flex-start', marginTop: 6, paddingHorizontal: 9, paddingVertical: 3,
    borderRadius: 999, backgroundColor: colors.accent,
  },
  promoTagT: { color: '#fff', fontSize: 10, letterSpacing: 0.5 },

  filterScroll: { gap: 8, paddingHorizontal: spacing.screenPadding, paddingTop: 14 },
  fchip: {
    paddingHorizontal: 14, paddingVertical: 7, backgroundColor: colors.surface,
    borderWidth: 1, borderColor: colors.border, borderRadius: 999,
  },
  fchipOn: { backgroundColor: colors.accent, borderColor: 'transparent' },
  fchipT: { fontSize: 13, color: colors.fg },
  fchipTOn: { color: '#fff', fontWeight: '600' },

  resultRow: { paddingHorizontal: spacing.screenPadding, paddingVertical: 10 },
  rCount: { fontSize: 13, color: colors.muted },
  rCountStrong: { color: colors.fg, fontWeight: '600' },

  grid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 10,
    paddingHorizontal: spacing.screenPadding,
  },
  pCard: {
    flexBasis: '47.6%', flexGrow: 1, flexShrink: 0,
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
    borderRadius: 16, overflow: 'hidden',
  },
  pImg: {
    aspectRatio: 1, backgroundColor: colors.accentSoft,
    borderBottomWidth: 1, borderBottomColor: colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  pImgT: { fontSize: 10, color: colors.muted },
  pFlag: {
    position: 'absolute', top: 8, left: 8, paddingHorizontal: 7, paddingVertical: 2,
    borderRadius: 6, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
  },
  pFlagNew: { backgroundColor: colors.accent, borderWidth: 0 },
  pFlagT: { fontSize: 9, color: colors.muted },
  pFlagTNew: { color: '#fff' },
  pBody: { padding: 10, paddingHorizontal: 12, paddingBottom: 12 },
  pName: { fontSize: 13, fontWeight: '600', color: colors.fg, lineHeight: 18 },
  pSpec: { fontSize: 11, color: colors.muted, marginTop: 3 },
  pFoot: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 8, marginTop: 'auto', paddingTop: 8 },
  pPriceRow: { flexDirection: 'row', alignItems: 'baseline' },
  pPriceCur: { fontSize: 11, color: colors.accent },
  pPrice: { fontSize: 16, fontWeight: '700', color: colors.accent, letterSpacing: -0.3 },
  pSold: { fontSize: 10, color: colors.muted, marginTop: 2 },
  addBtn: {
    width: 30, height: 30, borderRadius: 10, backgroundColor: colors.accentSoft,
    alignItems: 'center', justifyContent: 'center',
  },
  addBtnOn: { backgroundColor: colors.accent },

  listEnd: { fontSize: 11, color: colors.muted, textAlign: 'center', paddingTop: 16 },

  toast: {
    position: 'absolute', left: 40, right: 40, bottom: 96, alignSelf: 'center',
    backgroundColor: colors.fg, paddingHorizontal: 18, paddingVertical: 9, borderRadius: 999,
  },
  toastT: { color: '#fff', fontSize: 13, fontWeight: '500', textAlign: 'center' },
});

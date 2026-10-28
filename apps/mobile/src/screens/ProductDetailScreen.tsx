import React, { useMemo, useRef, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius } from '@yulu/ui';
import type { MallProduct } from '@yulu/shared';
import { useUIStore } from '../store/ui';
import { useCartStore } from '../store/cart';

const STAR_COLOR = '#e8a33d';

/** 商品详情页（对照 ios-product-detail.html）：navbar（返回商城/标题/购物车入口）、
 *  大图、信息卡、规格数量、参数、评价、购买栏。 */
export function ProductDetailScreen({ product }: { product: MallProduct }) {
  const close = useUIStore((s) => s.closeOverlay);
  const openOrders = useUIStore((s) => s.openOrders);
  const openCart = useUIStore((s) => s.openCart);
  const cartCount = useCartStore((s) => s.items.reduce((n, i) => n + i.qty, 0));
  const addToCartStore = useCartStore((s) => s.add);

  // 规格档位：只有原型里的路亚竿有双规格，其余商品单规格。
  const specs = useMemo(
    () =>
      product.id === 'm1'
        ? [{ label: '2.1m · M调', extra: 0 }, { label: '2.4m · M调', extra: 40 }]
        : [{ label: product.spec, extra: 0 }],
    [product],
  );
  const [specIdx, setSpecIdx] = useState(0);
  const [qty, setQty] = useState(1);

  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showToast = (msg: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast(msg);
    toastTimer.current = setTimeout(() => setToast(null), 1800);
  };

  const price = product.price + specs[specIdx].extra;
  const totalPrice = price * qty;

  const params: [string, string][] =
    product.id === 'm1'
      ? [
          ['调性', 'M 调（中调）· 快调性'],
          ['全长 / 自重', `${specs[specIdx].label.split(' ')[0]} / 118g`],
          ['饵重范围', '7-18g（最佳 10-14g）'],
          ['材质', '40T 碳布 · 两节收缩设计'],
          ['导环 / 轮座', '不锈钢框架陶磁导环 · 直柄轮座'],
          ['适用场景', '湖泊水库 · 翘嘴 / 鲈鱼 / 鳜鱼'],
        ]
      : [
          ['规格', product.spec],
          ['分类', product.category],
          ['服务', '正品保障 · 7天无理由 · 顺丰包邮'],
        ];

  const onAddCart = () => {
    addToCartStore(product.id, qty);
    const totalAfter = useCartStore.getState().items.reduce((n, i) => n + i.qty, 0);
    showToast(`已加入购物车 · 共 ${totalAfter} 件`);
  };

  const onBuyNow = () => {
    Alert.alert(
      '确认下单',
      `${product.name} · ${specs[specIdx].label} × ${qty}，应付 ¥${totalPrice}`,
      [
        { text: '再想想', style: 'cancel' },
        {
          text: '去支付',
          onPress: () => {
            showToast('下单成功');
            setTimeout(openOrders, 600);
          },
        },
      ],
    );
  };

  return (
    <View style={styles.wrapper}>
      {/* Navbar（对照原型：返回商城 / 标题 / 购物车入口带角标） */}
      <View style={styles.navbar}>
        <TouchableOpacity style={styles.navSide} onPress={close} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={18} color={colors.accent} />
          <Text style={styles.backText}>商城</Text>
        </TouchableOpacity>
        <Text style={styles.navTitle}>商品详情</Text>
        <View style={styles.navSideRight}>
          <TouchableOpacity style={styles.cartEntry} onPress={openCart} activeOpacity={0.7}>
            <Ionicons name="cart-outline" size={19} color={colors.fg} />
            {cartCount > 0 && (
              <View style={styles.cartEntryBadge}>
                <Text style={styles.cartEntryBadgeT}>{cartCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* 商品大图（View 拼绘示意，对照原型 SVG） */}
        <View style={styles.gallery}>
          <View style={styles.gSky} />
          <View style={styles.gWater} />
          <View style={styles.gRod} />
          <View style={styles.gRodHandle} />
          <View style={styles.gSun} />
          <Text style={styles.gMark}>YULU · TACKLE</Text>
          {!!product.flag && (
            <View style={styles.gFlag}>
              <Text style={styles.gFlagT}>{product.flag}</Text>
            </View>
          )}
          {/* 轮播指示点（对照原型 3 枚，当前项加长） */}
          <View style={styles.gDots}>
            <View style={[styles.gDot, styles.gDotOn]} />
            <View style={styles.gDot} />
            <View style={styles.gDot} />
          </View>
        </View>

        {/* 商品信息卡（上叠大图，对照原型负 margin） */}
        <View style={[styles.infoCard, styles.mx]}>
          <View style={styles.priceRow}>
            <Text style={styles.price}>
              <Text style={styles.priceCur}>¥</Text>
              {totalPrice}
              {qty > 1 && <Text style={styles.priceSub}> · ¥{price} × {qty}</Text>}
            </Text>
            <Text style={styles.sold}>
              已售 {product.sold >= 1000 ? `${(product.sold / 1000).toFixed(1).replace(/\.0$/, '')}k` : product.sold}+ · 评分 4.8
            </Text>
          </View>
          <Text style={styles.pName}>{product.name}</Text>
          <Text style={styles.pSub}>{product.spec} · 快调泛用，碧溪湾翘嘴鲈鱼通杀</Text>
          <View style={styles.pTags}>
            {['正品保障', '7天无理由', '顺丰包邮'].map((t) => (
              <View key={t} style={styles.ptag}><Text style={styles.ptagT}>{t}</Text></View>
            ))}
          </View>
        </View>

        {/* 规格与数量 */}
        <View style={[styles.sect, styles.mx]}>
          <Text style={styles.sectTitle}>规格</Text>
          <View style={styles.specChips}>
            {specs.map((sp, i) => (
              <TouchableOpacity
                key={sp.label}
                style={[styles.specChip, i === specIdx && styles.specChipOn]}
                onPress={() => setSpecIdx(i)}
                activeOpacity={0.7}
              >
                <Text style={[styles.specChipT, i === specIdx && styles.specChipTOn]}>
                  {sp.label}
                  {sp.extra > 0 && <Text style={styles.specExtra}> +¥{sp.extra}</Text>}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.qtyRow}>
            <Text style={styles.qtyLabel}>数量</Text>
            <View style={styles.qtyCtl}>
              <TouchableOpacity
                style={[styles.qtyBtn, qty <= 1 && styles.qtyBtnOff]}
                disabled={qty <= 1}
                onPress={() => setQty((q) => q - 1)}
                activeOpacity={0.7}
              >
                <Text style={styles.qtyBtnT}>−</Text>
              </TouchableOpacity>
              <Text style={styles.qtyVal}>{qty}</Text>
              <TouchableOpacity style={styles.qtyBtn} onPress={() => setQty((q) => q + 1)} activeOpacity={0.7}>
                <Text style={styles.qtyBtnT}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
          <Text style={styles.stock}>库存 126 件 · 此规格 30 天内售出 412 件</Text>
        </View>

        {/* 产品参数 */}
        <View style={[styles.sect, styles.mx]}>
          <Text style={styles.sectTitle}>产品参数</Text>
          <View style={styles.specTable}>
            {params.map(([k, v]) => (
              <View key={k} style={styles.specRow}>
                <Text style={styles.specK}>{k}</Text>
                <Text style={styles.specV}>{v}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* 钓友评价 */}
        <View style={[styles.sect, styles.mx, { marginBottom: 20 }]}>
          <View style={styles.rvHead}>
            <Text style={styles.sectTitle}>钓友评价（326）</Text>
            <Text style={styles.rateAll}>好评率 97% ›</Text>
          </View>
          {[
            { name: '老张', stars: 5, text: '在碧溪湾用了三次，10g 的 VIB 抛得又远又稳，中了两条 50+ 的翘嘴，腰力足够。', meta: `规格：${specs[specIdx].label} · 2026-10-14` },
            { name: '小王', stars: 4, text: '手感很轻，全天抛投不累。导环略小，建议上 0.8 编以下的 PE 线更顺滑。', meta: '规格：2.4m · M调 · 2026-10-02' },
          ].map((rv) => (
            <View key={rv.name} style={styles.review}>
              <View style={styles.rvRow}>
                <View style={styles.rvAva}>
                  <Text style={styles.rvAvaT}>{rv.name.charAt(0)}</Text>
                </View>
                <Text style={styles.rvName}>{rv.name}</Text>
                <Text style={styles.rvStars}>
                  <Text style={{ color: STAR_COLOR }}>{'★'.repeat(rv.stars)}</Text>
                  <Text style={{ color: colors.border }}>{'★'.repeat(5 - rv.stars)}</Text>
                </Text>
              </View>
              <Text style={styles.rvText}>{rv.text}</Text>
              <Text style={styles.rvMeta}>{rv.meta}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* 购买栏 */}
      <View style={styles.buybar}>
        <TouchableOpacity style={styles.cartBtn} onPress={onAddCart} activeOpacity={0.8}>
          <Ionicons name="cart-outline" size={15} color={colors.accent} />
          <Text style={styles.cartBtnT}>加入购物车</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.buyBtn} onPress={onBuyNow} activeOpacity={0.8}>
          <Text style={styles.buyBtnT}>立即购买</Text>
        </TouchableOpacity>
      </View>

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
    paddingHorizontal: 12, paddingTop: 10, paddingBottom: 8, backgroundColor: colors.bg,
  },
  navSide: { flexDirection: 'row', alignItems: 'center', width: 74, paddingHorizontal: 4 },
  navSideRight: { flexDirection: 'row', justifyContent: 'flex-end', width: 74, paddingRight: 8 },
  backText: { color: colors.accent, fontSize: 15 },
  navTitle: { fontFamily: 'Georgia', fontSize: 17, fontWeight: '600', color: colors.fg },
  cartEntry: { position: 'relative', width: 34, height: 34, alignItems: 'center', justifyContent: 'center' },
  cartEntryBadge: {
    position: 'absolute', top: 0, right: -2, minWidth: 16, height: 16,
    borderRadius: 999, backgroundColor: colors.accent, borderWidth: 2, borderColor: colors.bg,
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3,
  },
  cartEntryBadgeT: { color: '#fff', fontSize: 10, fontWeight: '600', fontFamily: 'monospace' },
  mx: { marginHorizontal: 20 },
  gallery: { height: 300, overflow: 'hidden', position: 'relative' },
  gSky: { ...StyleSheet.absoluteFillObject, backgroundColor: '#eef3ef' },
  gWater: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 94, backgroundColor: '#d7e6dd' },
  gRod: {
    position: 'absolute', left: 30, top: 150, width: 330, height: 9, borderRadius: 5,
    backgroundColor: '#2a4a40', transform: [{ rotate: '-9deg' }],
  },
  gRodHandle: {
    position: 'absolute', left: 30, top: 150, width: 118, height: 9, borderRadius: 5,
    backgroundColor: '#1d3b33', transform: [{ rotate: '-9deg' }],
  },
  gSun: { position: 'absolute', left: 60, top: 38, width: 52, height: 52, borderRadius: 26, borderWidth: 3, borderColor: '#dce2dc' },
  gMark: { position: 'absolute', right: 16, top: 48, fontSize: 13, color: colors.muted, fontFamily: 'Georgia' },
  gFlag: {
    position: 'absolute', left: 14, top: 14, paddingHorizontal: 9, paddingVertical: 4,
    borderRadius: 8, backgroundColor: colors.accent,
  },
  gFlagT: { color: '#fff', fontSize: 11, fontWeight: '600' },
  /* 轮播指示点 */
  gDots: { position: 'absolute', bottom: 14, left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', gap: 5 },
  gDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.75)' },
  gDotOn: { width: 16, backgroundColor: '#fff' },
  /* 信息卡上叠大图（对照原型负 margin） */
  infoCard: { marginTop: -18, zIndex: 2, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, padding: 16 },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  price: { fontFamily: 'Georgia', fontSize: 28, fontWeight: '700', color: colors.accent },
  priceCur: { fontSize: 16 },
  priceSub: { fontSize: 12, fontWeight: '400', color: colors.muted, fontFamily: 'monospace' },
  sold: { fontSize: 12, color: colors.muted, fontFamily: 'monospace' },
  pName: { fontSize: 17, fontWeight: '600', color: colors.fg, marginTop: 6 },
  pSub: { fontSize: 13, color: colors.muted, marginTop: 4, lineHeight: 19 },
  pTags: { flexDirection: 'row', gap: 8, marginTop: 10 },
  ptag: { paddingHorizontal: 9, paddingVertical: 3, borderRadius: 999, backgroundColor: colors.accentSoft },
  ptagT: { fontSize: 11, color: colors.accent, fontWeight: '500' },
  sect: { marginTop: 12, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, padding: 16 },
  sectTitle: { fontSize: 15, fontWeight: '600', color: colors.fg },
  specChips: { flexDirection: 'row', gap: 10, marginTop: 12 },
  specChip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border, backgroundColor: colors.bg,
  },
  specChipOn: { borderColor: colors.accent, backgroundColor: colors.accentSoft },
  specChipT: { fontSize: 13, color: colors.fg },
  specChipTOn: { color: colors.accent, fontWeight: '600' },
  specExtra: { fontSize: 11, color: colors.muted, fontFamily: 'monospace' },
  qtyRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 14 },
  qtyLabel: { fontSize: 15, fontWeight: '600', color: colors.fg },
  qtyCtl: { flexDirection: 'row', alignItems: 'center', gap: 0, borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm, overflow: 'hidden' },
  qtyBtn: { width: 34, height: 32, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
  qtyBtnOff: { opacity: 0.4 },
  qtyBtnT: { fontSize: 17, color: colors.fg },
  qtyVal: { minWidth: 36, textAlign: 'center', fontSize: 14, color: colors.fg, fontFamily: 'monospace' },
  stock: { fontSize: 11, color: colors.muted, marginTop: 10, fontFamily: 'monospace' },
  specTable: { marginTop: 10, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, overflow: 'hidden' },
  specRow: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: colors.border, paddingHorizontal: 12, paddingVertical: 9 },
  specK: { width: 96, fontSize: 12.5, color: colors.muted },
  specV: { flex: 1, fontSize: 12.5, color: colors.fg },
  rvHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rateAll: { fontSize: 12, color: colors.accent, fontFamily: 'monospace' },
  review: { borderTopWidth: 1, borderTopColor: colors.border, marginTop: 12, paddingTop: 12 },
  rvRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rvAva: {
    width: 26, height: 26, borderRadius: 13, backgroundColor: colors.accentSoft,
    alignItems: 'center', justifyContent: 'center',
  },
  rvAvaT: { fontSize: 12, fontWeight: '600', color: colors.accent },
  rvName: { fontSize: 13, fontWeight: '600', color: colors.fg, flex: 1, marginLeft: 8 },
  rvStars: { fontSize: 12 },
  rvText: { fontSize: 13.5, color: colors.fg, lineHeight: 21, marginTop: 5 },
  rvMeta: { fontSize: 11, color: colors.muted, marginTop: 5, fontFamily: 'monospace' },
  buybar: {
    position: 'absolute', left: 0, right: 0, bottom: 0,
    flexDirection: 'row', gap: 10, padding: 12, paddingBottom: 20,
    borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.surface,
  },
  cartBtn: {
    flex: 1, minHeight: 44, borderRadius: 999, borderWidth: 1.5, borderColor: colors.accent,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
  },
  cartBtnT: { color: colors.accent, fontSize: 14, fontWeight: '600' },
  buyBtn: { flex: 1, minHeight: 44, borderRadius: 999, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  buyBtnT: { color: '#fff', fontSize: 14, fontWeight: '600' },
  toast: {
    position: 'absolute', bottom: 96, alignSelf: 'center',
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: colors.fg, paddingHorizontal: 18, paddingVertical: 10, borderRadius: 999,
    shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowRadius: 12, shadowOpacity: 0.3,
  },
  toastText: { fontSize: 13, color: '#fff' },
});

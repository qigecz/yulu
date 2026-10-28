import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * 本地购物车（商城未接后端，先持久化在端上）。商品以 mock 商品 id 引用，
 * qty 数量、selected 勾选态由购物车页/结算栏维护。
 */
export interface CartItem {
  /** MallProduct id（mock/data.ts）。 */
  id: string;
  qty: number;
  selected: boolean;
}

interface CartState {
  items: CartItem[];
  /** 加入购物车（已有则数量 +1，默认勾选）。 */
  add: (id: string, qty?: number) => void;
  remove: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  toggle: (id: string) => void;
  selectAll: (on: boolean) => void;
  /** 清空已勾选的商品（下单后调用）。 */
  clearSelected: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      add: (id, qty = 1) =>
        set((s) => {
          const hit = s.items.find((i) => i.id === id);
          return hit
            ? { items: s.items.map((i) => (i.id === id ? { ...i, qty: i.qty + qty, selected: true } : i)) }
            : { items: [...s.items, { id, qty, selected: true }] };
        }),
      remove: (id) => set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
      setQty: (id, qty) =>
        set((s) => ({
          items: s.items.map((i) => (i.id === id ? { ...i, qty: Math.max(1, Math.min(99, qty)) } : i)),
        })),
      toggle: (id) => set((s) => ({ items: s.items.map((i) => (i.id === id ? { ...i, selected: !i.selected } : i)) })),
      selectAll: (on) => set((s) => ({ items: s.items.map((i) => ({ ...i, selected: on })) })),
      clearSelected: () => set((s) => ({ items: s.items.filter((i) => !i.selected) })),
    }),
    {
      name: 'yulu-cart',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

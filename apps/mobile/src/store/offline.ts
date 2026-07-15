import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Route } from '@yulu/shared';

/**
 * Persisted offline route cache. Downloaded routes (full detail, including the
 * ordered spot list) are stored here so navigation works without a connection.
 * AsyncStorage survives app restarts.
 */
interface OfflineState {
  routes: Route[];
  downloadRoute: (route: Route) => void;
  removeRoute: (id: string) => void;
  has: (id: string) => boolean;
  get: (id: string) => Route | undefined;
}

export const useOfflineStore = create<OfflineState>()(
  persist(
    (set, get) => ({
      routes: [],
      downloadRoute: (route) =>
        set((state) => ({
          // Replace if already present, otherwise prepend.
          routes: [route, ...state.routes.filter((r) => r.id !== route.id)],
        })),
      removeRoute: (id) => set((state) => ({ routes: state.routes.filter((r) => r.id !== id) })),
      has: (id) => get().routes.some((r) => r.id === id),
      get: (id) => get().routes.find((r) => r.id === id),
    }),
    {
      name: 'yulu-offline',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

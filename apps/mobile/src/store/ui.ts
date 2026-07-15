import { create } from 'zustand';

/**
 * Lightweight overlay state for full-screen create/compose/detail flows.
 *
 * The app uses a flat tab switcher in App.tsx rather than a navigation stack,
 * so flows render as modal overlays on top. `feedId`/`userId` carry the
 * selected target for detail screens. This store lets any screen trigger a
 * flow without prop-drilling.
 */
export type Overlay = 'create-spot' | 'compose-feed' | 'favorites' | 'feed-detail' | 'user' | 'search' | 'offline-routes' | null;

interface UIState {
  overlay: Overlay;
  feedId: string | null;
  userId: string | null;
  openCreateSpot: () => void;
  openComposeFeed: () => void;
  openFavorites: () => void;
  openFeedDetail: (feedId: string) => void;
  openUser: (userId: string) => void;
  openSearch: () => void;
  openOfflineRoutes: () => void;
  closeOverlay: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  overlay: null,
  feedId: null,
  userId: null,
  openCreateSpot: () => set({ overlay: 'create-spot' }),
  openComposeFeed: () => set({ overlay: 'compose-feed' }),
  openFavorites: () => set({ overlay: 'favorites' }),
  openFeedDetail: (feedId) => set({ overlay: 'feed-detail', feedId }),
  openUser: (userId) => set({ overlay: 'user', userId }),
  openSearch: () => set({ overlay: 'search' }),
  openOfflineRoutes: () => set({ overlay: 'offline-routes' }),
  closeOverlay: () => set({ overlay: null, feedId: null, userId: null }),
}));

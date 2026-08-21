import { create } from 'zustand';

/**
 * Lightweight overlay state for full-screen create/compose/detail flows.
 *
 * The app uses a flat tab switcher in App.tsx rather than a navigation stack,
 * so flows render as modal overlays on top. `feedId`/`userId` carry the
 * selected target for detail screens. This store lets any screen trigger a
 * flow without prop-drilling.
 */
export type Overlay = 'create-spot' | 'compose-feed' | 'favorites' | 'feed-detail' | 'user' | 'search' | 'offline-routes' | 'spot-detail' | 'route-detail' | 'spot-list' | 'route-list' | null;

/** The five top-level tabs; lifted into the store so any screen can switch. */
export type TabKey = 'home' | 'spots' | 'nav' | 'learn' | 'profile';

interface UIState {
  overlay: Overlay;
  feedId: string | null;
  userId: string | null;
  spotId: string | null;
  routeId: string | null;
  activeTab: TabKey;
  navRouteId: string | null;
  /** Optional coords to prefill the create-spot form (e.g. from "标记坑点"). */
  createSpotCoords: { latitude: number; longitude: number } | null;
  setActiveTab: (key: TabKey) => void;
  openCreateSpot: () => void;
  /** Open create-spot with prefilled coordinates. */
  openCreateSpotAt: (latitude: number, longitude: number) => void;
  openComposeFeed: () => void;
  openFavorites: () => void;
  openFeedDetail: (feedId: string) => void;
  openUser: (userId: string) => void;
  openSpotDetail: (spotId: string) => void;
  openRouteDetail: (routeId: string) => void;
  openSpotList: () => void;
  openRouteList: () => void;
  openSearch: () => void;
  openOfflineRoutes: () => void;
  /** Switch to the nav tab and navigate the given route. */
  openNavigation: (routeId: string) => void;
  closeOverlay: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  overlay: null,
  feedId: null,
  userId: null,
  spotId: null,
  routeId: null,
  activeTab: 'home',
  navRouteId: null,
  createSpotCoords: null,
  setActiveTab: (activeTab) => set({ activeTab }),
  openCreateSpot: () => set({ overlay: 'create-spot', createSpotCoords: null }),
  openCreateSpotAt: (latitude, longitude) =>
    set({ overlay: 'create-spot', createSpotCoords: { latitude, longitude } }),
  openComposeFeed: () => set({ overlay: 'compose-feed' }),
  openFavorites: () => set({ overlay: 'favorites' }),
  openFeedDetail: (feedId) => set({ overlay: 'feed-detail', feedId }),
  openUser: (userId) => set({ overlay: 'user', userId }),
  openSpotDetail: (spotId) => set({ overlay: 'spot-detail', spotId }),
  openRouteDetail: (routeId) => set({ overlay: 'route-detail', routeId }),
  openSpotList: () => set({ overlay: 'spot-list' }),
  openRouteList: () => set({ overlay: 'route-list' }),
  openSearch: () => set({ overlay: 'search' }),
  openOfflineRoutes: () => set({ overlay: 'offline-routes' }),
  openNavigation: (routeId) => set({ navRouteId: routeId, activeTab: 'nav', overlay: null }),
  closeOverlay: () => set({ overlay: null, feedId: null, userId: null, spotId: null, routeId: null, createSpotCoords: null }),
}));

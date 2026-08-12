import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Linking } from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { colors, spacing, TabBar } from '@yulu/ui';
import type { Tab } from '@yulu/ui';
import { useAuthStore } from './store/auth';
import { useUIStore } from './store/ui';
import { setOnUnauthorized, setRefreshHandler } from './api/client';
import { forceLogout, refreshAccessToken } from './store/auth';
import { usePushNotifications } from './hooks/usePushNotifications';
import { dispatchDeepLink } from './utils/deeplink';
import { AuthScreen } from './screens/AuthScreen';
import { HomeScreen } from './screens/HomeScreen';
import { SpotsScreen } from './screens/SpotsScreen';
import { NavigationScreen } from './screens/NavigationScreen';
import { LearnScreen } from './screens/LearnScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { CreateSpotScreen } from './screens/CreateSpotScreen';
import { ComposeFeedScreen } from './screens/ComposeFeedScreen';
import { FavoritesScreen } from './screens/FavoritesScreen';
import { FeedDetailScreen } from './screens/FeedDetailScreen';
import { UserScreen } from './screens/UserScreen';
import { SearchScreen } from './screens/SearchScreen';
import { OfflineRoutesScreen } from './screens/OfflineRoutesScreen';
import { ErrorBoundary } from './components/ErrorBoundary';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false },
  },
});

const tabs: Tab[] = [
  { key: 'home', label: '首页', icon: '🏠' },
  { key: 'spots', label: '坑点', icon: '📍' },
  { key: 'nav', label: '导航', icon: '🧭' },
  { key: 'learn', label: '学习', icon: '📖' },
  { key: 'profile', label: '我的', icon: '👤' },
];

/** Top-level guard so a render error shows a recoverable fallback, not a crash. */
export default function App() {
  return (
    <ErrorBoundary>
      <AppInner />
    </ErrorBoundary>
  );
}

function AppInner() {
  const status = useAuthStore((s) => s.status);
  const hydrate = useAuthStore((s) => s.hydrate);
  const forceBootBail = useAuthStore((s) => s.forceBootBail);
  const activeTab = useUIStore((s) => s.activeTab);
  const setActiveTab = useUIStore((s) => s.setActiveTab);

  // Push permissions + token registration (only when authenticated), and tap
  // routing handled inside the hook.
  usePushNotifications(status === 'authenticated');

  // Deep links (yulu://...) from cold start and while running.
  useEffect(() => {
    void Linking.getInitialURL().then(dispatchDeepLink);
    const sub = Linking.addEventListener('url', ({ url }) => dispatchDeepLink(url));
    return () => sub.remove();
  }, []);

  // Restore session on boot and wire the API client's 401 handlers.
  useEffect(() => {
    setOnUnauthorized(() => forceLogout());
    setRefreshHandler(refreshAccessToken);
    void hydrate();
  }, [hydrate]);

  // Safety net: if hydrate never resolves (e.g. a storage call hangs), don't
  // leave the user on a blank loading screen forever.
  useEffect(() => {
    if (status !== 'loading') return;
    const t = setTimeout(() => forceBootBail(), 5000);
    return () => clearTimeout(t);
  }, [status, forceBootBail]);

  const renderScreen = () => {
    switch (activeTab) {
      case 'home': return <HomeScreen />;
      case 'spots': return <SpotsScreen />;
      case 'nav': return <NavigationScreen />;
      case 'learn': return <LearnScreen />;
      case 'profile': return <ProfileScreen />;
      default: return <HomeScreen />;
    }
  };

  if (status === 'loading') {
    return (
      <View style={styles.boot}>
        <Text style={styles.bootEmoji}>🎣</Text>
        <Text style={styles.bootTitle}>渔路 YULU</Text>
        <ActivityIndicator color={colors.accent} style={{ marginTop: 12 }} />
        <Text style={styles.bootHint}>加载中…</Text>
      </View>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <QueryClientProvider client={queryClient}>
        <AuthScreen />
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <View style={styles.container}>
        {activeTab !== 'nav' && (
          <View style={styles.statusBar}>
            <Text style={styles.statusText}>9:41</Text>
            <Text style={styles.statusText}>WiFi</Text>
          </View>
        )}
        <View style={styles.screen}>{renderScreen()}</View>
        <TabBar tabs={tabs} activeKey={activeTab} onTabPress={(k) => setActiveTab(k as typeof activeTab)} />
        <View style={styles.homeIndicator} />
        <Overlay />
      </View>
    </QueryClientProvider>
  );
}

/** Full-screen create/compose flows rendered above the tab shell. */
function Overlay() {
  const overlay = useUIStore((s) => s.overlay);
  const close = useUIStore((s) => s.closeOverlay);
  if (!overlay) return null;

  return (
    <View style={styles.overlay}>
      {/* Floating close (top-right); screens carry their own header & scroll. */}
      <TouchableOpacity onPress={close} style={styles.overlayClose} activeOpacity={0.7}>
        <Text style={styles.overlayCloseText}>✕</Text>
      </TouchableOpacity>
      {overlay === 'create-spot' ? (
        <CreateSpotScreen />
      ) : overlay === 'compose-feed' ? (
        <ComposeFeedScreen />
      ) : overlay === 'favorites' ? (
        <FavoritesScreen />
      ) : overlay === 'feed-detail' ? (
        <FeedDetailScreen />
      ) : overlay === 'search' ? (
        <SearchScreen />
      ) : overlay === 'offline-routes' ? (
        <OfflineRoutesScreen />
      ) : (
        <UserScreen />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  boot: { flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' },
  bootEmoji: { fontSize: 56 },
  bootTitle: { fontFamily: 'Georgia', fontSize: 22, fontWeight: '700', color: colors.fg, marginTop: 12 },
  bootHint: { fontSize: 13, color: colors.muted, marginTop: 10 },
  container: { flex: 1, backgroundColor: colors.bg },
  statusBar: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingHorizontal: 26, paddingTop: 14, paddingBottom: 4,
  },
  statusText: { fontSize: 15, fontWeight: '600', color: colors.fg },
  screen: { flex: 1 },
  homeIndicator: {
    height: 28, alignItems: 'center', justifyContent: 'flex-end',
  },
  overlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: colors.bg, zIndex: 10,
  },
  overlayClose: {
    position: 'absolute', top: 16, right: spacing.screenPadding,
    width: 38, height: 38, borderRadius: 19, zIndex: 20,
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  overlayCloseText: { fontSize: 16, color: colors.fg },
});

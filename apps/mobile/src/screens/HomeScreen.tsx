import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, radius, WeatherStrip, SearchBar, SectionHeader, SpotCard, SpotCardList, RouteItem, FeedItem } from '@yulu/ui';
import { formatRelativeTime, formatDistance } from '@yulu/shared';
import { useWeather, useNearbySpots, useRoutes, useFeeds, useToggleFeedLike, useToggleFavorite } from '../hooks/queries';
import { useClock, formatGreetingDate } from '../hooks/useClock';
import { QueryState } from '../components/QueryState';
import { SpotListSkeleton, RouteListSkeleton, FeedSkeleton } from '../components/Skeletons';
import { useUIStore } from '../store/ui';

export function HomeScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const now = useClock();
  const weather = useWeather();
  const spots = useNearbySpots();
  const routes = useRoutes();
  const feeds = useFeeds();
  const openComposeFeed = useUIStore((s) => s.openComposeFeed);
  const openFeedDetail = useUIStore((s) => s.openFeedDetail);
  const openUser = useUIStore((s) => s.openUser);
  const openSearch = useUIStore((s) => s.openSearch);
  const openSpotDetail = useUIStore((s) => s.openSpotDetail);
  const toggleFeedLike = useToggleFeedLike();
  const toggleFavorite = useToggleFavorite();

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all(
      [weather.refetch(), spots.refetch(), routes.refetch(), feeds.refetch()].map((p) => p.catch(() => undefined)),
    );
    setRefreshing(false);
  };

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>{formatGreetingDate(now)}</Text>
          <Text style={styles.title}>你好，钓友</Text>
        </View>
        <View style={styles.headerActions}>
          <View style={styles.iconBtn}>
            <Ionicons name="notifications-outline" size={18} color={colors.fg} />
          </View>
          <View style={styles.iconBtn}>
            <Ionicons name="settings-outline" size={18} color={colors.fg} />
          </View>
        </View>
      </View>

      {/* Weather */}
      <QueryState isLoading={weather.isLoading} isError={weather.isError} refetch={() => weather.refetch()} minHeight={64}>
        {weather.data && (
          <WeatherStrip
            temperature={weather.data.temperature}
            condition={weather.data.condition}
            windDirection={weather.data.windDirection}
            windLevel={weather.data.windLevel}
            pressure={weather.data.pressure}
            fishingAdvice={weather.data.fishingAdvice}
          />
        )}
      </QueryState>

      <View style={styles.spacer} />

      {/* Search */}
      <View style={styles.pad}>
        <TouchableOpacity onPress={openSearch} activeOpacity={0.8}>
          <SearchBar />
        </TouchableOpacity>
      </View>

      <View style={styles.spacer} />

      {/* Banner */}
      <View style={styles.banner}>
        <Text style={styles.bannerTitle}>渔具商城上新</Text>
        <Text style={styles.bannerDesc}>夏季路亚竿专场，精选入门到竞技款</Text>
        <View style={styles.bannerBtn}><Text style={styles.bannerBtnText}>去逛逛</Text></View>
      </View>

      <View style={{ height: 18 }} />

      {/* Nearby spots */}
      <SectionHeader title="附近热门钓点" actionLabel="查看全部 →" />
      <View style={{ height: 10 }} />
      {spots.isLoading ? (
        <SpotListSkeleton count={3} />
      ) : (
      <QueryState
        isLoading={false}
        isError={spots.isError}
        refetch={() => spots.refetch()}
        empty={!(spots.data && spots.data.length)}
        emptyText="附近暂无钓点"
      >
        <SpotCardList>
          {spots.data!.map((spot) => (
            <SpotCard
              key={spot.id}
              name={spot.name}
              distance={spot.distance ? formatDistance(spot.distance) : ''}
              fishInfo={`${spot.fishSpecies.join('/')} · ${spot.fishingMethod}`}
              tags={spot.tags}
              onPress={() => openSpotDetail(spot.id)}
            />
          ))}
        </SpotCardList>
      </QueryState>
      )}

      <View style={{ height: 18 }} />

      {/* Recent routes */}
      <View style={styles.pad}>
        <SectionHeader title="最新路线" actionLabel="更多 →" />
        <View style={{ height: 8 }} />
        {routes.isLoading ? (
          <RouteListSkeleton count={3} />
        ) : (
        <QueryState
          isLoading={false}
          isError={routes.isError}
          refetch={() => routes.refetch()}
          empty={!(routes.data && routes.data.length)}
          emptyText="暂无路线"
        >
          {routes.data!.map((route) => (
            <RouteItem
              key={route.id}
              name={route.name}
              description={`${route.spots?.length || 0} 坑点 · ${route.totalDistance}km · ${route.uploader?.nickname || '未知'}`}
            />
          ))}
        </QueryState>
        )}
      </View>

      <View style={{ height: 8 }} />

      {/* Community feed */}
      <View style={styles.pad}>
        <View style={styles.feedHeader}>
          <SectionHeader title="钓友动态" actionLabel="更多 →" />
        </View>
        <TouchableOpacity style={styles.publishBtn} onPress={openComposeFeed} activeOpacity={0.7}>
          <Text style={styles.publishBtnText}>＋ 分享你的作钓动态…</Text>
        </TouchableOpacity>
        <View style={{ height: 12 }} />
        {feeds.isLoading ? (
          <FeedSkeleton count={2} />
        ) : (
        <QueryState
          isLoading={false}
          isError={feeds.isError}
          refetch={() => feeds.refetch()}
          empty={!(feeds.data && feeds.data.length)}
          emptyText="暂无动态"
        >
          {feeds.data!.map((feed) => (
            <FeedItem
              key={feed.id}
              userName={feed.user?.nickname || ''}
              content={feed.content}
              time={formatRelativeTime(feed.createdAt)}
              location={feed.location || ''}
              image={feed.images?.[0]}
              likesCount={feed.likesCount}
              liked={feed.liked}
              favorited={feed.favorited}
              onToggleLike={() => toggleFeedLike.mutate({ id: feed.id, liked: !!feed.liked })}
              onToggleFavorite={() => toggleFavorite.mutate({ type: 'feed', id: feed.id, favorited: !!feed.favorited })}
              onOpenAuthor={() => openUser(feed.userId)}
              onOpenFeed={() => openFeedDetail(feed.id)}
            />
          ))}
        </QueryState>
        )}
      </View>

      <View style={{ height: 80 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: spacing.screenPadding, paddingTop: 8, paddingBottom: 12,
  },
  greeting: { fontSize: 11, color: colors.muted, letterSpacing: 0.08, textTransform: 'uppercase', marginBottom: 4 },
  title: { fontFamily: 'Georgia', fontSize: fontSize.h1, letterSpacing: -0.02, color: colors.fg },
  headerActions: { flexDirection: 'row', gap: 8 },
  iconBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  iconText: { fontSize: 16 },
  spacer: { height: 12 },
  pad: { paddingHorizontal: spacing.screenPadding },
  banner: {
    marginHorizontal: spacing.screenPadding, padding: 16,
    backgroundColor: colors.accentSoft, borderWidth: 1, borderColor: colors.accent,
    borderRadius: radius.lg,
  },
  bannerTitle: { fontSize: 15, fontWeight: '600', color: colors.fg },
  bannerDesc: { fontSize: 13, color: colors.muted, marginTop: 4, marginBottom: 10 },
  bannerBtn: {
    alignSelf: 'flex-start', paddingHorizontal: 14, paddingVertical: 7,
    backgroundColor: colors.accent, borderRadius: radius.sm,
  },
  bannerBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  feedHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  publishBtn: {
    marginTop: 4, paddingVertical: 14, paddingHorizontal: 16,
    borderRadius: radius.md, borderWidth: 1, borderStyle: 'dashed', borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  publishBtnText: { fontSize: 13, color: colors.muted },
});

import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { colors, spacing, fontSize, radius, WeatherStrip, SearchBar, SectionHeader, SpotCard, SpotCardList, RouteItem, FeedItem } from '@yulu/ui';
import { mockWeather, mockSpots, mockRoutes, mockFeeds } from '../mock/data';
import { formatRelativeTime } from '@yulu/shared';
import { formatDistance } from '@yulu/shared';

export function HomeScreen() {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>周三 · 6月4日</Text>
          <Text style={styles.title}>你好，钓友</Text>
        </View>
        <View style={styles.headerActions}>
          <View style={styles.iconBtn}><Text style={styles.iconText}>🔔</Text></View>
          <View style={styles.iconBtn}><Text style={styles.iconText}>⚙</Text></View>
        </View>
      </View>

      {/* Weather */}
      <WeatherStrip
        temperature={mockWeather.temperature}
        condition={mockWeather.condition}
        windDirection={mockWeather.windDirection}
        windLevel={mockWeather.windLevel}
        pressure={mockWeather.pressure}
        fishingAdvice={mockWeather.fishingAdvice}
      />

      <View style={styles.spacer} />

      {/* Search */}
      <View style={styles.pad}>
        <SearchBar />
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
      <SpotCardList>
        {mockSpots.map((spot) => (
          <SpotCard
            key={spot.id}
            name={spot.name}
            distance={spot.distance ? formatDistance(spot.distance) : ''}
            fishInfo={`${spot.fishSpecies.join('/')} · ${spot.fishingMethod}`}
            tags={spot.tags}
          />
        ))}
      </SpotCardList>

      <View style={{ height: 18 }} />

      {/* Recent routes */}
      <View style={styles.pad}>
        <SectionHeader title="最新路线" actionLabel="更多 →" />
        <View style={{ height: 8 }} />
        {mockRoutes.map((route) => (
          <RouteItem
            key={route.id}
            name={route.name}
            description={`${route.spots?.length || 0} 坑点 · ${route.totalDistance}km · ${route.uploader?.nickname || '未知'}`}
          />
        ))}
      </View>

      <View style={{ height: 8 }} />

      {/* Community feed */}
      <View style={styles.pad}>
        <SectionHeader title="钓友动态" actionLabel="更多 →" />
        <View style={{ height: 8 }} />
        {mockFeeds.map((feed) => (
          <FeedItem
            key={feed.id}
            userName={feed.user?.nickname || ''}
            content={feed.content}
            time={formatRelativeTime(feed.createdAt)}
            location={feed.location || ''}
          />
        ))}
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
});

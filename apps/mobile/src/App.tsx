import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, fontSize, spacing, TabBar } from '@yulu/ui';
import type { Tab } from '@yulu/ui';
import { HomeScreen } from './screens/HomeScreen';
import { SpotsScreen } from './screens/SpotsScreen';
import { NavigationScreen } from './screens/NavigationScreen';
import { LearnScreen } from './screens/LearnScreen';
import { ProfileScreen } from './screens/ProfileScreen';

const tabs: Tab[] = [
  { key: 'home', label: '首页', icon: '🏠' },
  { key: 'spots', label: '坑点', icon: '📍' },
  { key: 'nav', label: '导航', icon: '🧭' },
  { key: 'learn', label: '学习', icon: '📖' },
  { key: 'profile', label: '我的', icon: '👤' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('home');

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

  return (
    <View style={styles.container}>
      {activeTab !== 'nav' && (
        <View style={styles.statusBar}>
          <Text style={styles.statusText}>9:41</Text>
          <Text style={styles.statusText}>WiFi</Text>
        </View>
      )}
      <View style={styles.screen}>{renderScreen()}</View>
      <TabBar tabs={tabs} activeKey={activeTab} onTabPress={setActiveTab} />
      <View style={styles.homeIndicator} />
    </View>
  );
}

const styles = StyleSheet.create({
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
});

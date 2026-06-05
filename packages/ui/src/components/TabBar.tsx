import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, fontSize } from '../theme/tokens';

export interface Tab {
  key: string;
  label: string;
  icon: string;
}

interface TabBarProps {
  tabs: Tab[];
  activeKey: string;
  onTabPress: (key: string) => void;
}

export function TabBar({ tabs, activeKey, onTabPress }: TabBarProps) {
  return (
    <View style={styles.container}>
      {tabs.map((tab) => (
        <TouchableOpacity key={tab.key} style={styles.tab} onPress={() => onTabPress(tab.key)}>
          <Text style={[styles.icon, activeKey === tab.key && styles.activeIcon]}>{tab.icon}</Text>
          <Text style={[styles.label, activeKey === tab.key && styles.activeLabel]}>{tab.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 8,
    paddingHorizontal: 8,
    backgroundColor: colors.surface,
  },
  tab: { flex: 1, alignItems: 'center', gap: 2, paddingBottom: 4 },
  icon: { fontSize: 22, color: colors.muted },
  label: { fontSize: fontSize.tiny, color: colors.muted },
  activeIcon: { color: colors.accent },
  activeLabel: { color: colors.accent, fontWeight: '600' },
});

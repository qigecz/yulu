import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, fontSize } from '../theme/tokens';
import { TabIcon, type TabIconName } from './TabIcon';

export interface Tab {
  key: string;
  label: string;
  /** Line-icon name rendered by TabIcon (outline inactive, filled active). */
  icon: TabIconName;
}

interface TabBarProps {
  tabs: Tab[];
  activeKey: string;
  onTabPress: (key: string) => void;
}

export function TabBar({ tabs, activeKey, onTabPress }: TabBarProps) {
  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const active = activeKey === tab.key;
        return (
          <TouchableOpacity key={tab.key} style={styles.tab} onPress={() => onTabPress(tab.key)} activeOpacity={0.7}>
            <TabIcon name={tab.icon} active={active} size={24} />
            <Text style={[styles.label, active && styles.activeLabel]}>{tab.label}</Text>
          </TouchableOpacity>
        );
      })}
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
  label: { fontSize: fontSize.tiny, color: colors.muted, marginTop: 2 },
  activeLabel: { color: colors.accent, fontWeight: '600' },
});

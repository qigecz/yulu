import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
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

/**
 * 底部 Tab。iOS 沿用线性图标样式；Android 按 mobile-android.html 的
 * Material 3 规范——选中项图标外套 48×28 accent-soft 圆角胶囊指示器。
 */
export function TabBar({ tabs, activeKey, onTabPress }: TabBarProps) {
  const android = Platform.OS === 'android';
  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const active = activeKey === tab.key;
        return (
          <TouchableOpacity key={tab.key} style={styles.tab} onPress={() => onTabPress(tab.key)} activeOpacity={0.7}>
            <View style={[styles.iconWrap, android && styles.iconWrapMat, active && android && styles.iconWrapMatOn]}>
              <TabIcon name={tab.icon} active={active} size={24} />
            </View>
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
  iconWrap: {},
  /* Material 3 胶囊指示器（Android） */
  iconWrapMat: { width: 48, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  iconWrapMatOn: { backgroundColor: colors.accentSoft },
  label: { fontSize: fontSize.tiny, color: colors.muted, marginTop: 2 },
  activeLabel: { color: colors.accent, fontWeight: '600' },
});

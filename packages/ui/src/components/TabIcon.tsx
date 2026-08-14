import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/tokens';

export type TabIconName = 'home' | 'spots' | 'nav' | 'learn' | 'profile';

interface Props {
  name: TabIconName;
  /** Render in the active (accent) state. */
  active?: boolean;
  size?: number;
}

const ICONS: Record<TabIconName, { on: keyof typeof Ionicons.glyphMap; off: keyof typeof Ionicons.glyphMap }> = {
  // Outline when inactive, filled when active — matches the Material 3 tab
  // treatment in the mobile-android.html prototype.
  home: { off: 'home-outline', on: 'home' },
  spots: { off: 'location-outline', on: 'location' },
  nav: { off: 'compass-outline', on: 'compass' },
  learn: { off: 'book-outline', on: 'book' },
  profile: { off: 'person-outline', on: 'person' },
};

/**
 * Bottom-tab line icons. Uses Ionicons (bundled with the Expo SDK, no extra
 * native linking) with the accent/muted two-state colour from design tokens.
 */
export function TabIcon({ name, active, size = 24 }: Props) {
  const set = ICONS[name];
  return (
    <Ionicons
      name={(active ? set.on : set.off) as keyof typeof Ionicons.glyphMap}
      size={size}
      color={active ? colors.accent : colors.muted}
    />
  );
}

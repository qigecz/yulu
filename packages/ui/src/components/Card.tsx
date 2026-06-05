import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors, radius, spacing } from '../theme/tokens';

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'accent' | 'flat';
  style?: any;
}

export function Card({ children, variant = 'default', style }: CardProps) {
  return <View style={[styles[variant], style]}>{children}</View>;
}

const styles = StyleSheet.create({
  default: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.cardPadding,
  },
  accent: {
    backgroundColor: colors.accent,
    borderRadius: radius.lg,
    padding: spacing.cardPadding,
  },
  flat: {
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});

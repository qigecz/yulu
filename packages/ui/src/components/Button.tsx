import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { colors, fontSize, radius } from '../theme/tokens';

interface ButtonProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'ghost';
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
}

export function Button({ title, variant = 'primary', onPress, loading, disabled }: ButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.base, styles[variant], disabled && styles.disabled]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? '#fff' : colors.fg} />
      ) : (
        <Text style={[styles.text, styles[`${variant}Text`]]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 11,
    paddingHorizontal: 20,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  primary: { backgroundColor: colors.accent, borderColor: colors.accent },
  secondary: { backgroundColor: 'transparent', borderColor: colors.border },
  ghost: { backgroundColor: 'transparent', borderColor: 'transparent', paddingHorizontal: 8 },
  disabled: { opacity: 0.5 },
  text: { fontSize: fontSize.body, fontWeight: '500', letterSpacing: -0.5 },
  primaryText: { color: colors.surface },
  secondaryText: { color: colors.fg },
  ghostText: { color: colors.fg },
});

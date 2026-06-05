import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, fontSize, radius } from '../theme/tokens';

interface PillProps {
  label: string;
}

export function Pill({ label }: PillProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.accentSoft,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  text: {
    color: colors.accent,
    fontSize: fontSize.tiny,
    fontWeight: '600',
  },
});

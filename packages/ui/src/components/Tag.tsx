import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, fontSize, radius } from '../theme/tokens';

interface TagProps {
  label: string;
}

export function Tag({ label }: TagProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
  },
  text: {
    color: colors.muted,
    fontSize: fontSize.small,
  },
});

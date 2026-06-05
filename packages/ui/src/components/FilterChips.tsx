import React from 'react';
import { ScrollView, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, fontSize, radius, spacing } from '../theme/tokens';

interface FilterChipsProps {
  options: string[];
  activeIndex: number;
  onSelect: (index: number) => void;
}

export function FilterChips({ options, activeIndex, onSelect }: FilterChipsProps) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.container}>
      {options.map((option, i) => (
        <TouchableOpacity key={option} style={[styles.chip, i === activeIndex && styles.active]} onPress={() => onSelect(i)}>
          <Text style={[styles.text, i === activeIndex && styles.activeText]}>{option}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { gap: 6, paddingHorizontal: spacing.screenPadding },
  chip: {
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: radius.pill,
    borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface,
  },
  active: { backgroundColor: colors.accent, borderColor: colors.accent },
  text: { fontSize: fontSize.meta + 1, fontWeight: '500', color: colors.fg },
  activeText: { color: '#fff' },
});

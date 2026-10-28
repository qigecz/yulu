import React from 'react';
import { View, TextInput, StyleSheet, Platform } from 'react-native';
import { colors, fontSize, radius } from '../theme/tokens';

interface SearchBarProps {
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
}

/** 搜索框：Android 用 Material 风格 28px 大圆角（mobile-android.html），iOS 用常规圆角。 */
export function SearchBar({ placeholder = '搜索钓点、路线、教程…', value, onChangeText }: SearchBarProps) {
  return (
    <View style={[styles.container, Platform.OS === 'android' && styles.containerMat]}>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        value={value}
        onChangeText={onChangeText}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
  },
  containerMat: { borderRadius: 28, paddingHorizontal: 16, paddingVertical: 12 },
  input: {
    flex: 1,
    fontSize: fontSize.body,
    color: colors.fg,
    padding: 0,
  },
});

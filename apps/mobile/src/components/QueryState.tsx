import React from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, fontSize } from '@yulu/ui';

interface QueryStateProps {
  isLoading: boolean;
  isError: boolean;
  /** Called when the user taps "retry". */
  refetch?: () => void;
  /** When not loading/error but data is empty, render this fallback. */
  empty?: boolean;
  emptyText?: string;
  minHeight?: number;
  children?: React.ReactNode;
}

/**
 * Renders loading / error / empty states for a data-driven screen section.
 * Keeps each screen's JSX focused on the happy path.
 */
export function QueryState({
  isLoading,
  isError,
  refetch,
  empty,
  emptyText = '暂无数据',
  minHeight = 120,
  children,
}: QueryStateProps) {
  if (isLoading) {
    return (
      <View style={[styles.center, { minHeight }]}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={[styles.center, { minHeight }]}>
        <Text style={styles.text}>加载失败</Text>
        {refetch && (
          <TouchableOpacity onPress={() => refetch()} style={styles.retry}>
            <Text style={styles.retryText}>重试</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  if (empty) {
    return (
      <View style={[styles.center, { minHeight }]}>
        <Text style={styles.text}>{emptyText}</Text>
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center', paddingVertical: 16 },
  text: { fontSize: fontSize.meta, color: colors.muted },
  retry: { marginTop: 8, paddingHorizontal: 14, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: colors.border },
  retryText: { fontSize: fontSize.meta, color: colors.accent, fontWeight: '600' },
});

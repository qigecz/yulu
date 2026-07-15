import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, spacing, fontSize, radius } from '@yulu/ui';

interface Props {
  children: React.ReactNode;
}
interface State {
  hasError: boolean;
}

/**
 * Top-level render guard. A thrown render error would otherwise white-screen
 * the whole app; this shows a calm fallback and lets the user reset the subtree.
 *
 * Note: function components can't implement componentDidCatch, so this stays a
 * class component.
 */
export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // surfaced to logs only; not user-visible
    console.warn('ErrorBoundary caught', error, info.componentStack);
  }

  reset = () => this.setState({ hasError: false });

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <View style={styles.container}>
        <Text style={styles.emoji}>🎣</Text>
        <Text style={styles.title}>水面起雾了</Text>
        <Text style={styles.desc}>页面加载出了点问题，可以重试一下。</Text>
        <TouchableOpacity style={styles.btn} onPress={this.reset} activeOpacity={0.7}>
          <Text style={styles.btnText}>重试</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
  emoji: { fontSize: 48 },
  title: { fontFamily: 'Georgia', fontSize: fontSize.h2, color: colors.fg, marginTop: spacing.md },
  desc: { fontSize: fontSize.body, color: colors.muted, marginTop: spacing.xs, textAlign: 'center' },
  btn: {
    marginTop: spacing.lg, paddingHorizontal: spacing.md, paddingVertical: spacing.xs + 2,
    backgroundColor: colors.accent, borderRadius: radius.md,
  },
  btnText: { color: '#fff', fontSize: fontSize.body, fontWeight: '600' },
});

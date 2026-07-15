import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { colors } from '../theme/tokens';

/**
 * Animated placeholder block used in loading states instead of a spinner.
 * A subtle opacity pulse matches the calm sage/teal palette.
 */
export function Skeleton({ style, radius = 8 }: { style?: StyleProp<ViewStyle>; radius?: number }) {
  const opacity = useRef(new Animated.Value(0.35)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 750, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.35, duration: 750, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return <Animated.View style={[{ backgroundColor: colors.border, borderRadius: radius, opacity }, style]} />;
}

/** A two-line text placeholder (title + subtitle), the most common list-row shape. */
export function SkeletonText({
  titleWidth = 140,
  subWidth = 90,
  height = 56,
  leading,
}: {
  titleWidth?: number;
  subWidth?: number;
  height?: number;
  /** A leading square (avatar/thumbnail) before the text lines. */
  leading?: number;
}) {
  return (
    <View style={[textStyles.row, { minHeight: height }]}>
      {leading ? <Skeleton style={{ width: leading, height: leading }} radius={leading / 2} /> : null}
      <View style={textStyles.lines}>
        <Skeleton style={{ width: titleWidth, height: 13 }} />
        <Skeleton style={{ width: subWidth, height: 11, marginTop: 7 }} />
      </View>
    </View>
  );
}

const textStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  lines: { flex: 1 },
});

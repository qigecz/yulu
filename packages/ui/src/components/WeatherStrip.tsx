import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, fontSize, radius, spacing } from '../theme/tokens';
import { Pill } from './Pill';

interface WeatherStripProps {
  temperature: number;
  condition: string;
  windDirection: string;
  windLevel: number;
  pressure: number;
  fishingAdvice: string;
}

export function WeatherStrip({ temperature, condition, windDirection, windLevel, pressure, fishingAdvice }: WeatherStripProps) {
  return (
    <View style={styles.container}>
      <View style={styles.icon}><Text style={styles.iconText}>☀</Text></View>
      <View style={styles.textContainer}>
        <Text style={styles.mainText}>
          <Text style={styles.bold}>{condition} {temperature}°C</Text>
          <Text style={styles.sub}> · {windDirection} {windLevel}级 · 气压 {pressure}hPa</Text>
        </Text>
      </View>
      <Pill label={fishingAdvice} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 16, paddingVertical: 12, marginHorizontal: spacing.screenPadding,
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md,
  },
  icon: {
    width: 32, height: 32, borderRadius: radius.sm,
    backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center',
  },
  iconText: { fontSize: 16 },
  textContainer: { flex: 1 },
  mainText: { fontSize: fontSize.meta + 1 },
  bold: { fontWeight: '600', color: colors.fg },
  sub: { color: colors.muted, fontSize: fontSize.meta },
});

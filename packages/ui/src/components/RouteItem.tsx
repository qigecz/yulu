import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, fontSize, radius, spacing } from '../theme/tokens';
import { Pill } from './Pill';

interface RouteItemProps {
  name: string;
  description: string;
  onDownload?: () => void;
}

export function RouteItem({ name, description, onDownload }: RouteItemProps) {
  return (
    <View style={styles.container}>
      <View style={styles.icon}>
        <Text style={styles.iconText}>🗺</Text>
      </View>
      <View style={styles.body}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.desc}>{description}</Text>
      </View>
      <TouchableOpacity onPress={onDownload}>
        <Pill label="下载" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  icon: {
    width: 44, height: 44, borderRadius: radius.md,
    backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center',
  },
  iconText: { fontSize: 20 },
  body: { flex: 1 },
  name: { fontSize: fontSize.body, fontWeight: '500', color: colors.fg },
  desc: { fontSize: fontSize.meta, color: colors.muted, marginTop: 2 },
});

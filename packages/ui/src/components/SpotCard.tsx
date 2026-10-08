import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { colors, fontSize, radius, spacing } from '../theme/tokens';
import { Tag } from './Tag';

interface SpotCardProps {
  name: string;
  distance: string;
  fishInfo: string;
  tags?: string[];
  onPress?: () => void;
}

export function SpotCard({ name, distance, fishInfo, tags, onPress }: SpotCardProps) {
  return (
    <TouchableOpacity disabled={!onPress} onPress={onPress} activeOpacity={0.85} style={styles.card}>
      <View style={styles.image} />
      <View style={styles.info}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.meta}>{distance} · {fishInfo}</Text>
        {tags && (
          <View style={styles.tags}>
            {tags.map((tag, i) => <Tag key={i} label={tag} />)}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 200,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  image: { height: 100, backgroundColor: colors.accentSoft },
  info: { padding: 10 },
  name: { fontSize: fontSize.body - 1, fontWeight: '600', color: colors.fg },
  meta: { fontSize: fontSize.meta, color: colors.muted, marginTop: 3 },
  tags: { flexDirection: 'row', gap: 4, marginTop: 6 },
});

export function SpotCardList({ children }: { children: React.ReactNode }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={listStyles.container}>
      {children}
    </ScrollView>
  );
}

const listStyles = StyleSheet.create({
  container: { gap: 10, paddingHorizontal: spacing.screenPadding },
});

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, fontSize, spacing } from '../theme/tokens';

interface FeedItemProps {
  userName: string;
  content: string;
  time: string;
  location: string;
}

export function FeedItem({ userName, content, time, location }: FeedItemProps) {
  return (
    <View style={styles.container}>
      <View style={styles.avatar} />
      <View style={styles.body}>
        <Text style={styles.userName}>{userName}</Text>
        <Text style={styles.content}>{content}</Text>
        <Text style={styles.time}>{time} · {location}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 10,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  avatar: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: colors.accentSoft, borderWidth: 1, borderColor: colors.border,
  },
  body: { flex: 1 },
  userName: { fontSize: fontSize.meta + 1, fontWeight: '600', color: colors.fg },
  content: { fontSize: fontSize.meta + 1, color: colors.muted, marginTop: 2, lineHeight: 18 },
  time: { fontSize: fontSize.small, color: colors.muted, marginTop: 4 },
});

import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, fontSize, spacing } from '../theme/tokens';

interface FeedItemProps {
  userName: string;
  content: string;
  time: string;
  location: string;
  /** Optional images (URLs or local file URIs). Shows the first as a thumbnail. */
  image?: string;
  likesCount?: number;
  liked?: boolean;
  favorited?: boolean;
  onToggleLike?: () => void;
  onToggleFavorite?: () => void;
  onOpenAuthor?: () => void;
  onOpenFeed?: () => void;
}

export function FeedItem({
  userName, content, time, location, image,
  likesCount, liked, favorited, onToggleLike, onToggleFavorite, onOpenAuthor, onOpenFeed,
}: FeedItemProps) {
  return (
    <View style={styles.container}>
      <View style={styles.avatar} />
      <View style={styles.body}>
        <Text style={styles.userName} onPress={onOpenAuthor}>{userName}</Text>
        <Text style={styles.content} onPress={onOpenFeed}>{content}</Text>
        {image ? (
          <TouchableOpacity onPress={onOpenFeed} activeOpacity={0.9}>
            <Image source={{ uri: image }} style={styles.image} />
          </TouchableOpacity>
        ) : null}
        <View style={styles.actions}>
          {onToggleLike && (
            <TouchableOpacity style={styles.action} onPress={onToggleLike} activeOpacity={0.6}>
              <Text style={[styles.actionIcon, liked && { color: colors.danger }]}>{liked ? '❤' : '♡'}</Text>
              <Text style={styles.actionCount}>{likesCount ?? 0}</Text>
            </TouchableOpacity>
          )}
          {onToggleFavorite && (
            <TouchableOpacity style={styles.action} onPress={onToggleFavorite} activeOpacity={0.6}>
              <Text style={[styles.actionIcon, favorited && { color: colors.accent }]}>{favorited ? '★' : '☆'}</Text>
              <Text style={styles.actionCount}>收藏</Text>
            </TouchableOpacity>
          )}
          <Text style={styles.time}>{time} · {location}</Text>
        </View>
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
  image: {
    width: '100%', height: 160, borderRadius: 12, marginTop: 8,
    backgroundColor: colors.accentSoft,
  },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 16, marginTop: 8 },
  action: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  actionIcon: { fontSize: 15, color: colors.muted },
  actionCount: { fontSize: fontSize.small, color: colors.muted },
  time: { fontSize: fontSize.small, color: colors.muted, marginLeft: 'auto' },
});

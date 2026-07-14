import React, { useState } from 'react';
import { View, Text, TextInput, Image, ScrollView, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { colors, spacing, fontSize, radius } from '@yulu/ui';
import { formatRelativeTime } from '@yulu/shared';
import { useQueryClient } from '@tanstack/react-query';
import type { Feed } from '@yulu/shared';
import { useFeedComments, useAddComment, useToggleFeedLike } from '../hooks/queries';
import { QueryState } from '../components/QueryState';
import { Header } from '../components/FormControls';
import { useUIStore } from '../store/ui';

export function FeedDetailScreen() {
  const feedId = useUIStore((s) => s.feedId);
  const openUser = useUIStore((s) => s.openUser);
  const qc = useQueryClient();
  const feed = qc.getQueryData<Feed[]>(['feeds'])?.find((f) => f.id === feedId) ?? null;

  const comments = useFeedComments(feedId);
  const addComment = useAddComment();
  const toggleLike = useToggleFeedLike();
  const [draft, setDraft] = useState('');

  const submitComment = async () => {
    const text = draft.trim();
    if (!text || !feedId) return;
    setDraft('');
    try {
      await addComment.mutateAsync({ targetType: 'feed', targetId: feedId, content: text });
    } catch {
      setDraft(text);
    }
  };

  if (!feed) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
        <Header title="动态详情" />
        <Text style={styles.empty}>该动态暂不可用。</Text>
      </ScrollView>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 80 }} keyboardShouldPersistTaps="handled">
        <Header title="动态详情" />

        {/* Author */}
        <TouchableOpacity style={styles.authorRow} onPress={() => openUser(feed.userId)} activeOpacity={0.6}>
          <View style={styles.avatar} />
          <View>
            <Text style={styles.authorName}>{feed.user?.nickname || '钓友'}</Text>
            <Text style={styles.time}>{formatRelativeTime(feed.createdAt)} · {feed.location || ''}</Text>
          </View>
        </TouchableOpacity>

        <Text style={styles.content}>{feed.content}</Text>
        {feed.images?.[0] ? <Image source={{ uri: feed.images[0] }} style={styles.image} /> : null}

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.action}
            onPress={() => toggleLike.mutate({ id: feed.id, liked: !!feed.liked })}
            activeOpacity={0.6}
          >
            <Text style={[styles.actionIcon, feed.liked && { color: '#c0392b' }]}>{feed.liked ? '❤' : '♡'}</Text>
            <Text style={styles.actionCount}>{feed.likesCount}</Text>
          </TouchableOpacity>
        </View>

        {/* Comments */}
        <View style={styles.sectionTitleRow}>
          <Text style={styles.sectionTitle}>评论 {comments.data?.length ? `(${comments.data.length})` : ''}</Text>
        </View>
        <QueryState isLoading={comments.isLoading} isError={comments.isError} refetch={() => comments.refetch()} empty={!(comments.data && comments.data.length)} emptyText="还没有评论，来说点什么" minHeight={80}>
          {comments.data!.map((c) => (
            <View key={c.id} style={styles.comment}>
              <View style={styles.commentAvatar} />
              <View style={{ flex: 1 }}>
                <Text style={styles.commentAuthor}>{c.user?.nickname || '钓友'}</Text>
                <Text style={styles.commentContent}>{c.content}</Text>
                <Text style={styles.commentTime}>{formatRelativeTime(c.createdAt)}</Text>
              </View>
            </View>
          ))}
        </QueryState>
      </ScrollView>

      {/* Compose bar */}
      <View style={styles.composeBar}>
        <TextInput value={draft} onChangeText={setDraft} placeholder="写下你的评论…" style={styles.composeInput} placeholderTextColor={colors.muted} />
        <TouchableOpacity style={[styles.sendBtn, !draft.trim() && { opacity: 0.5 }]} onPress={submitComment} disabled={!draft.trim() || addComment.isPending}>
          <Text style={styles.sendText}>{addComment.isPending ? '…' : '发送'}</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.bg },
  container: { flex: 1, paddingHorizontal: spacing.screenPadding },
  authorRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.accentSoft, borderWidth: 1, borderColor: colors.border },
  authorName: { fontSize: fontSize.body, fontWeight: '600', color: colors.fg },
  time: { fontSize: fontSize.tiny, color: colors.muted, marginTop: 2 },
  content: { fontSize: fontSize.body, color: colors.fg, lineHeight: 22 },
  image: { width: '100%', height: 200, borderRadius: 12, marginTop: 10, backgroundColor: colors.accentSoft },
  actions: { flexDirection: 'row', gap: 20, marginTop: 14, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: colors.border },
  action: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  actionIcon: { fontSize: 17, color: colors.muted },
  actionCount: { fontSize: fontSize.small, color: colors.muted },
  sectionTitleRow: { marginTop: 16, marginBottom: 8 },
  sectionTitle: { fontSize: fontSize.h3, fontWeight: '600', color: colors.fg },
  comment: { flexDirection: 'row', gap: 10, paddingVertical: 10, borderTopWidth: 1, borderTopColor: colors.border },
  commentAvatar: { width: 30, height: 30, borderRadius: 15, backgroundColor: colors.accentSoft, borderWidth: 1, borderColor: colors.border },
  commentAuthor: { fontSize: fontSize.small, fontWeight: '600', color: colors.fg },
  commentContent: { fontSize: fontSize.body, color: colors.fg, marginTop: 2, lineHeight: 20 },
  commentTime: { fontSize: fontSize.tiny, color: colors.muted, marginTop: 3 },
  empty: { fontSize: fontSize.body, color: colors.muted, marginTop: 20, textAlign: 'center' },
  composeBar: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: spacing.screenPadding, paddingVertical: 10,
    borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.surface,
  },
  composeInput: {
    flex: 1, borderWidth: 1, borderColor: colors.border, borderRadius: radius.pill,
    paddingHorizontal: 16, paddingVertical: 9, fontSize: fontSize.body, color: colors.fg,
  },
  sendBtn: { paddingHorizontal: 18, paddingVertical: 10, borderRadius: radius.pill, backgroundColor: colors.accent },
  sendText: { color: '#fff', fontSize: fontSize.body, fontWeight: '600' },
});

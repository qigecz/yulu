import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, Image, ScrollView, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, radius } from '@yulu/ui';
import { formatRelativeTime } from '@yulu/shared';
import { useQueryClient } from '@tanstack/react-query';
import type { Feed, PostComment } from '@yulu/shared';
import { useFeedComments, useAddComment, useToggleFeedLike, useToggleFavorite } from '../hooks/queries';
import { useUIStore } from '../store/ui';
import { USE_MOCK } from '../config';
import { mockPostComments } from '../mock/data';

/** Split text on #话题# markers into styled segments. */
function TopicText({ text }: { text: string }) {
  const parts = useMemo(() => text.split(/(#[^#]+#)/g), [text]);
  return (
    <Text style={styles.postText}>
      {parts.map((p, i) =>
        p.startsWith('#') && p.endsWith('#') && p.length > 2 ? (
          <Text key={i} style={styles.topic}>{p}</Text>
        ) : (
          <Text key={i}>{p}</Text>
        ),
      )}
    </Text>
  );
}

export function FeedDetailScreen() {
  const feedId = useUIStore((s) => s.feedId);
  const close = useUIStore((s) => s.closeOverlay);
  const openUser = useUIStore((s) => s.openUser);
  const openSpotDetail = useUIStore((s) => s.openSpotDetail);
  const openRouteDetail = useUIStore((s) => s.openRouteDetail);
  const qc = useQueryClient();
  const feed = qc.getQueryData<Feed[]>(['feeds'])?.find((f) => f.id === feedId) ?? null;

  const apiComments = useFeedComments(feedId);
  const addComment = useAddComment();
  const toggleLike = useToggleFeedLike();
  const toggleFavorite = useToggleFavorite();
  const [draft, setDraft] = useState('');
  const [followed, setFollowed] = useState(false);
  const [commentLikes, setCommentLikes] = useState<Record<string, boolean>>({});
  const [localComments, setLocalComments] = useState<PostComment[]>([]);

  // In mock mode use the prototype comments; else real API data.
  const comments: PostComment[] = useMemo(() => {
    const mine = localComments;
    if (!USE_MOCK) {
      return [
        ...mine,
        ...(apiComments.data ?? []).map((c) => ({
          id: c.id,
          feedId: feedId ?? '',
          user: { id: c.userId, nickname: c.user?.nickname ?? '钓友' },
          content: c.content,
          likesCount: 0,
          createdAt: c.createdAt,
        })),
      ];
    }
    return [...mockPostComments.filter((c) => c.feedId === feedId), ...mine];
  }, [USE_MOCK, apiComments.data, feedId, localComments]);

  const submitComment = async () => {
    const text = draft.trim();
    if (!text || !feedId) return;
    setDraft('');
    if (USE_MOCK) {
      setLocalComments((list) => [
        ...list,
        {
          id: `mine-${list.length}`,
          feedId,
          user: { id: 'me', nickname: '我' },
          content: text,
          likesCount: 0,
          createdAt: new Date().toISOString(),
        },
      ]);
      return;
    }
    try {
      await addComment.mutateAsync({ targetType: 'feed', targetId: feedId, content: text });
    } catch {
      setDraft(text);
    }
  };

  if (!feed) {
    return (
      <View style={styles.flex}>
        <HeaderBar title="动态详情" onClose={close} />
        <Text style={styles.empty}>该动态暂不可用。</Text>
      </View>
    );
  }

  const photos = feed.images?.length
    ? feed.images
    : feed.photoLabels ?? [];

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.flex} contentContainerStyle={{ paddingBottom: 20 }} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <HeaderBar title="动态详情" onClose={close} />

        {/* Author row */}
        <View style={styles.authorRow}>
          <TouchableOpacity onPress={() => openUser(feed.userId)} activeOpacity={0.7}>
            <View style={styles.avatar} />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <View style={styles.auNameRow}>
              <Text style={styles.auName}>{feed.user?.nickname || '钓友'}</Text>
              {feed.authorBadge && (
                <View style={styles.auBadge}><Text style={styles.auBadgeT}>{feed.authorBadge}</Text></View>
              )}
            </View>
            <Text style={styles.auMeta}>
              {formatRelativeTime(feed.createdAt)}
              {feed.authorFollowers != null && ` · 关注者 ${feed.authorFollowers.toLocaleString()}`}
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.auFollow, followed && styles.auFollowOn]}
            onPress={() => setFollowed((v) => !v)}
            activeOpacity={0.7}
          >
            <Text style={[styles.auFollowT, followed && styles.auFollowTOn]}>{followed ? '已关注' : '+ 关注'}</Text>
          </TouchableOpacity>
        </View>

        {/* Post text */}
        <View style={{ paddingHorizontal: spacing.screenPadding }}>
          <TopicText text={feed.content} />
          {feed.locationDetail && (
            <View style={styles.postLoc}>
              <Ionicons name="location-outline" size={12} color={colors.muted} />
              <Text style={styles.postLocT}>{feed.locationDetail}</Text>
            </View>
          )}
        </View>

        {/* Photo grid */}
        {photos.length > 0 && (
          <View style={styles.photoGrid}>
            {photos.slice(0, 3).map((p, i) =>
              feed.images?.length ? (
                <Image key={i} source={{ uri: p }} style={styles.photo} />
              ) : (
                <View key={i} style={styles.photo}><Text style={styles.photoLabel}>{p}</Text></View>
              ),
            )}
          </View>
        )}

        {/* Catch stats */}
        {feed.catchStats && (
          <View style={styles.catchStrip}>
            <View style={styles.catchChip}>
              <View style={styles.ccIcon}><Ionicons name="fish-outline" size={16} color={colors.accent} /></View>
              <View>
                <Text style={styles.ccV}>{feed.catchStats.fish ?? '—'}</Text>
                <Text style={styles.ccL}>总渔获</Text>
              </View>
            </View>
            <View style={styles.catchChip}>
              <View style={styles.ccIcon}><Ionicons name="resize-outline" size={16} color={colors.accent} /></View>
              <View>
                <Text style={styles.ccV}>{feed.catchStats.maxLenCm != null ? `${feed.catchStats.maxLenCm} cm` : '—'}</Text>
                <Text style={styles.ccL}>最大体长</Text>
              </View>
            </View>
            <View style={styles.catchChip}>
              <View style={styles.ccIcon}><Ionicons name="time-outline" size={16} color={colors.accent} /></View>
              <View>
                <Text style={styles.ccV}>{feed.catchStats.hours != null ? `${feed.catchStats.hours} h` : '—'}</Text>
                <Text style={styles.ccL}>作钓时长</Text>
              </View>
            </View>
          </View>
        )}

        {/* Linked cards */}
        {(feed.spot || feed.linkedRoute) && (
          <View style={styles.pad}>
            <Text style={styles.sectionLabel}>关联内容</Text>
            <View style={styles.card}>
              {feed.spot && (
                <TouchableOpacity style={styles.linkCard} onPress={() => openSpotDetail(feed.spot!.id)} activeOpacity={0.7}>
                  <View style={styles.lkIcon}><Ionicons name="location-outline" size={20} color={colors.accent} /></View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.lkName}>{feed.spot.name}</Text>
                    <Text style={styles.lkDesc}>本次作钓钓点</Text>
                  </View>
                  <Text style={styles.lkCta}>查看 →</Text>
                </TouchableOpacity>
              )}
              {feed.linkedRoute && (
                <TouchableOpacity style={[styles.linkCard, styles.linkCardBorder]} onPress={() => openRouteDetail(feed.linkedRoute!.id)} activeOpacity={0.7}>
                  <View style={styles.lkIcon}><Ionicons name="layers-outline" size={20} color={colors.accent} /></View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.lkName}>{feed.linkedRoute.name}</Text>
                    <Text style={styles.lkDesc}>
                      {feed.linkedRoute.spotsCount} 坑点 · {feed.linkedRoute.totalDistance}km · 本帖已附标点坐标
                    </Text>
                  </View>
                  <Text style={styles.lkCta}>下载 →</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {/* Action row */}
        <View style={styles.actionRowWrap}>
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.actionItem, feed.liked && styles.actionItemOn]}
              onPress={() => toggleLike.mutate({ id: feed.id, liked: !!feed.liked })}
              activeOpacity={0.7}
            >
              <Ionicons name={feed.liked ? 'heart' : 'heart-outline'} size={18} color={feed.liked ? colors.accent : colors.muted} />
              <Text style={[styles.actionNum, feed.liked && { color: colors.accent }]}>
                {feed.likesCount + (feed.liked ? 1 : 0)}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionItem} onPress={() => {}} activeOpacity={0.7}>
              <Ionicons name="chatbubble-outline" size={18} color={colors.muted} />
              <Text style={styles.actionNum}>{feed.commentsCount ?? comments.length}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionItem, feed.favorited && styles.actionItemOn]}
              onPress={() => toggleFavorite.mutate({ type: 'feed', id: feed.id, favorited: !!feed.favorited })}
              activeOpacity={0.7}
            >
              <Ionicons name={feed.favorited ? 'star' : 'star-outline'} size={18} color={feed.favorited ? colors.accent : colors.muted} />
              <Text style={[styles.actionNum, feed.favorited && { color: colors.accent }]}>
                {89 + (feed.favorited ? 1 : 0)}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionItem} onPress={() => {}} activeOpacity={0.7}>
              <Ionicons name="share-social-outline" size={18} color={colors.muted} />
              <Text style={styles.actionNum}>{feed.sharesCount ?? 12}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Comments */}
        <View style={styles.pad}>
          <View style={styles.sectionLabelRow}>
            <Text style={styles.sectionLabel}>热门评论</Text>
            <Text style={styles.more}>全部 {Math.max(feed.commentsCount ?? 0, comments.length)} 条 →</Text>
          </View>
          <View style={styles.card}>
            {comments.map((c, i) => (
              <View key={c.id} style={[styles.commentItem, i > 0 && styles.commentBorder]}>
                <View style={styles.commentAvatar} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.cName}>{c.user.nickname}</Text>
                  <Text style={styles.cText}>{c.content}</Text>
                  <View style={styles.cFoot}>
                    <Text style={styles.cTime}>{formatRelativeTime(c.createdAt)}</Text>
                    <TouchableOpacity
                      style={styles.cLike}
                      onPress={() => setCommentLikes((m) => ({ ...m, [c.id]: !m[c.id] }))}
                      activeOpacity={0.7}
                    >
                      <Ionicons
                        name={commentLikes[c.id] ? 'heart' : 'heart-outline'}
                        size={12}
                        color={commentLikes[c.id] ? colors.accent : colors.muted}
                      />
                      <Text style={[styles.cLikeT, commentLikes[c.id] && { color: colors.accent }]}>
                        {c.likesCount + (commentLikes[c.id] ? 1 : 0)}
                      </Text>
                    </TouchableOpacity>
                    <Text style={styles.cTime}>回复</Text>
                  </View>
                  {c.reply && (
                    <View style={styles.cReply}>
                      <Text style={styles.cReplyText}>
                        <Text style={styles.cReplyName}>{feed.user?.nickname}：</Text>
                        {c.reply.content}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            ))}
            {comments.length === 0 && <Text style={styles.empty}>还没有评论，来说点什么</Text>}
          </View>
          <Text style={styles.metaCenter}>— 显示前 {comments.length} 条 · 查看全部 {Math.max(feed.commentsCount ?? 0, comments.length)} 条评论 —</Text>
        </View>
      </ScrollView>

      {/* Comment input bar */}
      <View style={styles.commentbar}>
        <View style={styles.cInputWrap}>
          <Ionicons name="search" size={15} color={colors.muted} style={{ marginRight: 6 }} />
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder="说点什么… 文明发言，理性交流"
            placeholderTextColor={colors.muted}
            maxLength={120}
            style={styles.cInput}
            onSubmitEditing={submitComment}
          />
        </View>
        <TouchableOpacity style={[styles.send, !draft.trim() && { opacity: 0.5 }]} onPress={submitComment} disabled={!draft.trim()}>
          <Text style={styles.sendT}>发送</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

function HeaderBar({ title, onClose }: { title: string; onClose: () => void }) {
  return (
    <View style={styles.header}>
      <TouchableOpacity style={styles.iconBtn} onPress={onClose} activeOpacity={0.7}>
        <Ionicons name="chevron-back" size={20} color={colors.fg} />
      </TouchableOpacity>
      <Text style={styles.hTitle}>{title}</Text>
      <TouchableOpacity style={styles.iconBtn} onPress={onClose} activeOpacity={0.7}>
        <Ionicons name="ellipsis-horizontal" size={20} color={colors.fg} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.bg },
  pad: { paddingHorizontal: spacing.screenPadding },
  empty: { fontSize: 13, color: colors.muted, textAlign: 'center', paddingVertical: 20 },

  /* header */
  header: { paddingHorizontal: spacing.screenPadding, paddingVertical: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  iconBtn: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: colors.surface,
    borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center',
  },
  hTitle: { fontSize: 18, fontWeight: '600', color: colors.fg, fontFamily: 'Georgia' },

  /* author */
  authorRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: spacing.screenPadding, paddingBottom: 14,
  },
  avatar: { width: 46, height: 46, borderRadius: 23, backgroundColor: colors.accentSoft, borderWidth: 1, borderColor: colors.border },
  auNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  auName: { fontSize: 15, fontWeight: '600', color: colors.fg },
  auBadge: { backgroundColor: colors.accentSoft, paddingHorizontal: 7, paddingVertical: 2, borderRadius: 5 },
  auBadgeT: { fontSize: 9, color: colors.accent, letterSpacing: 0.5 },
  auMeta: { fontSize: 12, color: colors.muted, marginTop: 2 },
  auFollow: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 999, borderWidth: 1, borderColor: colors.accent },
  auFollowT: { color: colors.accent, fontSize: 12, fontWeight: '600' },
  auFollowOn: { borderColor: colors.border, backgroundColor: 'rgba(26,36,32,0.06)' },
  auFollowTOn: { color: colors.muted },

  /* post */
  postText: { fontSize: 15, lineHeight: 25, color: colors.fg },
  topic: { color: colors.accent, fontWeight: '500' },
  postLoc: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 10 },
  postLocT: { fontSize: 12, color: colors.muted },

  photoGrid: { flexDirection: 'row', gap: 6, marginHorizontal: spacing.screenPadding, marginTop: 14 },
  photo: {
    flex: 1, aspectRatio: 1, borderRadius: 12, backgroundColor: colors.accentSoft,
    borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center',
  },
  photoLabel: { fontSize: 9, color: colors.muted },

  /* catch */
  catchStrip: { flexDirection: 'row', gap: 10, marginHorizontal: spacing.screenPadding, marginTop: 14 },
  catchChip: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 13, paddingHorizontal: 12, paddingVertical: 10,
  },
  ccIcon: { width: 30, height: 30, borderRadius: 10, backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center' },
  ccV: { fontSize: 13, fontWeight: '600', color: colors.fg },
  ccL: { fontSize: 10, color: colors.muted, marginTop: 1 },

  /* links */
  sectionLabel: { fontSize: 16, fontWeight: '600', color: colors.fg, marginVertical: 12, letterSpacing: -0.2 },
  sectionLabelRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginVertical: 12 },
  card: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, padding: 16 },
  linkCard: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  linkCardBorder: { borderTopWidth: 1, borderTopColor: colors.border },
  lkIcon: { width: 44, height: 44, borderRadius: 14, backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center' },
  lkName: { fontSize: 14, fontWeight: '600', color: colors.fg },
  lkDesc: { fontSize: 12, color: colors.muted, marginTop: 2 },
  lkCta: { fontSize: 12, color: colors.accent, fontWeight: '500' },

  /* actions */
  actionRowWrap: { marginHorizontal: spacing.screenPadding, marginTop: 16 },
  actionRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 14, padding: 6,
  },
  actionItem: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 8, borderRadius: 9 },
  actionItemOn: { backgroundColor: colors.accentSoft },
  actionNum: { fontSize: 12, color: colors.muted },

  /* comments */
  commentItem: { flexDirection: 'row', gap: 10, paddingVertical: 12 },
  commentBorder: { borderTopWidth: 1, borderTopColor: colors.border },
  commentAvatar: { width: 34, height: 34, borderRadius: 17, backgroundColor: colors.accentSoft, borderWidth: 1, borderColor: colors.border },
  cName: { fontSize: 13, fontWeight: '600', color: colors.fg },
  cText: { fontSize: 13, color: colors.fg, opacity: 0.85, marginTop: 3, lineHeight: 20 },
  cFoot: { flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: 6 },
  cTime: { fontSize: 11, color: colors.muted },
  cLike: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  cLikeT: { fontSize: 11, color: colors.muted },
  cReply: { marginTop: 8, padding: 10, backgroundColor: 'rgba(26,36,32,0.06)', borderRadius: 10 },
  cReplyText: { fontSize: 12, lineHeight: 18, color: colors.fg },
  cReplyName: { color: colors.accent, fontWeight: '600' },
  metaCenter: { fontSize: 11, color: colors.muted, textAlign: 'center', paddingVertical: 12 },
  more: { fontSize: 13, color: colors.accent, fontWeight: '500' },

  /* comment bar */
  commentbar: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 16, paddingVertical: 10,
    borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.surface,
  },
  cInputWrap: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.bg, borderWidth: 1, borderColor: colors.border, borderRadius: 999,
    paddingHorizontal: 14, paddingVertical: 4, minHeight: 38,
  },
  cInput: { flex: 1, fontSize: 13, color: colors.fg, paddingVertical: 8 },
  send: { paddingHorizontal: 18, paddingVertical: 9, borderRadius: 999, backgroundColor: colors.accent },
  sendT: { color: '#fff', fontSize: 13, fontWeight: '600' },
});

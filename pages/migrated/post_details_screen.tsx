import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useResponsiveStyleSheet } from '@helper/responsiveStyleSheet';
import { C, FONT } from './theme';
import { postsApi, PostComment } from '../../api/posts';
import logger from '@helper/logger';

interface PostUser {
  id?: number;
  firstName?: string;
  lastName?: string;
  profileImage?: string;
}

interface PostData {
  id?: number;
  content?: string;
  images?: string[];
  canEdit?: boolean;
  users?: PostUser;
  likesCount?: number;
  commentsCount?: number;
  isLiked?: boolean;
  isBookmarked?: boolean;
  createdAt?: string;
}

export default function PostDetailsScreen(props: any) {
  const postData: PostData | undefined = props.route?.params?.postData;
  const isFromLink: boolean = props.route?.params?.isFromLink ?? false;

  const [likeChange, setLikeChange] = useState(0);
  const [bookMarkChange, setBookMarkChange] = useState(0);
  const [heartVisible, setHeartVisible] = useState(false);
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const [isLiked, setIsLiked] = useState(postData?.isLiked ?? false);
  const [isBookmarked, setIsBookmarked] = useState(postData?.isBookmarked ?? false);

  const [comments, setComments] = useState<PostComment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [postingComment, setPostingComment] = useState(false);
  const [commentsCount, setCommentsCount] = useState(postData?.commentsCount ?? 0);
  const commentInputRef = useRef<TextInput>(null);

  const loadComments = useCallback(async () => {
    if (!postData?.id) return;
    setCommentsLoading(true);
    try {
      const res = await postsApi.getComments(postData.id, 1);
      setComments(res.data.data ?? []);
    } catch (e) {
      logger.error('Error fetching comments', e);
    } finally {
      setCommentsLoading(false);
    }
  }, [postData?.id]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  if (!postData) {
    return (
      <View style={s.container}>
        <View style={s.appBar}>
          <TouchableOpacity onPress={() => props.navigation?.goBack()}>
            <Ionicons name="chevron-back" size={24} color={C.textPrimary} />
          </TouchableOpacity>
          <View style={{ width: 24 }} />
        </View>
        <View style={s.emptyContainer}>
          <Text style={s.emptyText}>No post data available</Text>
        </View>
      </View>
    );
  }

  const user = postData.users;

  const toggleLike = () => {
    setIsLiked((prev) => !prev);
    setLikeChange((prev) => prev + 1);
    if (postData.id) {
      postsApi.like(postData.id).catch(() => {
        setIsLiked((prev) => !prev);
        setLikeChange((prev) => prev - 1);
      });
    }
  };

  const toggleBookmark = () => {
    setIsBookmarked((prev) => !prev);
    setBookMarkChange((prev) => prev + 1);
    if (postData.id) {
      postsApi.bookmark(postData.id).catch(() => {
        setIsBookmarked((prev) => !prev);
        setBookMarkChange((prev) => prev - 1);
      });
    }
  };

  const focusCommentInput = () => {
    commentInputRef.current?.focus();
  };

  const submitComment = async () => {
    const text = commentText.trim();
    if (!text || !postData.id || postingComment) return;
    setPostingComment(true);
    try {
      await postsApi.saveComment(postData.id, text);
      setCommentText('');
      setCommentsCount((prev) => prev + 1);
      await loadComments();
    } catch (e) {
      logger.error('Error posting comment', e);
    } finally {
      setPostingComment(false);
    }
  };

  return (
    <KeyboardAvoidingView style={s.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
      <View style={s.appBar}>
        <TouchableOpacity onPress={() => props.navigation?.goBack()}>
          <Ionicons name="chevron-back" size={28} color={C.textPrimary} />
        </TouchableOpacity>
        <View style={{ width: 24 }} />
      </View>
      <ScrollView contentContainerStyle={s.scrollContent}>
        <View style={s.postCard}>
          <View style={s.postHeader}>
            <TouchableOpacity
              style={s.avatarRow}
              activeOpacity={0.7}
              onPress={() => {
                if (!user?.id) return;
                props.navigation?.navigate('MigratedOtherUserProfile', { userDetails: user });
              }}
            >
              <View style={s.avatarPlaceholder}>
                {user?.profileImage ? (
                  <Image source={{ uri: user.profileImage }} style={s.avatarSmall} />
                ) : (
                  <Ionicons name="person" size={18} color={C.gray30} />
                )}
              </View>
              <View style={s.userInfo}>
                <Text style={s.userName}>{user?.firstName ?? ''} {user?.lastName ?? ''}</Text>
                {postData.createdAt && <Text style={s.postTime}>{postData.createdAt}</Text>}
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={s.moreBtn}>
              <Ionicons name="ellipsis-horizontal" size={20} color={C.gray40} />
            </TouchableOpacity>
          </View>
          {postData.content ? <Text style={s.postContent}>{postData.content}</Text> : null}
          {postData.images && postData.images.length > 0 ? (
            <View style={s.postImages}>
              {postData.images.map((img, i) => (
                <Image key={i} source={{ uri: img }} style={[s.postImage, postData.images!.length === 1 && s.postImageFull]} />
              ))}
            </View>
          ) : null}
          <View style={s.postFooter}>
            <TouchableOpacity style={s.actionBtn} onPress={toggleLike}>
              <Ionicons name={isLiked ? 'heart' : 'heart-outline'} size={22} color={isLiked ? C.destructive : C.gray30} />
              <Text style={[s.actionText, isLiked && s.actionTextActive]}>{(postData.likesCount ?? 0) + (isLiked ? 1 : 0)}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.actionBtn} onPress={focusCommentInput}>
              <Ionicons name="chatbubble-outline" size={22} color={C.gray30} />
              <Text style={s.actionText}>{commentsCount}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.actionBtn} onPress={toggleBookmark}>
              <Ionicons name={isBookmarked ? 'bookmark' : 'bookmark-outline'} size={22} color={isBookmarked ? C.orange : C.gray30} />
            </TouchableOpacity>
            <TouchableOpacity style={s.actionBtn}>
              <Ionicons name="share-outline" size={22} color={C.gray30} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={s.commentsSection}>
          <Text style={s.commentsTitle}>Comments</Text>
          {commentsLoading ? (
            <ActivityIndicator size="small" color={C.orange} style={{ marginVertical: 16 }} />
          ) : comments.length > 0 ? (
            comments.map((c) => (
              <View key={c.id} style={s.commentRow}>
                <View style={s.avatarPlaceholder}>
                  {c.users?.profile_image ? (
                    <Image source={{ uri: c.users.profile_image }} style={s.avatarSmall} />
                  ) : (
                    <Ionicons name="person" size={16} color={C.gray30} />
                  )}
                </View>
                <View style={s.commentBody}>
                  <Text style={s.commentUserName}>
                    {c.users?.first_name ?? ''} {c.users?.last_name ?? ''}
                  </Text>
                  <Text style={s.commentText}>{c.comment}</Text>
                  {c.created_at ? <Text style={s.commentTime}>{c.created_at}</Text> : null}
                </View>
              </View>
            ))
          ) : (
            <Text style={s.noCommentsText}>Be the first to comment</Text>
          )}
        </View>
      </ScrollView>

      <View style={s.commentInputBar}>
        <TextInput
          ref={commentInputRef}
          style={s.commentInput}
          placeholder="Write a comment..."
          placeholderTextColor={C.gray50}
          value={commentText}
          onChangeText={setCommentText}
          multiline
        />
        <TouchableOpacity
          style={[s.sendBtn, (!commentText.trim() || postingComment) && s.sendBtnDisabled]}
          onPress={submitComment}
          disabled={!commentText.trim() || postingComment}
        >
          {postingComment ? (
            <ActivityIndicator size="small" color={C.white} />
          ) : (
            <Ionicons name="send" size={18} color={C.white} />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  appBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 48, paddingBottom: 12, backgroundColor: C.surface },
  scrollContent: { padding: 6, paddingBottom: 24 },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { fontSize: 16, fontFamily: FONT.medium, color: C.gray40 },
  postCard: { backgroundColor: C.surface, borderRadius: 16, padding: 16, marginBottom: 12 },
  postHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  avatarRow: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  userInfo: { marginLeft: 12, flex: 1 },
  userName: { fontSize: 14, fontFamily: FONT.semiBold, color: C.white },
  postTime: { fontSize: 12, color: C.gray50, marginTop: 2 },
  moreBtn: { padding: 4 },
  postContent: { fontSize: 15, color: C.gray50, lineHeight: 22, marginBottom: 12 },
  postImages: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 12 },
  postImage: { width: '48%', height: 180, borderRadius: 12, marginBottom: 4, marginRight: 8, backgroundColor: C.surfaceLight },
  postImageFull: { width: '100%', marginRight: 0 },
  postFooter: { flexDirection: 'row', alignItems: 'center', borderTopWidth: 0.5, borderTopColor: C.border, paddingTop: 12, marginTop: 4 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', marginRight: 20 },
  actionText: { fontSize: 13, color: C.gray40, marginLeft: 6 },
  actionTextActive: { color: C.destructive },
  avatarPlaceholder: { width: 36, height: 36, borderRadius: 18, backgroundColor: C.surfaceLight, justifyContent: 'center', alignItems: 'center' },
  avatarSmall: { width: 36, height: 36, borderRadius: 18 },
  commentsSection: { backgroundColor: C.surface, borderRadius: 16, padding: 16, marginBottom: 12 },
  commentsTitle: { fontSize: 15, fontFamily: FONT.semiBold, color: C.white, marginBottom: 12 },
  commentRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 14 },
  commentBody: { marginLeft: 10, flex: 1 },
  commentUserName: { fontSize: 13, fontFamily: FONT.semiBold, color: C.white },
  commentText: { fontSize: 13, color: C.gray50, marginTop: 2, lineHeight: 18 },
  commentTime: { fontSize: 11, color: C.gray50, marginTop: 4 },
  noCommentsText: { fontSize: 13, color: C.gray50, textAlign: 'center', paddingVertical: 12 },
  commentInputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: C.surface,
    borderTopWidth: 0.5,
    borderTopColor: C.border,
    gap: 8,
  },
  commentInput: {
    flex: 1,
    backgroundColor: C.surfaceLight,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: C.white,
    fontFamily: FONT.regular,
    fontSize: 14,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: C.border,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: C.brand5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnDisabled: { opacity: 0.5 },
});

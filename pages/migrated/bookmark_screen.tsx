import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useResponsiveStyleSheet } from '@helper/responsiveStyleSheet';
import { C, FONT } from './theme';
import { postsApi } from '../../api/posts';
import logger from '@helper/logger';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface BookmarkPost {
  id: number;
  content?: string;
  postImage?: string;
  users?: { id?: number; displayName?: string; profileImage?: string };
  likesCount?: number;
  commentsCount?: number;
  isLiked?: boolean;
  createdAt?: string;
}

export default function BookmarkScreen({ navigation }: any) {

  const [postList, setPostList] = useState<BookmarkPost[]>([]);
  const [page, setPage] = useState(1);
  const [numPage, setNumPage] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    getPostList(1);
  }, []);

  const getPostList = useCallback(async (pageNum: number = 1) => {
    setLoading(true);
    try {
      const res = await postsApi.getBookmarks(pageNum);
      setNumPage(res.data.pagination?.totalPages ?? 1);
      const list: BookmarkPost[] = (res.data.data ?? []).map((p: any) => ({
        id: p.id,
        content: p.description,
        postImage: p.posting_media_array?.[0]?.media_url ?? '',
        users: p.users ? { id: p.users.id, displayName: p.users.display_name, profileImage: p.users.profile_image } : undefined,
        likesCount: p.posting_like_count,
        commentsCount: p.posting_comment_count,
        isLiked: p.is_liked,
        createdAt: p.created_at,
      }));
      setPostList((prev) => (pageNum === 1 ? list : [...prev, ...list]));
    } catch (e) {
      logger.error('Error fetching bookmarks:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const onRefresh = () => {
    setPage(1);
    getPostList(1);
  };

  const toggleLike = (item: BookmarkPost) => {
    const wasLiked = !!item.isLiked;
    setPostList((prev) =>
      prev.map((p) => (p.id === item.id ? { ...p, isLiked: !wasLiked, likesCount: (p.likesCount || 0) + (wasLiked ? -1 : 1) } : p))
    );
    postsApi.like(item.id).catch((e) => {
      logger.error('Error toggling like', e);
      setPostList((prev) => prev.map((p) => (p.id === item.id ? { ...p, isLiked: wasLiked, likesCount: item.likesCount } : p)));
    });
  };

  const unbookmark = (item: BookmarkPost) => {
    setPostList((prev) => prev.filter((p) => p.id !== item.id));
    postsApi.bookmark(item.id).catch((e) => {
      logger.error('Error removing bookmark', e);
      getPostList(1);
    });
  };

  const openDetail = (item: BookmarkPost) => {
    navigation.navigate('MigratedPostDetails', {
      postData: {
        id: item.id,
        content: item.content,
        images: item.postImage ? [item.postImage] : [],
        users: {
          id: item.users?.id,
          firstName: item.users?.displayName || 'User',
          lastName: '',
          profileImage: item.users?.profileImage,
        },
        likesCount: item.likesCount,
        commentsCount: item.commentsCount,
        isLiked: item.isLiked,
        isBookmarked: true,
        createdAt: item.createdAt,
      },
    });
  };

  const renderPostCard = (item: BookmarkPost, index: number) => {
    return (
      <TouchableOpacity key={index} style={styles_local.postCard} activeOpacity={0.85} onPress={() => openDetail(item)}>
        {/* User header */}
        <View style={styles_local.postHeader}>
          {item.users?.profileImage ? (
            <Image source={{ uri: item.users.profileImage }} style={styles_local.avatar} />
          ) : (
            <View style={styles_local.avatar}>
              <Ionicons name="person" size={20} color={C.gray40} />
            </View>
          )}
          <View style={styles_local.postHeaderInfo}>
            <Text style={styles_local.postUserName}>{item.users?.displayName ?? 'User'}</Text>
            <Text style={styles_local.postTime}>{item.createdAt ?? ''}</Text>
          </View>
        </View>

        {/* Description */}
        {item.content ? (
          <Text style={styles_local.postDescription}>{item.content}</Text>
        ) : null}

        {/* Image */}
        {item.postImage ? (
          <View style={styles_local.postImageWrap}>
            <Image source={{ uri: item.postImage }} style={styles_local.postImagePlaceholder} resizeMode="cover" />
          </View>
        ) : null}

        {/* Actions */}
        <View style={styles_local.postActions}>
          <TouchableOpacity style={styles_local.actionBtn} activeOpacity={0.7} onPress={() => toggleLike(item)}>
            <Ionicons name={item.isLiked ? 'heart' : 'heart-outline'} size={22} color={item.isLiked ? C.destructive : C.gray30} />
            <Text style={styles_local.actionCount}>{item.likesCount ?? 0}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles_local.actionBtn} activeOpacity={0.7} onPress={() => openDetail(item)}>
            <Ionicons name="chatbubble-outline" size={22} color={C.gray30} />
            <Text style={styles_local.actionCount}>{item.commentsCount ?? 0}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles_local.actionBtn} activeOpacity={0.7} onPress={() => unbookmark(item)}>
            <Ionicons name="bookmark" size={22} color={C.textPrimary} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles_local.container}>
      <View style={styles_local.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles_local.backBtn}>
          <Ionicons name="chevron-back" size={24} color={C.white} />
        </TouchableOpacity>
        <Text style={styles_local.headerTitle}>Bookmarks</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles_local.body}>
        {loading ? (
          <View style={styles_local.centerWrap}>
            <ActivityIndicator size="large" color={C.orange} />
          </View>
        ) : postList.length > 0 ? (
          <ScrollView
            ref={scrollRef}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingVertical: 8 }}
          >
            {postList.map((item, index) => renderPostCard(item, index))}
          </ScrollView>
        ) : (
          <View style={styles_local.centerWrap}>
            <Ionicons name="bookmark-outline" size={56} color={C.gray60} />
            <Text style={styles_local.emptyText}>No bookmarked posts</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles_local = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 14,
    backgroundColor: C.surface,
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontFamily: FONT.bold, color: C.white },
  body: { flex: 1 },
  centerWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  emptyText: { fontSize: 16, fontFamily: FONT.medium, color: C.gray40 },
  postCard: {
    backgroundColor: C.surface,
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 6,
    overflow: 'hidden',
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 10,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: C.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  postHeaderInfo: { flex: 1 },
  postUserName: { fontSize: 14, fontFamily: FONT.semiBold, color: C.white },
  postTime: { fontSize: 11, fontFamily: FONT.regular, color: C.gray40 },
  postDescription: {
    fontSize: 14,
    fontFamily: FONT.regular,
    color: C.gray50,
    paddingHorizontal: 12,
    paddingBottom: 8,
    lineHeight: 20,
  },
  postImageWrap: { marginHorizontal: 12, marginBottom: 8 },
  postImagePlaceholder: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    backgroundColor: C.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  postActions: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: C.border,
    gap: 24,
  },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  actionCount: { fontSize: 13, fontFamily: FONT.regular, color: C.gray30 },
});
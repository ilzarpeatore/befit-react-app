import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useResponsiveStyleSheet } from '@helper/responsiveStyleSheet';
import { C, FONT } from './theme';
import { postsApi } from '../../api/posts';
import { profileApi, UserSocialStats } from '../../api/profile';
import logger from '@helper/logger';

interface UserDetails {
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
  users?: { id?: number; firstName?: string; lastName?: string; profileImage?: string };
  likesCount?: number;
  commentsCount?: number;
  isLiked?: boolean;
  isBookmarked?: boolean;
  createdAt?: string;
}

export default function OtherUserProfileScreen(props: any) {
  const userDetails: UserDetails = props.route?.params?.userDetails ?? {};

  const [firstName, setFirstName] = useState(userDetails.firstName ?? '');
  const [lastName, setLastName] = useState(userDetails.lastName ?? '');
  const [profileImg, setProfileImg] = useState(userDetails.profileImage ?? '');
  const [postList, setPostList] = useState<PostData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [numPage, setNumPage] = useState(1);
  const [stats, setStats] = useState<UserSocialStats | null>(null);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    setFirstName(userDetails.firstName ?? '');
    setLastName(userDetails.lastName ?? '');
    setProfileImg(userDetails.profileImage ?? '');
    getPostList(1);
    getStats();
  }, [userDetails.id]);

  const getStats = useCallback(async () => {
    if (!userDetails.id) return;
    try {
      const res = await profileApi.getSocialStats(userDetails.id);
      setStats(res.data.data);
    } catch (e) {
      logger.error('Error fetching user social stats', e);
    }
  }, [userDetails.id]);

  const getPostList = useCallback(async (pageNum: number = 1) => {
    if (!userDetails.id) return;
    setIsLoading(true);
    try {
      const res = await postsApi.getList(pageNum, userDetails.id);
      setNumPage(res.data.pagination?.totalPages ?? 1);
      const list: PostData[] = (res.data.data ?? []).map((p: any) => ({
        id: p.id,
        content: p.description,
        images: p.posting_media_array?.map((m: any) => m.media_url) ?? [],
        canEdit: p.can_edit,
        likesCount: p.posting_like_count,
        commentsCount: p.posting_comment_count,
        isLiked: p.is_liked,
        isBookmarked: p.is_bookmark,
      }));
      setPostList((prev) => (pageNum === 1 ? list : [...prev, ...list]));
      setPage(pageNum);
    } catch (e) {
      logger.error('Error fetching user posts', e);
    } finally {
      setIsLoading(false);
    }
  }, [userDetails.id]);

  const toggleLike = (item: PostData) => {
    if (!item.id) return;
    const wasLiked = !!item.isLiked;
    setPostList((prev) =>
      prev.map((p) =>
        p.id === item.id
          ? { ...p, isLiked: !wasLiked, likesCount: (p.likesCount || 0) + (wasLiked ? -1 : 1) }
          : p
      )
    );
    postsApi.like(item.id).catch((e) => {
      logger.error('Error toggling like', e);
      setPostList((prev) =>
        prev.map((p) => (p.id === item.id ? { ...p, isLiked: wasLiked, likesCount: item.likesCount } : p))
      );
    });
  };

  const openPostDetail = (item: PostData) => {
    props.navigation?.navigate('MigratedPostDetails', {
      postData: {
        id: item.id,
        content: item.content,
        images: item.images ?? [],
        canEdit: item.canEdit,
        users: {
          id: userDetails.id,
          firstName,
          lastName,
          profileImage: profileImg,
        },
        likesCount: item.likesCount,
        commentsCount: item.commentsCount,
        isLiked: item.isLiked,
        isBookmarked: item.isBookmarked,
      },
    });
  };

  const renderPostItem = (item: PostData, index: number) => (
    <TouchableOpacity key={index} style={s.postCard} activeOpacity={0.85} onPress={() => openPostDetail(item)}>
      <View style={s.postHeader}>
        {profileImg ? (
          <Image source={{ uri: profileImg }} style={s.avatarPlaceholder} />
        ) : (
          <View style={s.avatarPlaceholder}>
            <Ionicons name="person" size={20} color={C.gray30} />
          </View>
        )}
        <View style={s.postHeaderInfo}>
          <Text style={s.postUserName}>{firstName} {lastName}</Text>
          <Text style={s.postTime}>Post</Text>
        </View>
      </View>
      {item.content ? <Text style={s.postContent}>{item.content}</Text> : null}
      {item.images && item.images.length > 0 ? (
        <View style={s.postImagesRow}>
          {item.images.map((img, i) => (
            <Image key={i} source={{ uri: img }} style={s.postImageThumb} />
          ))}
        </View>
      ) : null}
      <View style={s.postActions}>
        <TouchableOpacity style={s.postActionBtn} onPress={() => toggleLike(item)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name={item.isLiked ? 'heart' : 'heart-outline'} size={20} color={item.isLiked ? C.destructive : C.gray30} />
          <Text style={s.postActionText}>{item.likesCount ?? 0}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.postActionBtn} onPress={() => openPostDetail(item)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="chatbubble-outline" size={20} color={C.gray30} />
          <Text style={s.postActionText}>{item.commentsCount ?? 0}</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={s.container}>
      <View style={s.headerBg} />
      <ScrollView ref={scrollRef} style={s.scrollView}>
        <View style={s.headerBar}>
          <TouchableOpacity onPress={() => props.navigation?.goBack()}>
            <Ionicons name="chevron-back" size={24} color={C.white} />
          </TouchableOpacity>
          <Text style={s.headerBarTitle}>Profile</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={s.profileCard}>
          <View style={s.avatarContainer}>
            <View style={s.avatarLarge}>
              {profileImg ? (
                <Image source={{ uri: profileImg }} style={s.avatarImage} />
              ) : (
                <Ionicons name="person" size={40} color={C.gray30} />
              )}
            </View>
          </View>
          <Text style={s.profileName}>{firstName} {lastName}</Text>
          <View style={s.statsRow}>
            <View style={s.statItem}>
              <Text style={s.statValue}>{stats ? stats.workout_count : '-'}</Text>
              <Text style={s.statLabel}>Workouts</Text>
            </View>
            <View style={s.statDivider} />
            <View style={s.statItem}>
              <Text style={s.statValue}>{stats ? stats.posting_count : '-'}</Text>
              <Text style={s.statLabel}>Posts</Text>
            </View>
          </View>
        </View>
        <View style={s.postsSection}>
          {postList.length > 0 ? (
            postList.map((item, index) => renderPostItem(item, index))
          ) : !isLoading ? (
            <View style={s.emptyContainer}>
              <Ionicons name="document-text-outline" size={64} color={C.gray50} />
              <Text style={s.emptyText}>No posts yet</Text>
            </View>
          ) : null}
          {isLoading && <ActivityIndicator size="small" color={C.orange} style={{ marginVertical: 16 }} />}
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  headerBg: { position: 'absolute', top: 0, left: 0, right: 0, height: Dimensions.get('window').height * 0.3, backgroundColor: C.brand5 },
  scrollView: { flex: 1 },
  headerBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 48, paddingBottom: 12 },
  headerBarTitle: { fontSize: 18, fontFamily: FONT.bold, color: C.white },
  profileCard: { backgroundColor: C.surface, borderRadius: 16, marginTop: Dimensions.get('window').height * 0.15, paddingTop: 60, paddingBottom: 24, alignItems: 'center' },
  avatarContainer: { position: 'absolute', top: -48, alignSelf: 'center' },
  profileName: { fontSize: 20, fontFamily: FONT.bold, color: C.white, marginTop: 8 },
  statsRow: { flexDirection: 'row', alignItems: 'center', marginTop: 16 },
  statItem: { alignItems: 'center', paddingHorizontal: 24 },
  statValue: { fontSize: 18, fontFamily: FONT.bold, color: C.white },
  statLabel: { fontSize: 12, fontFamily: FONT.regular, color: C.gray40, marginTop: 2 },
  statDivider: { width: 1, height: 28, backgroundColor: C.border },
  postsSection: { paddingHorizontal: 6, paddingTop: 16, paddingBottom: 24 },
  postCard: { backgroundColor: C.surface, borderRadius: 16, padding: 16, marginBottom: 12 },
  postHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  postHeaderInfo: { marginLeft: 12, flex: 1 },
  postUserName: { fontSize: 14, fontFamily: FONT.semiBold, color: C.white },
  postTime: { fontSize: 12, color: C.gray40 },
  postContent: { fontSize: 14, color: C.gray50, marginBottom: 12, lineHeight: 20 },
  postImagesRow: { flexDirection: 'row', marginBottom: 12 },
  postImageThumb: { width: 80, height: 80, borderRadius: 8, marginRight: 8, backgroundColor: C.surfaceLight },
  postActions: { flexDirection: 'row', borderTopWidth: 0.5, borderTopColor: C.border, paddingTop: 12 },
  postActionBtn: { flexDirection: 'row', alignItems: 'center', marginRight: 24 },
  postActionText: { fontSize: 13, color: C.gray30, marginLeft: 6 },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 48 },
  emptyText: { fontSize: 16, fontFamily: FONT.medium, color: C.gray40, marginTop: 16 },
  avatarPlaceholder: { width: 40, height: 40, borderRadius: 20, backgroundColor: C.surfaceLight, justifyContent: 'center', alignItems: 'center' },
  avatarLarge: { width: 96, height: 96, borderRadius: 48, backgroundColor: C.surfaceLight, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  avatarImage: { width: 96, height: 96, borderRadius: 48 },
});

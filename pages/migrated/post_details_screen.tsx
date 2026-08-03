import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useResponsiveStyleSheet } from '@helper/responsiveStyleSheet';
import { C, FONT } from './theme';
import { postsApi } from '../../api/posts';

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

  return (
    <View style={s.container}>
      <View style={s.appBar}>
        <TouchableOpacity onPress={() => props.navigation?.goBack()}>
          <Ionicons name="chevron-back" size={28} color={C.textPrimary} />
        </TouchableOpacity>
        <View style={{ width: 24 }} />
      </View>
      <ScrollView contentContainerStyle={s.scrollContent}>
        <View style={s.postCard}>
          <View style={s.postHeader}>
            <View style={s.avatarRow}>
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
            </View>
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
            <TouchableOpacity style={s.actionBtn}>
              <Ionicons name="chatbubble-outline" size={22} color={C.gray30} />
              <Text style={s.actionText}>{postData.commentsCount ?? 0}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.actionBtn} onPress={toggleBookmark}>
              <Ionicons name={isBookmarked ? 'bookmark' : 'bookmark-outline'} size={22} color={isBookmarked ? C.orange : C.gray30} />
            </TouchableOpacity>
            <TouchableOpacity style={s.actionBtn}>
              <Ionicons name="share-outline" size={22} color={C.gray30} />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
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
});

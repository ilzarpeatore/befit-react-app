import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useResponsiveStyleSheet } from '@helper/responsiveStyleSheet';
import { C, FONT } from './theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function BookmarkScreen({ navigation }: any) {

  const [postList, setPostList] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [numPage, setNumPage] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);

  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    getPostList();
  };

  const getPostList = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      // const value = await getBookMarkPostsApi({ page });
      // setNumPage(value.pagination?.totalPages);
      // if (page === 1) setPostList([]);
      // const posts = value.data ?? [];
      // setPostList((prev) => [...prev, ...posts]);
    } catch (e) {
      console.log('Error:', e);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = () => {
    setPostList([]);
    setPage(1);
    getPostList();
  };

  const renderPostCard = (item: any, index: number) => {
    const postData = item?.posts;
    return (
      <View key={index} style={styles_local.postCard}>
        {/* User header */}
        <View style={styles_local.postHeader}>
          <View style={styles_local.avatar}>
            <Ionicons name="person" size={20} color={C.gray40} />
          </View>
          <View style={styles_local.postHeaderInfo}>
            <Text style={styles_local.postUserName}>{postData?.userName ?? 'User'}</Text>
            <Text style={styles_local.postTime}>{postData?.createdAt ?? ''}</Text>
          </View>
        </View>

        {/* Description */}
        {postData?.description ? (
          <Text style={styles_local.postDescription}>{postData.description}</Text>
        ) : null}

        {/* Image placeholder */}
        {postData?.postingMediaArray?.length > 0 && (
          <View style={styles_local.postImageWrap}>
            <View style={styles_local.postImagePlaceholder}>
              <Ionicons name="image-outline" size={32} color={C.gray60} />
            </View>
          </View>
        )}

        {/* Actions */}
        <View style={styles_local.postActions}>
          <TouchableOpacity style={styles_local.actionBtn} activeOpacity={0.7}>
            <Ionicons name="heart-outline" size={22} color={C.gray30} />
            <Text style={styles_local.actionCount}>{postData?.likeCount ?? 0}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles_local.actionBtn} activeOpacity={0.7}>
            <Ionicons name="chatbubble-outline" size={22} color={C.gray30} />
            <Text style={styles_local.actionCount}>{postData?.commentCount ?? 0}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles_local.actionBtn} activeOpacity={0.7}>
            <Ionicons name="bookmark" size={22} color={C.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>
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

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, FlatList, SafeAreaView, RefreshControl, Dimensions, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useResponsiveStyleSheet } from '@helper/responsiveStyleSheet';
import { C, FONT } from './theme';
import { postsApi } from '../../api/posts';
import logger from '@helper/logger';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface PostData {
  id: number;
  users?: { id: number; profileImage?: string; displayName?: string };
  canEdit?: boolean;
  [key: string]: any;
}

export default function CommunityScreen(props: any) {
  const [mPostList, setMPostList] = useState<PostData[]>([]);
  const [page, setPage] = useState(1);
  const [numPage, setNumPage] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const scrollController = useRef<FlatList | null>(null);

  const getPostList = useCallback(async (pageNum: number = 1) => {
    setIsLoading(true);
    try {
      const res = await postsApi.getList(pageNum);
      setNumPage(res.data.pagination?.total_pages ?? 1);
      const list = (res.data.data ?? []).map((p: any) => ({
        id: p.id,
        users: p.users ? {
          id: p.users.id,
          profileImage: p.users.profile_image,
          displayName: p.users.display_name,
        } : undefined,
        canEdit: p.can_edit,
        content: p.description,
        postImage: p.posting_media_array?.[0]?.media_url ?? '',
        createdAt: p.created_at,
        likesCount: p.posting_like_count,
        commentsCount: p.posting_comment_count,
        isLiked: p.is_liked,
        isBookmark: p.is_bookmark,
      }));
      if (pageNum === 1) setMPostList(list);
      else setMPostList((prev) => [...prev, ...list]);
    } catch (e) {
      logger.error('Error fetching posts', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    getPostList(1);
  }, [getPostList]);

  const _onRefresh = async () => {
    setIsRefreshing(true);
    setPage(1);
    setMPostList([]);
    await getPostList(1);
    setIsRefreshing(false);
  };

  const handlePostPress = async () => {
    const data = await props.navigation.navigate('MigratedAddPost');
    if (data === 'refresh') {
      setMPostList([]);
      setPage(1);
      getPostList(1);
    }
  };

  const handleEndReached = () => {
    if (!isLoading && numPage && page < numPage) {
      const nextPage = page + 1;
      setPage(nextPage);
      getPostList(nextPage);
    }
  };

  const renderPostItem = ({ item, index }: { item: PostData; index: number }) => {
    return (
      <View style={[localStyles.postCard, { marginHorizontal: 10, marginVertical: 6 }]}>
        <View style={localStyles.postHeader}>
          <Image
            source={{ uri: item.users?.profileImage || '' }}
            style={localStyles.avatar}
          />
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={localStyles.userName}>{item.users?.displayName || 'User'}</Text>
            <Text style={localStyles.postTime}>{item.createdAt || ''}</Text>
          </View>
          {item.canEdit && (
            <TouchableOpacity>
              <Ionicons name="ellipsis-vertical" size={18} color={C.gray30} />
            </TouchableOpacity>
          )}
        </View>
        {item.content ? (
          <Text style={localStyles.postContent}>{item.content}</Text>
        ) : null}
        {item.postImage ? (
          <Image source={{ uri: item.postImage }} style={localStyles.postImage} resizeMode="cover" />
        ) : null}
        <View style={localStyles.postActions}>
          <TouchableOpacity style={localStyles.actionBtn}>
            <Ionicons name="heart-outline" size={20} color={C.gray30} />
            <Text style={localStyles.actionText}>{item.likesCount || 0}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={localStyles.actionBtn}>
            <Ionicons name="chatbubble-outline" size={20} color={C.gray30} />
            <Text style={localStyles.actionText}>{item.commentsCount || 0}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={localStyles.actionBtn}>
            <Ionicons name="bookmark-outline" size={20} color={C.gray30} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderEmptyList = () => {
    if (isLoading) return null;
    return (
      <View style={localStyles.emptyContainer}>
        <Ionicons name="alert-circle-outline" size={80} color={C.gray50} />
        <Text style={localStyles.emptyText}>No posts found</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={localStyles.container}>
      <View style={localStyles.appBar}>
        <Text style={localStyles.appBarTitle}>Community</Text>
        <TouchableOpacity
          style={localStyles.postButton}
          onPress={handlePostPress}
        >
          <Ionicons name="add-circle-outline" size={18} color={C.white} />
          <Text style={localStyles.postButtonText}>Post</Text>
        </TouchableOpacity>
      </View>
      <View style={localStyles.body}>
        {mPostList.length > 0 ? (
          <FlatList
            ref={scrollController}
            data={mPostList}
            renderItem={renderPostItem}
            keyExtractor={(item, index) => `${item.id}-${index}`}
            onEndReached={handleEndReached}
            onEndReachedThreshold={0.5}
            refreshControl={
              <RefreshControl refreshing={isRefreshing} onRefresh={_onRefresh} tintColor={C.orange} />
            }
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        ) : (
          renderEmptyList()
        )}
        {isLoading && (
          <View style={localStyles.loaderContainer}>
            <ActivityIndicator size="large" color={C.orange} />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const localStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  appBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: C.bg,
  },
  appBarTitle: {
    fontFamily: FONT.bold,
    fontSize: 20,
    color: C.white,
  },
  postButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.orange,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  postButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: FONT.bold,
    marginLeft: 4,
  },
  body: { flex: 1, backgroundColor: 'rgba(128,128,128,0.1)' },
  postCard: {
    backgroundColor: C.surfaceLight,
    borderRadius: 12,
    padding: 12,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: C.gray70,
  },
  userName: {
    fontFamily: FONT.semiBold,
    fontSize: 14,
    color: C.white,
  },
  postTime: {
    fontFamily: FONT.regular,
    fontSize: 12,
    color: C.gray30,
  },
  postContent: {
    fontFamily: FONT.regular,
    fontSize: 14,
    color: C.white,
    marginTop: 10,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginTop: 10,
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginTop: 12,
    borderTopWidth: 0.5,
    borderTopColor: C.border,
    paddingTop: 10,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  actionText: {
    fontFamily: FONT.regular,
    fontSize: 13,
    color: C.gray30,
    marginLeft: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: FONT.bold,
    fontSize: 16,
    color: C.white,
    marginTop: 16,
  },
  loaderContainer: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
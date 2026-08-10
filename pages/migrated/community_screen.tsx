import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, FlatList, SafeAreaView, RefreshControl, Dimensions, ActivityIndicator, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
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
      setNumPage(res.data.pagination?.totalPages ?? 1);
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
        postingMediaArray: p.posting_media_array ?? [],
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

  useFocusEffect(
    useCallback(() => {
      setPage(1);
      getPostList(1);
    }, [getPostList])
  );

  const _onRefresh = async () => {
    setIsRefreshing(true);
    setPage(1);
    setMPostList([]);
    await getPostList(1);
    setIsRefreshing(false);
  };

  const handlePostPress = () => {
    props.navigation.navigate('MigratedAddPost');
  };

  const handleEndReached = () => {
    if (!isLoading && numPage && page < numPage) {
      const nextPage = page + 1;
      setPage(nextPage);
      getPostList(nextPage);
    }
  };

  const openUserProfile = (item: PostData) => {
    if (!item.users?.id) return;
    props.navigation.navigate('MigratedOtherUserProfile', {
      userDetails: {
        id: item.users.id,
        firstName: item.users.displayName || 'User',
        lastName: '',
        profileImage: item.users.profileImage,
      },
    });
  };

  const openPostDetail = (item: PostData) => {
    props.navigation.navigate('MigratedPostDetails', {
      postData: {
        id: item.id,
        content: item.content,
        images: item.postImage ? [item.postImage] : [],
        canEdit: item.canEdit,
        users: {
          id: item.users?.id,
          firstName: item.users?.displayName || 'User',
          lastName: '',
          profileImage: item.users?.profileImage,
        },
        likesCount: item.likesCount,
        commentsCount: item.commentsCount,
        isLiked: item.isLiked,
        isBookmarked: item.isBookmark,
        createdAt: item.createdAt,
      },
    });
  };

  const toggleLike = (item: PostData) => {
    const wasLiked = !!item.isLiked;
    setMPostList((prev) =>
      prev.map((p) =>
        p.id === item.id
          ? { ...p, isLiked: !wasLiked, likesCount: (p.likesCount || 0) + (wasLiked ? -1 : 1) }
          : p
      )
    );
    postsApi.like(item.id).catch((e) => {
      logger.error('Error toggling like', e);
      setMPostList((prev) =>
        prev.map((p) => (p.id === item.id ? { ...p, isLiked: wasLiked, likesCount: item.likesCount } : p))
      );
    });
  };

  const toggleBookmark = (item: PostData) => {
    const wasBookmarked = !!item.isBookmark;
    setMPostList((prev) =>
      prev.map((p) => (p.id === item.id ? { ...p, isBookmark: !wasBookmarked } : p))
    );
    postsApi.bookmark(item.id).catch((e) => {
      logger.error('Error toggling bookmark', e);
      setMPostList((prev) =>
        prev.map((p) => (p.id === item.id ? { ...p, isBookmark: wasBookmarked } : p))
      );
    });
  };

  const showPostOptions = (item: PostData) => {
    Alert.alert('Publicación', undefined, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Editar',
        onPress: () => {
          props.navigation.navigate('MigratedAddPost', {
            flow: 'EditFlow',
            postData: {
              id: item.id,
              description: item.content,
              postingMediaArray: item.postingMediaArray ?? [],
            },
          });
        },
      },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            await postsApi.deletePost(item.id);
            setMPostList((prev) => prev.filter((p) => p.id !== item.id));
          } catch (e) {
            logger.error('Error deleting post', e);
            Alert.alert('Error', 'No se pudo eliminar la publicación');
          }
        },
      },
    ]);
  };

  const renderPostItem = ({ item, index }: { item: PostData; index: number }) => {
    return (
      <TouchableOpacity
        activeOpacity={0.85}
        style={[localStyles.postCard, { marginHorizontal: 10, marginVertical: 6 }]}
        onPress={() => openPostDetail(item)}
      >
        <View style={localStyles.postHeader}>
          <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }} activeOpacity={0.7} onPress={() => openUserProfile(item)}>
            {item.users?.profileImage ? (
              <Image source={{ uri: item.users.profileImage }} style={localStyles.avatar} />
            ) : (
              <View style={[localStyles.avatar, localStyles.avatarPlaceholder]}>
                <Ionicons name="person" size={18} color={C.gray30} />
              </View>
            )}
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={localStyles.userName}>{item.users?.displayName || 'User'}</Text>
              <Text style={localStyles.postTime}>{item.createdAt || ''}</Text>
            </View>
          </TouchableOpacity>
          {item.canEdit && (
            <TouchableOpacity onPress={() => showPostOptions(item)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
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
          <TouchableOpacity style={localStyles.actionBtn} onPress={() => toggleLike(item)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name={item.isLiked ? 'heart' : 'heart-outline'} size={20} color={item.isLiked ? C.destructive : C.gray30} />
            <Text style={localStyles.actionText}>{item.likesCount || 0}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={localStyles.actionBtn} onPress={() => openPostDetail(item)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="chatbubble-outline" size={20} color={C.gray30} />
            <Text style={localStyles.actionText}>{item.commentsCount || 0}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={localStyles.actionBtn} onPress={() => toggleBookmark(item)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name={item.isBookmark ? 'bookmark' : 'bookmark-outline'} size={20} color={item.isBookmark ? C.orange : C.gray30} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
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
        <View style={localStyles.appBarActions}>
          <TouchableOpacity
            style={localStyles.bookmarkButton}
            onPress={() => props.navigation.navigate('MigratedBookmark')}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="bookmark-outline" size={22} color={C.white} />
          </TouchableOpacity>
          <TouchableOpacity
            style={localStyles.postButton}
            onPress={handlePostPress}
          >
            <Ionicons name="add-circle-outline" size={18} color={C.white} />
            <Text style={localStyles.postButtonText}>Post</Text>
          </TouchableOpacity>
        </View>
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
  appBarActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bookmarkButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
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
  avatarPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
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
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Dimensions, ActivityIndicator, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C, FONT } from './theme';
import { blogApi, BlogListItem } from '../../api/blog';
import logger from '@helper/logger';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const truncateTitle = (text: string, maxWords: number = 15): string => {
  if (!text) return '';
  const stripped = text.replace(/<[^>]*>/g, '');
  const words = stripped.split(/\s+/);
  if (words.length <= maxWords) return stripped;
  return words.slice(0, maxWords).join(' ') + '…';
};

const formatDate = (dateStr: string): string => {
  if (!dateStr) return '';
  try {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return dateStr;
  }
};

export default function ViewAllBlogScreen({ navigation, route }: any) {
  const { categoryTitle, categoryId } = route?.params || {};

  const [posts, setPosts] = useState<BlogListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLastPage, setIsLastPage] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    loadPosts(1);
  }, []);

  const loadPosts = async (pageNum: number) => {
    if (pageNum === 1) setLoading(true);
    else setLoadingMore(true);

    try {
      const params: any = {
        page: pageNum,
        per_page: 15,
        order_by: 'datetime',
        order_dir: 'desc',
      };
      if (categoryId) params.blog_category_id = categoryId;

      const res = await blogApi.getList(pageNum, params);
      const data = res.data.data ?? [];
      const filtered = data.filter((p: BlogListItem) => p.status === 'publish');
      const pagination = res.data.pagination;

      if (pageNum === 1) {
        setPosts(filtered);
      } else {
        setPosts((prev) => [...prev, ...filtered]);
      }

      setTotalPages(pagination.totalPages || 1);
      setIsLastPage(pageNum >= pagination.totalPages);
    } catch (e) {
      logger.error('Error loading posts:', e);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleLoadMore = useCallback(() => {
    if (!isLastPage && !loadingMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadPosts(nextPage);
    }
  }, [page, isLastPage, loadingMore]);

  const navigateToDetail = (item: BlogListItem) => {
    navigation.navigate('MigratedBlogDetail', { mBlogModel: item });
  };

  const renderCard = ({ item }: { item: BlogListItem }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.8}
      onPress={() => navigateToDetail(item)}
    >
      {item.post_image ? (
        <Image source={{ uri: item.post_image }} style={styles.cardImage} resizeMode="cover" />
      ) : (
        <View style={[styles.cardImage, { backgroundColor: C.surfaceLight }]} />
      )}
      <View style={styles.cardInfo}>
        <Text style={styles.cardTitle} numberOfLines={2}>
          {truncateTitle(item.title || '', 15)}
        </Text>
        {item.blog_category && (
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryBadgeText}>{item.blog_category.title}</Text>
          </View>
        )}
        <View style={styles.cardMeta}>
          <Ionicons name="time-outline" size={13} color={C.gray40} />
          <Text style={styles.cardDate}>{formatDate(item.datetime)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={C.orange} />
      </View>
    );
  };

  const renderEmpty = () => {
    if (loading) {
      return (
        <View style={styles.emptyWrap}>
          <ActivityIndicator size="large" color={C.orange} />
        </View>
      );
    }
    return (
      <View style={styles.emptyWrap}>
        <Ionicons name="document-text-outline" size={48} color={C.gray60} />
        <Text style={styles.emptyText}>No articles found</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={C.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {categoryTitle || 'All Articles'}
        </Text>
      </View>

      <FlatList
        ref={flatListRef}
        data={posts}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderCard}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 14,
    backgroundColor: C.surface,
    gap: 12,
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontFamily: FONT.bold, color: C.white, flex: 1 },
  listContent: { paddingHorizontal: 16, paddingVertical: 16 },
  card: {
    backgroundColor: C.surfaceLight,
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
  },
  cardImage: { width: '100%', height: 160 },
  cardInfo: { padding: 14 },
  cardTitle: {
    fontSize: 16,
    fontFamily: FONT.semiBold,
    color: C.white,
    marginBottom: 8,
    lineHeight: 22,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: C.brand5,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginBottom: 8,
  },
  categoryBadgeText: { fontSize: 11, fontFamily: FONT.semiBold, color: C.white },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  cardDate: { fontSize: 12, fontFamily: FONT.regular, color: C.gray40 },
  footerLoader: { paddingVertical: 20, alignItems: 'center' },
  emptyWrap: { alignItems: 'center', justifyContent: 'center', paddingVertical: 80, gap: 12 },
  emptyText: { fontSize: 15, fontFamily: FONT.medium, color: C.gray40 },
});
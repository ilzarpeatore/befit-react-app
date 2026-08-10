import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Dimensions, ActivityIndicator, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C, FONT } from './theme';
import { blogApi, BlogListItem, BlogCategory } from '../../api/blog';
import SimpleBottomSheet from '../../components/SimpleBottomSheet';
import logger from '@helper/logger';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface SortOption {
  key: string;
  label: string;
  sortBy: string;
  orderDir: string;
}

const SORT_OPTIONS: SortOption[] = [
  { key: 'recent', label: 'Recientes', sortBy: 'datetime', orderDir: 'desc' },
  { key: 'old', label: 'Antiguos', sortBy: 'datetime', orderDir: 'asc' },
  { key: 'az', label: 'A-Z', sortBy: 'title', orderDir: 'asc' },
];

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
    return new Date(dateStr).toLocaleDateString('es-ES', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return dateStr;
  }
};

export default function ViewAllBlogScreen({ navigation, route }: any) {
  const { categoryTitle, categoryId } = route?.params || {};

  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(categoryId ?? null);
  const [sortBy, setSortBy] = useState<string>('datetime');
  const [orderDir, setOrderDir] = useState<string>('desc');
  const [sortSheetVisible, setSortSheetVisible] = useState(false);
  const [categorySheetVisible, setCategorySheetVisible] = useState(false);

  const [searchText, setSearchText] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<BlogListItem[]>([]);

  const [posts, setPosts] = useState<BlogListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [isLastPage, setIsLastPage] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    blogApi.getCategories().then((res) => setCategories(res.data?.data ?? [])).catch(() => {});
  }, []);

  useEffect(() => {
    setPage(1);
    loadPosts(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory, sortBy, orderDir]);

  const loadPosts = async (pageNum: number) => {
    if (pageNum === 1) setLoading(true);
    else setLoadingMore(true);

    try {
      const params: any = {
        page: pageNum,
        per_page: 15,
        order_by: sortBy,
        order_dir: orderDir,
      };
      if (selectedCategory) params.blog_category_id = selectedCategory;

      const res = await blogApi.getList(pageNum, params);
      const data = res.data.data ?? [];
      const filtered = data.filter((p: BlogListItem) => p.status === 'publish');
      const pagination = res.data.pagination;

      setPosts((prev) => (pageNum === 1 ? filtered : [...prev, ...filtered]));
      setIsLastPage(pageNum >= (pagination.totalPages || 1));
    } catch (e) {
      logger.error('Error loading posts:', e);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleLoadMore = useCallback(() => {
    if (!isLastPage && !loadingMore && !isSearching) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadPosts(nextPage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, isLastPage, loadingMore, isSearching]);

  const handleSearch = async (text: string) => {
    setSearchText(text);
    if (text.trim().length === 0) {
      setIsSearching(false);
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const res = await blogApi.getList(1, { search: text, per_page: 50 });
      setSearchResults((res.data?.data ?? []).filter((p: any) => p.status === 'publish'));
    } catch {}
  };

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
        <Text style={styles.emptyText}>{isSearching ? 'Sin resultados' : 'No hay artículos disponibles'}</Text>
      </View>
    );
  };

  const listData = isSearching ? searchResults : posts;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={C.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {categoryTitle || 'Todos los artículos'}
        </Text>
      </View>

      <View style={styles.searchWrap}>
        <Ionicons name="search-outline" size={18} color={C.gray40} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar artículos..."
          placeholderTextColor={C.gray50}
          value={searchText}
          onChangeText={handleSearch}
        />
        {searchText.length > 0 && (
          <TouchableOpacity onPress={() => handleSearch('')}>
            <Ionicons name="close-circle" size={18} color={C.gray40} />
          </TouchableOpacity>
        )}
      </View>

      {!isSearching && (
        <View style={styles.filterRow}>
          <TouchableOpacity style={styles.filterPill} onPress={() => setSortSheetVisible(true)} activeOpacity={0.75}>
            <Ionicons name="swap-vertical-outline" size={15} color={C.white} />
            <Text style={styles.filterPillText} numberOfLines={1}>
              {SORT_OPTIONS.find((o) => o.sortBy === sortBy && o.orderDir === orderDir)?.label ?? 'Ordenar'}
            </Text>
            <Ionicons name="chevron-down" size={14} color={C.gray40} />
          </TouchableOpacity>

          {categories.length > 0 && (
            <TouchableOpacity style={styles.filterPill} onPress={() => setCategorySheetVisible(true)} activeOpacity={0.75}>
              <Ionicons name="pricetag-outline" size={15} color={C.white} />
              <Text style={styles.filterPillText} numberOfLines={1}>
                {selectedCategory ? categories.find((c) => c.id === selectedCategory)?.title ?? 'Todos' : 'Todos'}
              </Text>
              <Ionicons name="chevron-down" size={14} color={C.gray40} />
            </TouchableOpacity>
          )}
        </View>
      )}

      <FlatList
        ref={flatListRef}
        data={listData}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderCard}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
      />

      <SimpleBottomSheet visible={sortSheetVisible} onClose={() => setSortSheetVisible(false)}>
        <View style={styles.sheetContent}>
          <Text style={styles.sheetTitle}>Ordenar por</Text>
          {SORT_OPTIONS.map((opt) => {
            const active = opt.sortBy === sortBy && opt.orderDir === orderDir;
            return (
              <TouchableOpacity
                key={opt.key}
                style={styles.sheetOptionRow}
                onPress={() => {
                  setSortBy(opt.sortBy);
                  setOrderDir(opt.orderDir);
                  setSortSheetVisible(false);
                }}
              >
                <Text style={[styles.sheetOptionText, active && styles.sheetOptionTextActive]}>{opt.label}</Text>
                {active ? <Ionicons name="checkmark" size={18} color={C.textPrimary} /> : null}
              </TouchableOpacity>
            );
          })}
        </View>
      </SimpleBottomSheet>

      <SimpleBottomSheet visible={categorySheetVisible} onClose={() => setCategorySheetVisible(false)}>
        <View style={styles.sheetContent}>
          <Text style={styles.sheetTitle}>Categoría</Text>
          <View>
            <TouchableOpacity
              style={styles.sheetOptionRow}
              onPress={() => {
                setSelectedCategory(null);
                setCategorySheetVisible(false);
              }}
            >
              <Text style={[styles.sheetOptionText, !selectedCategory && styles.sheetOptionTextActive]}>Todos</Text>
              {!selectedCategory ? <Ionicons name="checkmark" size={18} color={C.textPrimary} /> : null}
            </TouchableOpacity>
            {categories.map((cat) => {
              const active = selectedCategory === cat.id;
              return (
                <TouchableOpacity
                  key={cat.id}
                  style={styles.sheetOptionRow}
                  onPress={() => {
                    setSelectedCategory(active ? null : cat.id);
                    setCategorySheetVisible(false);
                  }}
                >
                  <Text style={[styles.sheetOptionText, active && styles.sheetOptionTextActive]}>{cat.title}</Text>
                  {active ? <Ionicons name="checkmark" size={18} color={C.textPrimary} /> : null}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </SimpleBottomSheet>
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
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.surfaceLight,
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 12,
    paddingHorizontal: 12,
    height: 44,
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 14, fontFamily: FONT.regular, color: C.white },
  filterRow: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 12,
    gap: 8,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: C.surfaceLight,
  },
  filterPillText: { fontSize: 13, fontFamily: FONT.medium, color: C.white, maxWidth: 120 },
  sheetContent: { padding: 24 },
  sheetTitle: { fontFamily: FONT.bold, fontSize: 16, color: C.textPrimary, marginBottom: 8 },
  sheetOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
  sheetOptionText: { fontFamily: FONT.medium, fontSize: 15, color: C.textSecondary },
  sheetOptionTextActive: { fontFamily: FONT.bold, color: C.textPrimary },
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

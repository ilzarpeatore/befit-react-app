import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, ScrollView, TextInput, Dimensions, Image, Alert } from 'react-native';
import { Box } from '@components/ui/box';
import { Text } from '@components/ui/text';
import { Pressable } from '@components/ui/pressable';
import { Icon } from '@components/ui/icon';
import { Spinner } from '@components/ui/spinner';
import { C, FONT } from './theme';
import { blogApi, BlogListItem, BlogCategory } from '../../api/blog';
import SimpleBottomSheet from '../../components/SimpleBottomSheet';

interface SortOption {
  key: string;
  label: string;
  sortBy: 'datetime' | 'title';
  orderDir: 'desc' | 'asc';
}

const SORT_OPTIONS: SortOption[] = [
  { key: 'recent', label: 'Recientes', sortBy: 'datetime', orderDir: 'desc' },
  { key: 'old', label: 'Antiguos', sortBy: 'datetime', orderDir: 'asc' },
  { key: 'az', label: 'A-Z', sortBy: 'title', orderDir: 'asc' },
];

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const truncateText = (text: string, maxWords: number = 15): string => {
  if (!text) return '';
  const stripped = text.replace(/<[^>]*>/g, '');
  const words = stripped.split(/\s+/);
  if (words.length <= maxWords) return stripped;
  return words.slice(0, maxWords).join(' ') + '...';
};

export default function BlogScreen({ navigation }: any) {
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [sections, setSections] = useState<{ category: BlogCategory; posts: BlogListItem[] }[]>([]);
  const [featuredPosts, setFeaturedPosts] = useState<BlogListItem[]>([]);
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState<BlogListItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'datetime' | 'title'>('datetime');
  const [orderDir, setOrderDir] = useState<'desc' | 'asc'>('desc');
  const [sortSheetVisible, setSortSheetVisible] = useState(false);
  const [categorySheetVisible, setCategorySheetVisible] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (!isSearching && !loading) {
      loadFilteredPosts();
    }
  }, [selectedCategory, sortBy, orderDir]);

  const loadData = async () => {
    setLoading(true);
    try {
      const postsRes = await blogApi.getList(1, { per_page: 100, order_by: sortBy, order_dir: orderDir });
      const raw = postsRes.data;
      const posts: BlogListItem[] = (raw?.data ?? []).filter((p: any) => p.status === 'publish');

      setFeaturedPosts(posts.filter((p: any) => p.is_featured === '1' || p.is_featured === true || p.is_featured === 1).slice(0, 3));
      buildSections(posts);

      try {
        const catsRes = await blogApi.getCategories();
        setCategories(catsRes.data?.data ?? []);
      } catch {}
    } catch (e: any) {
      Alert.alert('Blog Error', e?.message || String(e));
    } finally {
      setLoading(false);
    }
  };

  const loadFilteredPosts = async () => {
    try {
      const params: any = { per_page: 100, order_by: sortBy, order_dir: orderDir };
      if (selectedCategory) params.blog_category_id = selectedCategory;

      const res = await blogApi.getList(1, params);
      const posts: BlogListItem[] = (res.data?.data ?? []).filter((p: any) => p.status === 'publish');

      setFeaturedPosts(posts.filter((p: any) => p.is_featured === '1' || p.is_featured === true || p.is_featured === 1).slice(0, 3));
      buildSections(posts);
    } catch {}
  };

  const buildSections = (posts: BlogListItem[]) => {
    if (selectedCategory) {
      const cat = categories.find((c) => c.id === selectedCategory);
      if (cat) {
        setSections([{ category: cat, posts: posts.slice(0, 4) }]);
      } else {
        setSections([]);
      }
    } else {
      const grouped: { [key: string]: BlogListItem[] } = {};
      posts.forEach((post) => {
        const catTitle = post.blog_category?.title || 'Sin categoría';
        if (!grouped[catTitle]) grouped[catTitle] = [];
        grouped[catTitle].push(post);
      });

      const newSections = Object.entries(grouped).map(([title, catPosts]) => ({
        category: categories.find((c) => c.title === title) || { id: 0, title, slug: '', post_count: 0 },
        posts: catPosts.slice(0, 4),
      }));
      newSections.sort((a, b) => (a.category.id || Number.MAX_SAFE_INTEGER) - (b.category.id || Number.MAX_SAFE_INTEGER));
      setSections(newSections);
    }
  };

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

  const navigateToDetail = (post: BlogListItem) => {
    navigation.navigate('MigratedBlogDetail', { mBlogModel: post });
  };

  const navigateToViewAll = (categoryTitle?: string, categoryId?: number | null) => {
    navigation.navigate('MigratedViewAllBlog', { categoryTitle, categoryId });
  };

  const renderPostCard = (item: BlogListItem) => (
    <Pressable
      key={item.id}
      style={styles_local.blogCard}
      onPress={() => navigateToDetail(item)}
    >
      {item.post_image ? (
        <Image source={{ uri: item.post_image }} style={styles_local.blogImage} resizeMode="cover" />
      ) : (
        <Box style={[styles_local.blogImage, { backgroundColor: C.surfaceLight }]} />
      )}
      <Box style={styles_local.blogInfo}>
        <Text style={styles_local.blogTitle} numberOfLines={2}>{item.title || ''}</Text>
        <Text style={styles_local.blogExcerpt} numberOfLines={2}>
          {truncateText(item.description || item.content || '', 15)}
        </Text>
      </Box>
    </Pressable>
  );

  const renderFeaturedCard = (item: BlogListItem, index: number) => (
    <Pressable
      key={item.id}
      style={[styles_local.featuredCard, index === 0 && styles_local.featuredCardLarge]}
      onPress={() => navigateToDetail(item)}
    >
      {item.post_image ? (
        <Image source={{ uri: item.post_image }} style={styles_local.featuredImage} resizeMode="cover" />
      ) : (
        <Box style={[styles_local.featuredImage, { backgroundColor: C.surfaceLight }]} />
      )}
      <Box style={styles_local.featuredOverlay} />
      {item.blog_category && (
        <Box style={styles_local.featuredBadge}>
          <Text style={styles_local.featuredBadgeText}>{item.blog_category.title}</Text>
        </Box>
      )}
      <Box style={styles_local.featuredInfo}>
        <Text style={styles_local.featuredTitle} numberOfLines={2}>{item.title ?? ''}</Text>
      </Box>
    </Pressable>
  );

  return (
    <Box style={styles_local.container}>
      <Box style={styles_local.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles_local.backBtn}>
          <Icon name="chevron-back" size={24} color={C.white} />
        </Pressable>
        <Text style={styles_local.headerTitle}>Blog</Text>
        <Pressable
          style={styles_local.viewAllBtn}
          onPress={() => navigateToViewAll()}
        >
          <Text style={styles_local.viewAllText}>Ver todo</Text>
        </Pressable>
      </Box>

      <ScrollView
        style={styles_local.body}
        showsVerticalScrollIndicator={false}
        bounces
      >
        <Box style={styles_local.searchWrap}>
          <Icon name="search-outline" size={18} color={C.gray40} />
          <TextInput
            style={styles_local.searchInput}
            placeholder="Buscar artículos..."
            placeholderTextColor={C.gray50}
            value={searchText}
            onChangeText={handleSearch}
          />
          {searchText.length > 0 && (
            <Pressable onPress={() => handleSearch('')}>
              <Icon name="close-circle" size={18} color={C.gray40} />
            </Pressable>
          )}
        </Box>

        {!isSearching && (
          <Box style={styles_local.filterRow}>
            <Pressable style={styles_local.filterPill} onPress={() => setSortSheetVisible(true)}>
              <Icon name="swap-vertical-outline" size={15} color={C.white} />
              <Text style={styles_local.filterPillText} numberOfLines={1}>
                {SORT_OPTIONS.find((o) => o.sortBy === sortBy && o.orderDir === orderDir)?.label ?? 'Ordenar'}
              </Text>
              <Icon name="chevron-down" size={14} color={C.gray40} />
            </Pressable>

            {categories.length > 0 && (
              <Pressable style={styles_local.filterPill} onPress={() => setCategorySheetVisible(true)}>
                <Icon name="pricetag-outline" size={15} color={C.white} />
                <Text style={styles_local.filterPillText} numberOfLines={1}>
                  {selectedCategory ? categories.find((c) => c.id === selectedCategory)?.title ?? 'Todos' : 'Todos'}
                </Text>
                <Icon name="chevron-down" size={14} color={C.gray40} />
              </Pressable>
            )}
          </Box>
        )}

        {loading ? (
          <Box style={styles_local.loadingWrap}>
            <Spinner size="large" color={C.orange} />
          </Box>
        ) : isSearching ? (
          <Box style={styles_local.section}>
            <Text style={styles_local.sectionTitle}>Resultados ({searchResults.length})</Text>
            {searchResults.length > 0 ? (
              searchResults.map((item) => renderPostCard(item))
            ) : (
              <Box style={styles_local.emptyWrap}>
                <Icon name="search-outline" size={48} color={C.gray60} />
                <Text style={styles_local.emptyText}>Sin resultados</Text>
              </Box>
            )}
          </Box>
        ) : (
          <>
            {featuredPosts.length > 0 && !selectedCategory && (
              <Box style={styles_local.section}>
                <Box style={styles_local.sectionHeader}>
                  <Text style={styles_local.sectionTitle}>Destacados</Text>
                </Box>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles_local.featuredScroll}>
                  {featuredPosts.map((item, index) => renderFeaturedCard(item, index))}
                </ScrollView>
              </Box>
            )}

            {sections.map((section) => (
              <Box key={section.category.id || section.category.title} style={styles_local.section}>
                <Box style={styles_local.sectionHeader}>
                  <Text style={styles_local.sectionTitle}>{section.category.title}</Text>
                  <Pressable onPress={() => navigateToViewAll(section.category.title, section.category.id)}>
                    <Text style={styles_local.viewMoreText}>Ver más</Text>
                  </Pressable>
                </Box>
                {section.posts.map((item) => renderPostCard(item))}
              </Box>
            ))}

            {sections.length === 0 && featuredPosts.length === 0 && (
              <Box style={styles_local.emptyWrap}>
                <Icon name="document-text-outline" size={48} color={C.gray60} />
                <Text style={styles_local.emptyText}>No hay artículos disponibles</Text>
              </Box>
            )}
          </>
        )}
      </ScrollView>

      <SimpleBottomSheet visible={sortSheetVisible} onClose={() => setSortSheetVisible(false)}>
        <Box style={styles_local.sheetContent}>
          <Text style={styles_local.sheetTitle}>Ordenar por</Text>
          {SORT_OPTIONS.map((opt) => {
            const active = opt.sortBy === sortBy && opt.orderDir === orderDir;
            return (
              <Pressable
                key={opt.key}
                style={styles_local.sheetOptionRow}
                onPress={() => {
                  setSortBy(opt.sortBy);
                  setOrderDir(opt.orderDir);
                  setSortSheetVisible(false);
                }}
              >
                <Text style={[styles_local.sheetOptionText, active && styles_local.sheetOptionTextActive]}>{opt.label}</Text>
                {active ? <Icon name="checkmark" size={18} color={C.textPrimary} /> : null}
              </Pressable>
            );
          })}
        </Box>
      </SimpleBottomSheet>

      <SimpleBottomSheet visible={categorySheetVisible} onClose={() => setCategorySheetVisible(false)}>
        <Box style={styles_local.sheetContent}>
          <Text style={styles_local.sheetTitle}>Categoría</Text>
          <ScrollView style={{ maxHeight: 340 }}>
            <Pressable
              style={styles_local.sheetOptionRow}
              onPress={() => {
                setSelectedCategory(null);
                setCategorySheetVisible(false);
              }}
            >
              <Text style={[styles_local.sheetOptionText, !selectedCategory && styles_local.sheetOptionTextActive]}>Todos</Text>
              {!selectedCategory ? <Icon name="checkmark" size={18} color={C.textPrimary} /> : null}
            </Pressable>
            {categories.map((cat) => {
              const active = selectedCategory === cat.id;
              return (
                <Pressable
                  key={cat.id}
                  style={styles_local.sheetOptionRow}
                  onPress={() => {
                    setSelectedCategory(active ? null : cat.id);
                    setCategorySheetVisible(false);
                  }}
                >
                  <Text style={[styles_local.sheetOptionText, active && styles_local.sheetOptionTextActive]}>{cat.title}</Text>
                  {active ? <Icon name="checkmark" size={18} color={C.textPrimary} /> : null}
                </Pressable>
              );
            })}
          </ScrollView>
        </Box>
      </SimpleBottomSheet>
    </Box>
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
  viewAllBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: C.brand5 },
  viewAllText: { fontSize: 13, fontFamily: FONT.semiBold, color: C.white },
  body: { flex: 1 },
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
  section: { marginTop: 16, marginBottom: 8 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 18, fontFamily: FONT.bold, color: C.white },
  viewMoreText: { fontSize: 13, fontFamily: FONT.medium, color: C.textPrimary },
  featuredScroll: { paddingLeft: 8 },
  featuredCard: {
    width: SCREEN_WIDTH * 0.75,
    height: SCREEN_WIDTH * 0.45,
    borderRadius: 16,
    overflow: 'hidden',
    marginRight: 12,
    position: 'relative',
  },
  featuredCardLarge: { width: SCREEN_WIDTH * 0.87 },
  featuredImage: { width: '100%', height: '100%' },
  featuredOverlay: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(0,0,0,0.35)' },
  featuredBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: C.brand5,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  featuredBadgeText: { fontSize: 11, fontFamily: FONT.semiBold, color: C.white },
  featuredInfo: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
  },
  featuredTitle: { fontSize: 16, fontFamily: FONT.bold, color: '#FFFFFF', textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4 },
  blogCard: {
    flexDirection: 'row',
    backgroundColor: C.surface,
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 12,
    overflow: 'hidden',
  },
  blogImage: { width: 100, height: 100 },
  blogInfo: { flex: 1, padding: 12, justifyContent: 'center' },
  blogTitle: { fontSize: 14, fontFamily: FONT.semiBold, color: C.white, marginBottom: 4 },
  blogExcerpt: { fontSize: 12, fontFamily: FONT.regular, color: C.gray40, lineHeight: 18 },
  emptyWrap: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60, gap: 12 },
  emptyText: { fontSize: 15, fontFamily: FONT.medium, color: C.gray40 },
  loadingWrap: { paddingVertical: 60, alignItems: 'center' },
});

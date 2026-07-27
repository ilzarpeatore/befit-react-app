import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Dimensions, ActivityIndicator, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C, FONT } from './theme';
import { blogApi, BlogListItem, BlogCategory } from '../../api/blog';

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

      Alert.alert('Blog Debug', `postsRes.data keys: ${Object.keys(raw || {})}\nraw.data type: ${typeof raw?.data}\nraw.data length: ${Array.isArray(raw?.data) ? raw.data.length : 'NOT ARRAY'}\nfiltered: ${posts.length}`);

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
    <TouchableOpacity
      key={item.id}
      style={styles_local.blogCard}
      activeOpacity={0.7}
      onPress={() => navigateToDetail(item)}
    >
      {item.post_image ? (
        <Image source={{ uri: item.post_image }} style={styles_local.blogImage} resizeMode="cover" />
      ) : (
        <View style={[styles_local.blogImage, { backgroundColor: C.surfaceLight }]} />
      )}
      <View style={styles_local.blogInfo}>
        <Text style={styles_local.blogTitle} numberOfLines={2}>{item.title || ''}</Text>
        <Text style={styles_local.blogExcerpt} numberOfLines={2}>
          {truncateText(item.description || item.content || '', 15)}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderFeaturedCard = (item: BlogListItem, index: number) => (
    <TouchableOpacity
      key={item.id}
      style={[styles_local.featuredCard, index === 0 && styles_local.featuredCardLarge]}
      activeOpacity={0.7}
      onPress={() => navigateToDetail(item)}
    >
      {item.post_image ? (
        <Image source={{ uri: item.post_image }} style={styles_local.featuredImage} resizeMode="cover" />
      ) : (
        <View style={[styles_local.featuredImage, { backgroundColor: C.surfaceLight }]} />
      )}
      <View style={styles_local.featuredOverlay} />
      {item.blog_category && (
        <View style={styles_local.featuredBadge}>
          <Text style={styles_local.featuredBadgeText}>{item.blog_category.title}</Text>
        </View>
      )}
      <View style={styles_local.featuredInfo}>
        <Text style={styles_local.featuredTitle} numberOfLines={2}>{item.title ?? ''}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles_local.container}>
      <View style={styles_local.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles_local.backBtn}>
          <Ionicons name="chevron-back" size={24} color={C.white} />
        </TouchableOpacity>
        <Text style={styles_local.headerTitle}>Blog</Text>
        <TouchableOpacity
          style={styles_local.viewAllBtn}
          onPress={() => navigateToViewAll()}
        >
          <Text style={styles_local.viewAllText}>Ver todo</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles_local.body}
        showsVerticalScrollIndicator={false}
        bounces
      >
        <View style={styles_local.searchWrap}>
          <Ionicons name="search-outline" size={18} color={C.gray40} />
          <TextInput
            style={styles_local.searchInput}
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
          <View style={styles_local.sortRow}>
            <TouchableOpacity
              style={[styles_local.sortBtn, sortBy === 'datetime' && orderDir === 'desc' && styles_local.sortBtnActive]}
              onPress={() => { setSortBy('datetime'); setOrderDir('desc'); }}
            >
              <Text style={[styles_local.sortText, sortBy === 'datetime' && orderDir === 'desc' && styles_local.sortTextActive]}>
                Recientes
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles_local.sortBtn, sortBy === 'datetime' && orderDir === 'asc' && styles_local.sortBtnActive]}
              onPress={() => { setSortBy('datetime'); setOrderDir('asc'); }}
            >
              <Text style={[styles_local.sortText, sortBy === 'datetime' && orderDir === 'asc' && styles_local.sortTextActive]}>
                Antiguos
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles_local.sortBtn, sortBy === 'title' && styles_local.sortBtnActive]}
              onPress={() => { setSortBy('title'); setOrderDir('asc'); }}
            >
              <Text style={[styles_local.sortText, sortBy === 'title' && styles_local.sortTextActive]}>
                A-Z
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {!isSearching && categories.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles_local.categoryScroll}>
            <TouchableOpacity
              style={[styles_local.categoryChip, !selectedCategory && styles_local.categoryChipActive]}
              onPress={() => setSelectedCategory(null)}
            >
              <Text style={[styles_local.categoryChipText, !selectedCategory && styles_local.categoryChipTextActive]}>
                Todos
              </Text>
            </TouchableOpacity>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[styles_local.categoryChip, selectedCategory === cat.id && styles_local.categoryChipActive]}
                onPress={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
              >
                <Text style={[styles_local.categoryChipText, selectedCategory === cat.id && styles_local.categoryChipTextActive]}>
                  {cat.title}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {loading ? (
          <View style={styles_local.loadingWrap}>
            <ActivityIndicator size="large" color={C.brand5} />
          </View>
        ) : isSearching ? (
          <View style={styles_local.section}>
            <Text style={styles_local.sectionTitle}>Resultados ({searchResults.length})</Text>
            {searchResults.length > 0 ? (
              searchResults.map((item) => renderPostCard(item))
            ) : (
              <View style={styles_local.emptyWrap}>
                <Ionicons name="search-outline" size={48} color={C.gray60} />
                <Text style={styles_local.emptyText}>Sin resultados</Text>
              </View>
            )}
          </View>
        ) : (
          <>
            {featuredPosts.length > 0 && !selectedCategory && (
              <View style={styles_local.section}>
                <View style={styles_local.sectionHeader}>
                  <Text style={styles_local.sectionTitle}>Destacados</Text>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles_local.featuredScroll}>
                  {featuredPosts.map((item, index) => renderFeaturedCard(item, index))}
                </ScrollView>
              </View>
            )}

            {sections.map((section) => (
              <View key={section.category.id || section.category.title} style={styles_local.section}>
                <View style={styles_local.sectionHeader}>
                  <Text style={styles_local.sectionTitle}>{section.category.title}</Text>
                  <TouchableOpacity onPress={() => navigateToViewAll(section.category.title, section.category.id)}>
                    <Text style={styles_local.viewMoreText}>Ver más</Text>
                  </TouchableOpacity>
                </View>
                {section.posts.map((item) => renderPostCard(item))}
              </View>
            ))}

            {sections.length === 0 && featuredPosts.length === 0 && (
              <View style={styles_local.emptyWrap}>
                <Ionicons name="document-text-outline" size={48} color={C.gray60} />
                <Text style={styles_local.emptyText}>No hay artículos disponibles</Text>
              </View>
            )}
          </>
        )}
      </ScrollView>
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
  sortRow: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 12,
    gap: 8,
  },
  sortBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: C.surfaceLight,
  },
  sortBtnActive: { backgroundColor: C.brand5 },
  sortText: { fontSize: 13, fontFamily: FONT.medium, color: C.gray40 },
  sortTextActive: { color: C.white },
  categoryScroll: { paddingLeft: 16, marginTop: 12, marginBottom: 4 },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: C.surfaceLight,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  categoryChipActive: { backgroundColor: C.brand5, borderColor: C.brand5 },
  categoryChipText: { fontSize: 13, fontFamily: FONT.medium, color: C.gray40 },
  categoryChipTextActive: { color: C.white },
  section: { marginTop: 16, marginBottom: 8 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 18, fontFamily: FONT.bold, color: C.white },
  viewMoreText: { fontSize: 13, fontFamily: FONT.medium, color: C.brand5 },
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
  featuredTitle: { fontSize: 16, fontFamily: FONT.bold, color: C.white, textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4 },
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

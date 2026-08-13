import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput, SafeAreaView, ActivityIndicator, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useResponsiveStyleSheet } from '@helper/responsiveStyleSheet';
import { C, FONT } from './theme';
import { recipesApi, RecipeListItem } from '../../api/recipes';
import logger from '@helper/logger';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface RecipeTag {
  id: number;
  title: string;
  recipeTagImage?: string;
}

interface RecipeCategory {
  id: number;
  title: string;
  recipeCategoryImage?: string;
}

interface RecipeCardItem {
  id: number;
  title: string;
  image?: string;
  calories?: number;
  preparationTime?: number;
  mealType?: string[];
  isFavourite?: boolean;
  isPremium?: boolean;
  isAccessible?: boolean;
}

type MealTypeKey = 'breakfast' | 'lunch' | 'dinner' | 'snacks';

const MEAL_TYPE_FILTERS: { key: MealTypeKey | null; label: string; icon?: keyof typeof Ionicons.glyphMap }[] = [
  { key: null, label: 'All' },
  { key: 'breakfast', label: 'Breakfast', icon: 'sunny-outline' },
  { key: 'lunch', label: 'Lunch', icon: 'restaurant-outline' },
  { key: 'dinner', label: 'Dinner', icon: 'moon-outline' },
  { key: 'snacks', label: 'Snacks', icon: 'nutrition-outline' },
];

function mapRecipe(r: RecipeListItem): RecipeCardItem {
  return {
    id: r.id,
    title: r.title,
    image: r.recipe_image ?? undefined,
    calories: r.calories,
    preparationTime: r.preparation_time,
    mealType: r.meal_type,
    isFavourite: !!r.is_favourite,
    isPremium: r.is_premium,
    isAccessible: r.is_accessible,
  };
}

export default function RecipeMainScreen(props: any) {
  const [tags, setTags] = useState<RecipeTag[]>([]);
  const [isTagsLoading, setIsTagsLoading] = useState(false);
  const [categories, setCategories] = useState<RecipeCategory[]>([]);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(false);
  const [totalCategoryItems, setTotalCategoryItems] = useState(0);
  const [favourites, setFavourites] = useState<RecipeCardItem[]>([]);
  const [isFavouritesLoading, setIsFavouritesLoading] = useState(false);
  const [recipes, setRecipes] = useState<RecipeCardItem[]>([]);
  const [isRecipesLoading, setIsRecipesLoading] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState<MealTypeKey | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<RecipeCardItem[]>([]);
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const styles = useStyle();

  const isSearching = searchQuery.trim().length > 0;

  useEffect(() => {
    fetchAllTags();
    fetchAllCategories();
    fetchFavourites();
  }, []);

  const fetchAllTags = useCallback(async () => {
    setIsTagsLoading(true);
    try {
      let page = 1;
      let totalPages = 1;
      const allTags: RecipeTag[] = [];
      while (page <= totalPages) {
        const res = await recipesApi.getTags(page);
        totalPages = res.data.pagination?.totalPages ?? 1;
        allTags.push(
          ...(res.data.data ?? []).map((t) => ({
            id: t.id,
            title: t.title,
            recipeTagImage: t.recipe_tag_image ?? undefined,
          }))
        );
        page++;
      }
      setTags(allTags);
    } catch (e) {
      logger.error(e);
    } finally {
      setIsTagsLoading(false);
    }
  }, []);

  const fetchAllCategories = useCallback(async () => {
    setIsCategoriesLoading(true);
    try {
      let page = 1;
      let totalPages = 1;
      const allCategories: RecipeCategory[] = [];
      while (page <= totalPages) {
        const res = await recipesApi.getCategories(page);
        totalPages = res.data.pagination?.totalPages ?? 1;
        setTotalCategoryItems(res.data.pagination?.total_items ?? 0);
        allCategories.push(
          ...(res.data.data ?? []).map((c) => ({
            id: c.id,
            title: c.title,
            recipeCategoryImage: c.recipe_category_image ?? undefined,
          }))
        );
        if (allCategories.length >= 9) break;
        page++;
      }
      setCategories(allCategories);
    } catch (e) {
      logger.error(e);
    } finally {
      setIsCategoriesLoading(false);
    }
  }, []);

  const fetchFavourites = useCallback(async () => {
    setIsFavouritesLoading(true);
    try {
      const res = await recipesApi.getFavourite(1);
      setFavourites((res.data.data ?? []).map(mapRecipe));
    } catch (e) {
      logger.error(e);
    } finally {
      setIsFavouritesLoading(false);
    }
  }, []);

  const fetchRecipes = useCallback(async (mealType: MealTypeKey | null) => {
    setIsRecipesLoading(true);
    try {
      const res = await recipesApi.getFilteredList({
        page: 1,
        meal_type: mealType ? [mealType] : undefined,
      });
      setRecipes((res.data.data ?? []).map(mapRecipe));
    } catch (e) {
      logger.error(e);
    } finally {
      setIsRecipesLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecipes(selectedMealType);
  }, [selectedMealType, fetchRecipes]);

  // Búsqueda por título en el catálogo completo (soportada por el backend
  // vía el parámetro `title` de recipe-filter-list), con debounce.
  useEffect(() => {
    const query = searchQuery.trim();
    if (!query) {
      setSearchResults([]);
      setIsSearchLoading(false);
      return;
    }
    setIsSearchLoading(true);
    const handle = setTimeout(async () => {
      try {
        const res = await recipesApi.getFilteredList({ title: query, page: 1 });
        setSearchResults((res.data.data ?? []).map(mapRecipe));
      } catch (e) {
        logger.error(e);
      } finally {
        setIsSearchLoading(false);
      }
    }, 400);
    return () => clearTimeout(handle);
  }, [searchQuery]);

  const handleToggleFavourite = useCallback(
    async (item: RecipeCardItem) => {
      const nextFavourite = !item.isFavourite;
      const applyToggle = (list: RecipeCardItem[]) =>
        list.map((r) => (r.id === item.id ? { ...r, isFavourite: nextFavourite } : r));
      setRecipes(applyToggle);
      setSearchResults(applyToggle);
      if (!nextFavourite) {
        setFavourites((prev) => prev.filter((r) => r.id !== item.id));
      }
      try {
        await recipesApi.setFavourite(item.id);
        if (nextFavourite) {
          fetchFavourites();
        }
      } catch (e) {
        logger.error(e);
        const revert = (list: RecipeCardItem[]) =>
          list.map((r) => (r.id === item.id ? { ...r, isFavourite: item.isFavourite } : r));
        setRecipes(revert);
        setSearchResults(revert);
        fetchFavourites();
      }
    },
    [fetchFavourites]
  );

  const showViewMore = totalCategoryItems > 8 || categories.length > 8;
  const displayCategories = showViewMore ? categories.slice(0, 8) : categories;
  const categoryWidth = (SCREEN_WIDTH - 48) / 3;
  const gridColumnWidth = (SCREEN_WIDTH - 48) / 2;

  const navigateToTagList = () => {
    props.navigation.navigate('MigratedRecipeTagList');
  };
  const navigateToCategoryList = () => {
    props.navigation.navigate('MigratedRecipeCategoryList');
  };
  const navigateToRecipeList = () => {
    props.navigation.navigate('MigratedRecipeListV2', { title: 'Recipes' });
  };
  const navigateToRecipeDetail = (item: RecipeCardItem) => {
    props.navigation.navigate('MigratedDietDetail', { recipeId: item.id, recipeImage: item.image });
  };

  const renderRecipeCard = (item: RecipeCardItem, containerStyle: any) => (
    <TouchableOpacity
      key={item.id}
      style={[s.recipeCard, containerStyle]}
      activeOpacity={0.7}
      onPress={() => navigateToRecipeDetail(item)}
    >
      <View style={s.recipeImageWrap}>
        {item.image ? (
          <Image source={{ uri: item.image }} style={s.recipeImage} resizeMode="cover" />
        ) : (
          <View style={[s.recipeImage, { backgroundColor: C.surfaceLight }]} />
        )}
        {item.isPremium && !item.isAccessible && (
          <View style={s.lockBadge}>
            <Ionicons name="lock-closed" size={11} color="#FFFFFF" />
            <Text style={[s.lockBadgeText, styles.fontSemiBold]}>Exclusive</Text>
          </View>
        )}
        <TouchableOpacity
          style={s.favBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          onPress={(e: any) => {
            e.stopPropagation?.();
            handleToggleFavourite(item);
          }}
        >
          <Ionicons
            name={item.isFavourite ? 'heart' : 'heart-outline'}
            size={16}
            color={item.isFavourite ? C.red : '#FFFFFF'}
          />
        </TouchableOpacity>
      </View>
      <Text style={[s.recipeTitle, styles.fontBold]} numberOfLines={1}>
        {item.title}
      </Text>
      {(item.calories != null || item.preparationTime != null) && (
        <View style={s.recipeMetaRow}>
          {item.calories != null && (
            <Text style={[s.recipeMeta, styles.fontRegular]}>{item.calories} kcal</Text>
          )}
          {item.calories != null && item.preparationTime != null && (
            <Text style={[s.recipeMeta, styles.fontRegular]}> · </Text>
          )}
          {item.preparationTime != null && (
            <Text style={[s.recipeMeta, styles.fontRegular]}>{item.preparationTime} min</Text>
          )}
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => props.navigation.goBack()} style={s.backBtn}>
          <Ionicons name="chevron-back" size={24} color={C.white} />
        </TouchableOpacity>
        <Text style={[s.headerTitle, styles.fontBold]}>Recipes</Text>
        <View style={s.backBtn} />
      </View>

      <ScrollView
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Search */}
        <View style={s.searchWrap}>
          <Ionicons name="search-outline" size={18} color={C.gray40} />
          <TextInput
            style={[s.searchInput, styles.fontRegular]}
            placeholder="Search recipes..."
            placeholderTextColor={C.gray40}
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color={C.gray40} />
            </TouchableOpacity>
          )}
        </View>

        {isSearching ? (
          <View style={s.section}>
            <Text style={[s.sectionTitle, styles.fontBold]}>
              {isSearchLoading ? 'Searching…' : `Results (${searchResults.length})`}
            </Text>
            {isSearchLoading ? (
              <ActivityIndicator size="small" color={C.orange} style={{ paddingVertical: 24 }} />
            ) : searchResults.length === 0 ? (
              <View style={s.emptyBox}>
                <Ionicons name="search-outline" size={40} color={C.gray30} />
                <Text style={[s.emptyText, styles.fontMedium]}>
                  No recipes found for "{searchQuery.trim()}"
                </Text>
              </View>
            ) : (
              <View style={s.grid}>
                {searchResults.map((item) => renderRecipeCard(item, { width: gridColumnWidth }))}
              </View>
            )}
          </View>
        ) : (
          <>
            {/* Favourites */}
            {(isFavouritesLoading || favourites.length > 0) && (
              <View style={s.section}>
                <View style={s.sectionTitleRow}>
                  <Ionicons name="heart" size={16} color={C.red} />
                  <Text style={[s.sectionTitle, styles.fontBold, { marginLeft: 6 }]}>Favourites</Text>
                </View>
                {isFavouritesLoading ? (
                  <ActivityIndicator size="small" color={C.orange} style={{ paddingVertical: 16 }} />
                ) : (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.horizontalList}>
                    {favourites.map((item) => renderRecipeCard(item, { width: 170, marginRight: 12 }))}
                  </ScrollView>
                )}
              </View>
            )}

            {/* Categories */}
            <View style={s.section}>
              <TouchableOpacity style={s.sectionHeaderRow} onPress={navigateToCategoryList} activeOpacity={0.7}>
                <Text style={[s.sectionTitle, styles.fontBold]}>Categories</Text>
                <View style={s.viewAllRow}>
                  <Text style={[s.viewAllText, styles.fontSemiBold]}>View all</Text>
                  <Ionicons name="chevron-forward" size={18} color={C.gray40} />
                </View>
              </TouchableOpacity>
              {isCategoriesLoading ? (
                <ActivityIndicator size="small" color={C.orange} style={{ paddingVertical: 16 }} />
              ) : categories.length === 0 ? null : (
                <View style={s.categoryGrid}>
                  {displayCategories.map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      style={[s.categoryCard, { width: categoryWidth }]}
                      onPress={() =>
                        props.navigation.navigate('MigratedRecipeListV2', {
                          categoryId: item.id,
                          title: item.title,
                        })
                      }
                      activeOpacity={0.7}
                    >
                      {item.recipeCategoryImage ? (
                        <Image
                          source={{ uri: item.recipeCategoryImage }}
                          style={[s.categoryImage, { width: categoryWidth, height: 96 }]}
                          resizeMode="cover"
                        />
                      ) : (
                        <View style={[s.categoryImage, { width: categoryWidth, height: 96, backgroundColor: C.surfaceLight }]} />
                      )}
                      <Text style={[s.categoryTitle, styles.fontSemiBold]} numberOfLines={1}>
                        {item.title}
                      </Text>
                    </TouchableOpacity>
                  ))}
                  {showViewMore && (
                    <TouchableOpacity
                      style={[s.categoryCard, { width: categoryWidth }]}
                      onPress={navigateToCategoryList}
                      activeOpacity={0.7}
                    >
                      <View style={[s.viewMoreBox, { width: categoryWidth, height: 96 }]}>
                        <Ionicons name="add" size={26} color={C.textPrimary} />
                      </View>
                      <Text style={[s.categoryTitle, styles.fontSemiBold]}>View More</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </View>

            {/* Tags */}
            <View style={s.section}>
              <TouchableOpacity style={s.sectionHeaderRow} onPress={navigateToTagList} activeOpacity={0.7}>
                <Text style={[s.sectionTitle, styles.fontBold]}>Tags</Text>
                <View style={s.viewAllRow}>
                  <Text style={[s.viewAllText, styles.fontSemiBold]}>View all</Text>
                  <Ionicons name="chevron-forward" size={18} color={C.gray40} />
                </View>
              </TouchableOpacity>
              {isTagsLoading ? (
                <ActivityIndicator size="small" color={C.orange} style={{ paddingVertical: 16 }} />
              ) : tags.length === 0 ? null : (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.horizontalList}>
                  {tags.map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      style={s.tagChip}
                      onPress={() =>
                        props.navigation.navigate('MigratedRecipeListV2', {
                          tagId: item.id,
                          title: item.title,
                        })
                      }
                      activeOpacity={0.7}
                    >
                      {item.recipeTagImage ? (
                        <Image source={{ uri: item.recipeTagImage }} style={s.tagImage} />
                      ) : null}
                      <Text style={[s.tagText, styles.fontMedium]}>{item.title}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
            </View>

            {/* Browse recipes by meal time */}
            <View style={[s.section, { marginBottom: 8 }]}>
              <TouchableOpacity style={s.sectionHeaderRow} onPress={navigateToRecipeList} activeOpacity={0.7}>
                <Text style={[s.sectionTitle, styles.fontBold]}>Browse Recipes</Text>
                <View style={s.viewAllRow}>
                  <Text style={[s.viewAllText, styles.fontSemiBold]}>View all</Text>
                  <Ionicons name="chevron-forward" size={18} color={C.gray40} />
                </View>
              </TouchableOpacity>

              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.horizontalList}>
                {MEAL_TYPE_FILTERS.map((mt) => {
                  const selected = mt.key === selectedMealType;
                  return (
                    <TouchableOpacity
                      key={mt.key ?? 'all'}
                      style={[s.mealChip, selected && s.mealChipSelected]}
                      onPress={() => setSelectedMealType(mt.key)}
                      activeOpacity={0.7}
                    >
                      {mt.icon && (
                        <Ionicons
                          name={mt.icon}
                          size={14}
                          color={selected ? C.textPrimary : C.gray40}
                          style={{ marginRight: 6 }}
                        />
                      )}
                      <Text style={[s.mealChipText, selected && s.mealChipTextSelected, styles.fontMedium]}>
                        {mt.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {isRecipesLoading ? (
                <ActivityIndicator size="small" color={C.orange} style={{ paddingVertical: 16 }} />
              ) : recipes.length === 0 ? (
                <View style={s.emptyBox}>
                  <Ionicons name="restaurant-outline" size={36} color={C.gray30} />
                  <Text style={[s.emptyText, styles.fontMedium]}>No recipes in this category yet</Text>
                </View>
              ) : (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.horizontalList}>
                  {recipes.map((item) => renderRecipeCard(item, { width: 180, marginRight: 14 }))}
                </ScrollView>
              )}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  backBtn: { width: 40, alignItems: 'center' },
  headerTitle: { fontSize: 18, color: C.white, flex: 1, textAlign: 'center' },
  scrollContent: { padding: 16, paddingBottom: 32 },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.surfaceLight,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: 12,
    height: 44,
    gap: 8,
    marginBottom: 20,
  },
  searchInput: { flex: 1, fontSize: 14, color: C.textPrimary },
  section: { marginBottom: 24 },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  sectionTitle: { fontSize: 18, color: C.textPrimary },
  viewAllRow: { flexDirection: 'row', alignItems: 'center' },
  viewAllText: { fontSize: 13, color: C.textSecondary, marginRight: 2 },
  horizontalList: { paddingRight: 8 },
  emptyBox: { alignItems: 'center', justifyContent: 'center', paddingVertical: 28, gap: 8 },
  emptyText: { fontSize: 13, color: C.gray40, textAlign: 'center' },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: `${C.brand5}80`,
    backgroundColor: C.surfaceLight,
    marginRight: 12,
  },
  tagText: { fontSize: 14, color: C.textPrimary },
  tagImage: { width: 20, height: 20, borderRadius: 10, marginRight: 8 },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  categoryCard: { marginBottom: 16 },
  categoryImage: { borderRadius: 12 },
  categoryTitle: { fontSize: 13, color: C.textPrimary, marginTop: 8 },
  viewMoreBox: {
    borderRadius: 12,
    backgroundColor: `${C.brand5}1A`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mealChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.surfaceLight,
    marginRight: 8,
  },
  mealChipSelected: { backgroundColor: C.brand5, borderColor: C.brand5 },
  mealChipText: { fontSize: 13, color: C.gray40 },
  mealChipTextSelected: { color: C.textPrimary, fontWeight: '600' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  recipeCard: { marginBottom: 16 },
  recipeImageWrap: { position: 'relative' },
  recipeImage: { width: '100%', height: 130, borderRadius: 12 },
  lockBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
  },
  lockBadgeText: { fontSize: 11, color: '#FFFFFF' },
  favBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recipeTitle: { fontSize: 14, color: C.textPrimary, marginTop: 8 },
  recipeMetaRow: { flexDirection: 'row', marginTop: 4 },
  recipeMeta: { fontSize: 12, color: C.textSecondary },
});

function useStyle() {
  return useResponsiveStyleSheet({
    fontBold: { fontFamily: FONT.bold },
    fontMedium: { fontFamily: FONT.medium },
    fontRegular: { fontFamily: FONT.regular },
    fontSemiBold: { fontFamily: FONT.semiBold },
  });
}

import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, ScrollView, Image, TextInput, SafeAreaView, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Box } from '@components/ui/box';
import { Text } from '@components/ui/text';
import { Pressable } from '@components/ui/pressable';
import { Icon } from '@components/ui/icon';
import { Spinner } from '@components/ui/spinner';
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
    <Pressable
      key={item.id}
      style={[s.recipeCard, containerStyle]}
      onPress={() => navigateToRecipeDetail(item)}
    >
      <Box style={s.recipeImageWrap}>
        {item.image ? (
          <Image source={{ uri: item.image }} style={s.recipeImage} resizeMode="cover" />
        ) : (
          <Box style={[s.recipeImage, { backgroundColor: C.surfaceLight }]} />
        )}
        {item.isPremium && !item.isAccessible && (
          <Box style={s.lockBadge}>
            <Icon name="lock-closed" size={11} color="#FFFFFF" />
            <Text style={[s.lockBadgeText, styles.fontSemiBold]}>Exclusive</Text>
          </Box>
        )}
        <Pressable
          style={s.favBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          onPress={(e: any) => {
            e.stopPropagation?.();
            handleToggleFavourite(item);
          }}
        >
          <Icon
            name={item.isFavourite ? 'heart' : 'heart-outline'}
            size={16}
            color={item.isFavourite ? C.red : '#FFFFFF'}
          />
        </Pressable>
      </Box>
      <Text style={[s.recipeTitle, styles.fontBold]} numberOfLines={1}>
        {item.title}
      </Text>
      {(item.calories != null || item.preparationTime != null) && (
        <Box style={s.recipeMetaRow}>
          {item.calories != null && (
            <Text style={[s.recipeMeta, styles.fontRegular]}>{item.calories} kcal</Text>
          )}
          {item.calories != null && item.preparationTime != null && (
            <Text style={[s.recipeMeta, styles.fontRegular]}> · </Text>
          )}
          {item.preparationTime != null && (
            <Text style={[s.recipeMeta, styles.fontRegular]}>{item.preparationTime} min</Text>
          )}
        </Box>
      )}
    </Pressable>
  );

  return (
    <SafeAreaView style={s.container}>
      <Box style={s.header}>
        <Pressable onPress={() => props.navigation.goBack()} style={s.backBtn}>
          <Icon name="chevron-back" size={24} color={C.white} />
        </Pressable>
        <Text style={[s.headerTitle, styles.fontBold]}>Recipes</Text>
        <Box style={s.backBtn} />
      </Box>

      <ScrollView
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Search */}
        <Box style={s.searchWrap}>
          <Icon name="search-outline" size={18} color={C.gray40} />
          <TextInput
            style={[s.searchInput, styles.fontRegular]}
            placeholder="Search recipes..."
            placeholderTextColor={C.gray40}
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery('')}>
              <Icon name="close-circle" size={18} color={C.gray40} />
            </Pressable>
          )}
        </Box>

        {isSearching ? (
          <Box style={s.section}>
            <Text style={[s.sectionTitle, styles.fontBold]}>
              {isSearchLoading ? 'Searching…' : `Results (${searchResults.length})`}
            </Text>
            {isSearchLoading ? (
              <Spinner size="small" color={C.orange} style={{ paddingVertical: 24 }} />
            ) : searchResults.length === 0 ? (
              <Box style={s.emptyBox}>
                <Icon name="search-outline" size={40} color={C.gray30} />
                <Text style={[s.emptyText, styles.fontMedium]}>
                  No recipes found for "{searchQuery.trim()}"
                </Text>
              </Box>
            ) : (
              <Box style={s.grid}>
                {searchResults.map((item) => renderRecipeCard(item, { width: gridColumnWidth }))}
              </Box>
            )}
          </Box>
        ) : (
          <>
            {/* Favourites */}
            {(isFavouritesLoading || favourites.length > 0) && (
              <Box style={s.section}>
                <Box style={s.sectionTitleRow}>
                  <Icon name="heart" size={16} color={C.red} />
                  <Text style={[s.sectionTitle, styles.fontBold, { marginLeft: 6 }]}>Favourites</Text>
                </Box>
                {isFavouritesLoading ? (
                  <Spinner size="small" color={C.orange} style={{ paddingVertical: 16 }} />
                ) : (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.horizontalList}>
                    {favourites.map((item) => renderRecipeCard(item, { width: 170, marginRight: 12 }))}
                  </ScrollView>
                )}
              </Box>
            )}

            {/* Categories */}
            <Box style={s.section}>
              <Pressable style={s.sectionHeaderRow} onPress={navigateToCategoryList}>
                <Text style={[s.sectionTitle, styles.fontBold]}>Categories</Text>
                <Box style={s.viewAllRow}>
                  <Text style={[s.viewAllText, styles.fontSemiBold]}>View all</Text>
                  <Icon name="chevron-forward" size={18} color={C.gray40} />
                </Box>
              </Pressable>
              {isCategoriesLoading ? (
                <Spinner size="small" color={C.orange} style={{ paddingVertical: 16 }} />
              ) : categories.length === 0 ? null : (
                <Box style={s.categoryGrid}>
                  {displayCategories.map((item) => (
                    <Pressable
                      key={item.id}
                      style={[s.categoryCard, { width: categoryWidth }]}
                      onPress={() =>
                        props.navigation.navigate('MigratedRecipeListV2', {
                          categoryId: item.id,
                          title: item.title,
                        })
                      }
                    >
                      {item.recipeCategoryImage ? (
                        <Image
                          source={{ uri: item.recipeCategoryImage }}
                          style={[s.categoryImage, { width: categoryWidth, height: 96 }]}
                          resizeMode="cover"
                        />
                      ) : (
                        <Box style={[s.categoryImage, { width: categoryWidth, height: 96, backgroundColor: C.surfaceLight }]} />
                      )}
                      <Text style={[s.categoryTitle, styles.fontSemiBold]} numberOfLines={1}>
                        {item.title}
                      </Text>
                    </Pressable>
                  ))}
                  {showViewMore && (
                    <Pressable
                      style={[s.categoryCard, { width: categoryWidth }]}
                      onPress={navigateToCategoryList}
                    >
                      <Box style={[s.viewMoreBox, { width: categoryWidth, height: 96 }]}>
                        <Icon name="add" size={26} color={C.textPrimary} />
                      </Box>
                      <Text style={[s.categoryTitle, styles.fontSemiBold]}>View More</Text>
                    </Pressable>
                  )}
                </Box>
              )}
            </Box>

            {/* Tags */}
            <Box style={s.section}>
              <Pressable style={s.sectionHeaderRow} onPress={navigateToTagList}>
                <Text style={[s.sectionTitle, styles.fontBold]}>Tags</Text>
                <Box style={s.viewAllRow}>
                  <Text style={[s.viewAllText, styles.fontSemiBold]}>View all</Text>
                  <Icon name="chevron-forward" size={18} color={C.gray40} />
                </Box>
              </Pressable>
              {isTagsLoading ? (
                <Spinner size="small" color={C.orange} style={{ paddingVertical: 16 }} />
              ) : tags.length === 0 ? null : (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.horizontalList}>
                  {tags.map((item) => (
                    <Pressable
                      key={item.id}
                      style={s.tagChip}
                      onPress={() =>
                        props.navigation.navigate('MigratedRecipeListV2', {
                          tagId: item.id,
                          title: item.title,
                        })
                      }
                    >
                      {item.recipeTagImage ? (
                        <Image source={{ uri: item.recipeTagImage }} style={s.tagImage} />
                      ) : null}
                      <Text style={[s.tagText, styles.fontMedium]}>{item.title}</Text>
                    </Pressable>
                  ))}
                </ScrollView>
              )}
            </Box>

            {/* Browse recipes by meal time */}
            <Box style={[s.section, { marginBottom: 8 }]}>
              <Pressable style={s.sectionHeaderRow} onPress={navigateToRecipeList}>
                <Text style={[s.sectionTitle, styles.fontBold]}>Browse Recipes</Text>
                <Box style={s.viewAllRow}>
                  <Text style={[s.viewAllText, styles.fontSemiBold]}>View all</Text>
                  <Icon name="chevron-forward" size={18} color={C.gray40} />
                </Box>
              </Pressable>

              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.horizontalList}>
                {MEAL_TYPE_FILTERS.map((mt) => {
                  const selected = mt.key === selectedMealType;
                  return (
                    <Pressable
                      key={mt.key ?? 'all'}
                      style={[s.mealChip, selected && s.mealChipSelected]}
                      onPress={() => setSelectedMealType(mt.key)}
                    >
                      {mt.icon && (
                        <Icon
                          name={mt.icon}
                          size={14}
                          color={selected ? C.textPrimary : C.gray40}
                          style={{ marginRight: 6 }}
                        />
                      )}
                      <Text style={[s.mealChipText, selected && s.mealChipTextSelected, styles.fontMedium]}>
                        {mt.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>

              {isRecipesLoading ? (
                <Spinner size="small" color={C.orange} style={{ paddingVertical: 16 }} />
              ) : recipes.length === 0 ? (
                <Box style={s.emptyBox}>
                  <Icon name="restaurant-outline" size={36} color={C.gray30} />
                  <Text style={[s.emptyText, styles.fontMedium]}>No recipes in this category yet</Text>
                </Box>
              ) : (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.horizontalList}>
                  {recipes.map((item) => renderRecipeCard(item, { width: 180, marginRight: 14 }))}
                </ScrollView>
              )}
            </Box>
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

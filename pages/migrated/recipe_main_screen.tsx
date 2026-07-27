import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, FlatList, SafeAreaView, ActivityIndicator, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useResponsiveStyleSheet } from '@helper/responsiveStyleSheet';
import { C, FONT } from './theme';
import { recipesApi } from '../../api/recipes';

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

interface RecipeItem {
  id: number;
  title: string;
  recipeImage?: string;
  calories?: number;
}

interface Pagination {
  totalPages: number;
  totalItems?: number;
}

interface ApiResponse<T> {
  data: T[];
  pagination?: Pagination;
}

export default function RecipeMainScreen(props: any) {
  const [tags, setTags] = useState<RecipeTag[]>([]);
  const [isTagsLoading, setIsTagsLoading] = useState(false);
  const [categories, setCategories] = useState<RecipeCategory[]>([]);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(false);
  const [totalCategoryItems, setTotalCategoryItems] = useState(0);
  const [recipes, setRecipes] = useState<RecipeItem[]>([]);
  const [isRecipesLoading, setIsRecipesLoading] = useState(false);
  const styles = useStyle();

  useEffect(() => {
    fetchAllTags();
    fetchAllCategories();
    fetchRecipes();
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
      console.log(e);
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
      console.log(e);
    } finally {
      setIsCategoriesLoading(false);
    }
  }, []);

  const fetchRecipes = useCallback(async () => {
    setIsRecipesLoading(true);
    try {
      const res = await recipesApi.getFilteredList({ page: 1 });
      const items = (res.data.data ?? []).map((r) => ({
        id: r.id,
        title: r.title,
        recipeImage: r.recipe_image ?? undefined,
        calories: r.calories,
      }));
      setRecipes(items);
    } catch (e) {
      console.log(e);
    } finally {
      setIsRecipesLoading(false);
    }
  }, []);

  const showViewMore = totalCategoryItems > 8 || categories.length > 8;
  const displayCategories = showViewMore ? categories.slice(0, 8) : categories;
  const categoryWidth = (SCREEN_WIDTH - 48) / 3;

  const navigateToTagList = () => {
    props.navigation.navigate('MigratedRecipeTagList');
  };
  const navigateToCategoryList = () => {
    props.navigation.navigate('MigratedRecipeCategoryList');
  };
  const navigateToRecipeList = () => {
    props.navigation.navigate('MigratedRecipeListV2', { title: 'Recipes' });
  };

  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => props.navigation.goBack()} style={s.backBtn}>
          <Ionicons name="chevron-back" size={24} color={C.white} />
        </TouchableOpacity>
        <Text style={[s.headerTitle, styles.fontBold]}>Recipe</Text>
        <View style={s.backBtn} />
      </View>

      <ScrollView contentContainerStyle={s.scrollContent}>
        {/* Tags Section */}
        <TouchableOpacity style={s.sectionHeader} onPress={navigateToTagList}>
          <Text style={[s.sectionTitle, styles.fontBold]}>Tags</Text>
          <Ionicons name="chevron-forward" size={20} color={C.gray40} />
        </TouchableOpacity>
        <View style={{ marginBottom: 24 }}>
          {isTagsLoading ? (
            <ActivityIndicator size="small" color={C.brand5} style={{ paddingVertical: 16 }} />
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
                >
                  <Text style={[s.tagText, { color: C.brand5 }]}>{item.title}</Text>
                  {item.recipeTagImage ? (
                    <Image
                      source={{ uri: item.recipeTagImage }}
                      style={s.tagImage}
                    />
                  ) : null}
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Categories Section */}
        <TouchableOpacity style={s.sectionHeader} onPress={navigateToCategoryList}>
          <Text style={[s.sectionTitle, styles.fontBold]}>Categories</Text>
          <Ionicons name="chevron-forward" size={20} color={C.gray40} />
        </TouchableOpacity>
        <View style={{ marginBottom: 24 }}>
          {isCategoriesLoading ? (
            <ActivityIndicator size="small" color={C.brand5} style={{ paddingVertical: 16 }} />
          ) : categories.length === 0 ? null : (
            <View style={s.categoryGrid}>
              {displayCategories.map((item, index) => (
                <TouchableOpacity
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
                      style={[s.categoryImage, { width: categoryWidth, height: 100 }]}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={[s.categoryImage, { width: categoryWidth, height: 100, backgroundColor: C.surfaceLight }]} />
                  )}
                  <Text style={[s.categoryTitle, styles.fontBold]} numberOfLines={1}>
                    {item.title}
                  </Text>
                </TouchableOpacity>
              ))}
              {showViewMore && (
                <TouchableOpacity
                  style={[s.categoryCard, { width: categoryWidth }]}
                  onPress={navigateToCategoryList}
                >
                  <View style={[s.viewMoreBox, { width: categoryWidth, height: 100 }]}>
                    <Ionicons name="add" size={28} color={C.brand5} />
                  </View>
                  <Text style={[s.categoryTitle, styles.fontBold]}>View More</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>

        {/* Recipes Section */}
        <TouchableOpacity style={s.sectionHeader} onPress={navigateToRecipeList}>
          <Text style={[s.sectionTitle, styles.fontBold]}>Recipes</Text>
          <Ionicons name="chevron-forward" size={20} color={C.gray40} />
        </TouchableOpacity>
        <View style={{ marginBottom: 16 }}>
          {isRecipesLoading ? (
            <ActivityIndicator size="small" color={C.brand5} style={{ paddingVertical: 16 }} />
          ) : recipes.length === 0 ? null : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {recipes.map((item) => (
                <TouchableOpacity key={item.id} style={s.recipeCard} activeOpacity={0.7}>
                  {item.recipeImage ? (
                    <Image source={{ uri: item.recipeImage }} style={s.recipeImage} resizeMode="cover" />
                  ) : (
                    <View style={[s.recipeImage, { backgroundColor: C.surfaceLight }]} />
                  )}
                  <Text style={[s.recipeTitle, styles.fontBold]} numberOfLines={1}>
                    {item.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  backBtn: { width: 40, alignItems: 'center' },
  headerTitle: { fontSize: 18, color: C.white, flex: 1, textAlign: 'center' },
  scrollContent: { padding: 16 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 18, color: C.white },
  horizontalList: { paddingRight: 8 },
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
  tagText: { fontSize: 14 },
  tagImage: { width: 20, height: 20, borderRadius: 10, marginLeft: 8 },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  categoryCard: { marginBottom: 16 },
  categoryImage: { borderRadius: 12 },
  categoryTitle: { fontSize: 14, color: C.white, marginTop: 8 },
  viewMoreBox: {
    borderRadius: 12,
    backgroundColor: `${C.brand5}1A`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recipeCard: { width: 200, marginRight: 16 },
  recipeImage: { width: 200, height: 140, borderRadius: 12 },
  recipeTitle: { fontSize: 14, color: C.white, marginTop: 8 },
});

function useStyle() {
  return useResponsiveStyleSheet({
    fontBold: { fontFamily: FONT.bold },
    fontMedium: { fontFamily: FONT.medium },
    fontRegular: { fontFamily: FONT.regular },
    fontSemiBold: { fontFamily: FONT.semiBold },
  });
}

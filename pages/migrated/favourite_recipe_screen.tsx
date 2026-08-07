import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, FlatList, SafeAreaView, Dimensions, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useResponsiveStyleSheet } from '@helper/responsiveStyleSheet';
import { C, FONT } from './theme';
import { recipesApi } from '../../api/recipes';
import logger from '@helper/logger';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface RecipeItem {
  id: number;
  title: string;
  recipeImage: string;
  calories: number;
  protein?: number;
  carbs?: number;
  fats?: number;
  preparationTime?: string;
  recipeCategory?: string[];
  [key: string]: any;
}

interface FavouriteRecipeScreenProps {
  navigation: any;
}

export default function FavouriteRecipeScreen(props: FavouriteRecipeScreenProps) {

  const [recipeList, setRecipeList] = useState<RecipeItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [isLastPage, setIsLastPage] = useState(false);
  const _scrollController = useRef<FlatList | null>(null);

  const _fetchRecipes = useCallback(async () => {
    if (page === 1) setIsLoading(true);
    try {
      const value = await recipesApi.getFavourite(page);
      const items: RecipeItem[] = (value.data.data ?? []).map((r) => ({
        id: r.id,
        title: r.title,
        recipeImage: r.recipe_image || '',
        calories: r.calories,
        protein: r.protein,
        carbs: r.carbs,
        fats: r.fats,
        recipeCategory: r.recipe_category,
      }));
      if (page === 1) setRecipeList(items);
      else setRecipeList((prev) => [...prev, ...items]);
      setIsLastPage(value.data.pagination?.currentPage === value.data.pagination?.totalPages);
    } catch (e) {
      logger.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [page]);

  useEffect(() => {
    _fetchRecipes();
  }, [_fetchRecipes]);

  const handleEndReached = () => {
    if (!isLastPage && !isLoading) {
      setPage((prev) => prev + 1);
    }
  };

  const _showRecipeDetailBottomSheet = (item: RecipeItem) => {
    props.navigation.navigate('MigratedDietDetail', {
      recipeId: item.id,
      recipeImage: item.recipeImage,
    });
  };

  const renderRecipeItem = ({ item }: { item: RecipeItem }) => {
    const subtitle = item.recipeCategory
      ?.filter((t) => t?.length > 0)
      .join(', ') || '';

    return (
      <TouchableOpacity
        style={localStyles.recipeCard}
        onPress={() => _showRecipeDetailBottomSheet(item)}
        activeOpacity={0.7}
      >
        <View style={localStyles.recipeRow}>
          <Image
            source={{ uri: item.recipeImage || '' }}
            style={localStyles.recipeImage}
          />
          <View style={localStyles.recipeInfo}>
            <Text style={localStyles.recipeTitle} numberOfLines={1}>
              {item.title}
            </Text>
            {subtitle.length > 0 && (
              <Text style={localStyles.recipeSubtitle} numberOfLines={1}>
                {subtitle}
              </Text>
            )}
          </View>
          <View style={localStyles.recipeNutrition}>
            <Text style={localStyles.recipeCalories}>{item.calories} kcal</Text>
            {item.preparationTime ? (
              <Text style={localStyles.recipeTime}>{item.preparationTime} min</Text>
            ) : null}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={localStyles.container}>
      <View style={localStyles.appBar}>
        <TouchableOpacity onPress={() => props.navigation.goBack()} style={localStyles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={C.textPrimary} />
        </TouchableOpacity>
        <Text style={localStyles.appBarTitle}>Favourite Recipe</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={localStyles.body}>
        <FlatList
          ref={_scrollController}
          data={recipeList}
          renderItem={renderRecipeItem}
          keyExtractor={(item, index) => `${item.id}-${index}`}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.5}
          contentContainerStyle={{ padding: 16 }}
          ListEmptyComponent={
            !isLoading ? (
              <View style={localStyles.emptyContainer}>
                <Text style={localStyles.emptyText}>No favourite recipes found</Text>
              </View>
            ) : null
          }
        />
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
    paddingHorizontal: 8,
    paddingVertical: 12,
    backgroundColor: C.bg,
  },
  backBtn: { padding: 8 },
  appBarTitle: {
    flex: 1,
    fontFamily: FONT.bold,
    fontSize: 18,
    color: C.white,
    textAlign: 'center',
  },
  body: { flex: 1 },
  recipeCard: {
    backgroundColor: C.surfaceLight,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  recipeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recipeImage: {
    width: 60,
    height: 60,
    borderRadius: 10,
    backgroundColor: C.gray70,
  },
  recipeInfo: {
    flex: 1,
    marginLeft: 12,
  },
  recipeTitle: {
    fontFamily: FONT.bold,
    fontSize: 14,
    color: C.white,
  },
  recipeSubtitle: {
    fontFamily: FONT.regular,
    fontSize: 12,
    color: C.gray30,
    marginTop: 4,
  },
  recipeNutrition: {
    alignItems: 'flex-end',
    marginLeft: 8,
  },
  recipeCalories: {
    fontFamily: FONT.regular,
    fontSize: 12,
    color: C.gray30,
  },
  recipeTime: {
    fontFamily: FONT.regular,
    fontSize: 12,
    color: C.gray30,
    marginTop: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontFamily: FONT.regular,
    fontSize: 14,
    color: C.gray30,
  },
  loaderContainer: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
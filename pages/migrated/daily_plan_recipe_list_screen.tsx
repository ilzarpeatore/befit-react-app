import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput, FlatList, SafeAreaView, Alert, Dimensions, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useResponsiveStyleSheet } from '@helper/responsiveStyleSheet';
import { C, FONT } from './theme';
import { recipesApi } from '../../api/recipes';
import { dietApi } from '../../api/diet';

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
  recipeCategory?: { title: string }[];
  [key: string]: any;
}

interface DailyPlanRecipeListScreenProps {
  navigation: any;
  route: {
    params: {
      mealType: string;
      dailyPlanId?: number;
      date?: string;
    };
  };
}

export default function DailyPlanRecipeListScreen(props: DailyPlanRecipeListScreenProps) {
  const { mealType = 'breakfast', dailyPlanId, date } = props.route.params ?? {};

  const [searchText, setSearchText] = useState('');
  const [recipeList, setRecipeList] = useState<RecipeItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [isLastPage, setIsLastPage] = useState(false);
  const [isFavourite, setIsFavourite] = useState<number | null>(null);
  const _scrollController = useRef<FlatList | null>(null);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  const _fetchRecipes = useCallback(async (searchTerm?: string) => {
    if (page === 1) setIsLoading(true);
    try {
      const params: Record<string, any> = {
        meal_type: [mealType],
        page,
        per_page: 20,
      };
      const term = searchTerm ?? searchText;
      if (term) params.title = term;
      if (isFavourite === 1) params.is_favourite = 1;

      const value = await recipesApi.getFilteredList(params);
      const items: RecipeItem[] = (value.data.data ?? []).map((r: any) => ({
        id: r.id,
        title: r.title,
        recipeImage: r.recipe_image,
        calories: r.calories,
        protein: r.protein,
        carbs: r.carbs,
        fats: r.fats,
        preparationTime: r.preparation_time,
        recipeCategory: (r.recipe_category ?? []).map((name: string) => ({ title: name })),
      }));
      if (page === 1) setRecipeList(items);
      else setRecipeList((prev) => [...prev, ...items]);
      setIsLastPage((value.data.pagination?.currentPage ?? 1) >= (value.data.pagination?.totalPages ?? 1));
    } catch (e) {
      console.log('Error fetching recipes', e);
    } finally {
      setIsLoading(false);
    }
  }, [page, mealType, searchText, isFavourite]);

  useEffect(() => {
    _fetchRecipes();
  }, []);

  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setPage(1);
      setRecipeList([]);
      _fetchRecipes(searchText);
    }, 500);
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [searchText]);

  const handleEndReached = () => {
    if (!isLastPage && !isLoading) {
      setPage(prev => prev + 1);
      _fetchRecipes();
    }
  };

  const toggleFavourite = () => {
    setIsFavourite(prev => (prev === 1 ? null : 1));
    setPage(1);
    setRecipeList([]);
    _fetchRecipes();
  };

  const handleSearchSubmit = () => {
    setPage(1);
    setRecipeList([]);
    _fetchRecipes(searchText);
  };

  const _showRecipeDetailBottomSheet = async (item: RecipeItem) => {
    try {
      let planId: number | null = dailyPlanId ?? null;
      if (!planId) {
        const planRes = await dietApi.getDailyPlan(date ?? new Date().toISOString().split('T')[0]);
        planId = planRes.data?.data?.id ?? null;
      }
      if (!planId) {
        Alert.alert('Error', 'Could not resolve the daily plan for this date.');
        return;
      }
      await recipesApi.saveDailyPlanRecipe(planId, item.id, mealType);
      props.navigation.goBack();
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'Failed to add recipe to your plan');
    }
  };

  const renderRecipeItem = ({ item }: { item: RecipeItem }) => {
    const subtitle = item.recipeCategory
      ?.map((e) => e.title)
      .filter((t) => t?.length > 0)
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
        <Text style={localStyles.appBarTitle}>
          {mealType.charAt(0).toUpperCase() + mealType.slice(1)}
        </Text>
        <View style={localStyles.appBarActions}>
          <TouchableOpacity onPress={toggleFavourite} style={localStyles.iconBtn}>
            <Ionicons
              name={isFavourite === 1 ? 'heart' : 'heart-outline'}
              size={22}
              color={isFavourite === 1 ? C.red : C.gray30}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              // Show filter bottom sheet
            }}
            style={localStyles.iconBtn}
          >
            <Ionicons name="filter" size={22} color={C.gray30} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={localStyles.searchContainer}>
        <View style={localStyles.searchBox}>
          <Ionicons name="search" size={18} color={C.gray30} style={{ marginRight: 8 }} />
          <TextInput
            style={localStyles.searchInput}
            placeholder="Search..."
            placeholderTextColor={C.gray30}
            value={searchText}
            onChangeText={setSearchText}
            onSubmitEditing={handleSearchSubmit}
            returnKeyType="search"
          />
        </View>
      </View>

      <View style={localStyles.body}>
        <FlatList
          ref={_scrollController}
          data={recipeList}
          renderItem={renderRecipeItem}
          keyExtractor={(item, index) => `${item.id}-${index}`}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.5}
          contentContainerStyle={{ paddingBottom: 20 }}
          ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
          ListEmptyComponent={
            !isLoading ? (
              <View style={localStyles.emptyContainer}>
                <Text style={localStyles.emptyText}>No data found</Text>
              </View>
            ) : null
          }
        />
        {isLoading && (
          <View style={localStyles.loaderContainer}>
            <ActivityIndicator size="large" color={C.brand5} />
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
    fontSize: 18,
    color: C.white,
  },
  appBarActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBtn: {
    padding: 8,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.surfaceLight,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchInput: {
    flex: 1,
    fontFamily: FONT.regular,
    fontSize: 14,
    color: C.white,
  },
  body: { flex: 1, paddingHorizontal: 16 },
  recipeCard: {
    backgroundColor: C.surfaceLight,
    borderRadius: 12,
    padding: 12,
  },
  recipeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recipeImage: {
    width: 48,
    height: 48,
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

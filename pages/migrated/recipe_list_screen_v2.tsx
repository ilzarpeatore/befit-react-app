import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, FlatList, SafeAreaView, ActivityIndicator, Dimensions, Modal, Pressable, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useResponsiveStyleSheet } from '@helper/responsiveStyleSheet';
import { C, FONT } from './theme';
import { recipesApi } from '../../api/recipes';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface RecipeItem {
  id: number;
  title: string;
  recipeImage?: string;
  calories?: number;
}

const MEAL_TYPE_OPTIONS = ['breakfast', 'lunch', 'dinner', 'snacks'];

interface RecipeFilterModel {
  mealTypes?: string[];
  recipeCategoryIds?: number[];
  recipeTagIds?: number[];
  startCalories?: number;
  endCalories?: number;
  startProtein?: number;
  endProtein?: number;
  startCarbs?: number;
  endCarbs?: number;
  startFats?: number;
  endFats?: number;
  minPreparationTime?: number;
  maxPreparationTime?: number;
  isFavourite?: number | null;
}

interface ApiResponse {
  data: RecipeItem[];
  pagination?: { totalPages: number };
}

interface Props {
  categoryId?: number;
  tagId?: number;
  title: string;
}

export default function RecipeListScreenV2(props: any) {
  const { categoryId, tagId, title }: Props = props.route?.params ?? {};
  const [recipeList, setRecipeList] = useState<RecipeItem[]>([]);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isLastPage, setIsLastPage] = useState(false);
  const [filter, setFilter] = useState<RecipeFilterModel>({});
  const [showFilterSheet, setShowFilterSheet] = useState(false);
  const [mealTypeDraft, setMealTypeDraft] = useState<string[]>([]);
  const [calMinDraft, setCalMinDraft] = useState('');
  const [calMaxDraft, setCalMaxDraft] = useState('');
  const scrollRef = useRef<ScrollView>(null);
  const styles = useStyle();

  useEffect(() => {
    loadRecipes();
  }, [page, filter]);

  useEffect(() => {
    const scrollListener = scrollRef.current;
    // In React Native we handle infinite scroll via onScroll
  }, []);

  const loadRecipes = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await recipesApi.getFilteredList({
        meal_type: filter.mealTypes,
        recipe_category_ids: filter.recipeCategoryIds ?? (categoryId ? [categoryId] : undefined),
        recipe_tag_ids: filter.recipeTagIds ?? (tagId ? [tagId] : undefined),
        start_calories: filter.startCalories,
        end_calories: filter.endCalories,
        start_protein: filter.startProtein,
        end_protein: filter.endProtein,
        start_carbs: filter.startCarbs,
        end_carbs: filter.endCarbs,
        start_fats: filter.startFats,
        end_fats: filter.endFats,
        min_preparation_time: filter.minPreparationTime,
        max_preparation_time: filter.maxPreparationTime,
        is_favourite: filter.isFavourite ?? undefined,
        page,
      });
      const items = (res.data.data ?? []).map((r) => ({
        id: r.id,
        title: r.title,
        recipeImage: r.recipe_image ?? undefined,
        calories: r.calories,
      }));
      if (page === 1) {
        setRecipeList(items);
      } else {
        setRecipeList((prev) => [...prev, ...items]);
      }
      const totalPages = res.data.pagination?.totalPages ?? 1;
      setIsLastPage(page >= totalPages);
    } catch (e: any) {
      // toast(e.toString());
    } finally {
      setIsLoading(false);
    }
  }, [page, filter, categoryId, tagId]);

  const handleScroll = (event: any) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const paddingToBottom = 20;
    if (layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom) {
      if (!isLastPage && !isLoading) {
        setPage((prev) => prev + 1);
      }
    }
  };

  const toggleFavourite = () => {
    setFilter((prev) => ({
      ...prev,
      isFavourite: prev.isFavourite === 1 ? null : 1,
    }));
    setPage(1);
    setRecipeList([]);
  };

  const columnWidth = (SCREEN_WIDTH - 48) / 2;

  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => props.navigation.goBack()} style={s.backBtn}>
          <Ionicons name="chevron-back" size={24} color={C.white} />
        </TouchableOpacity>
        <Text style={[s.headerTitle, styles.fontBold]}>{title}</Text>
        <View style={s.headerActions}>
          <TouchableOpacity onPress={toggleFavourite} style={s.iconBtn}>
            <Ionicons
              name={filter.isFavourite === 1 ? 'heart' : 'heart-outline'}
              size={24}
              color={filter.isFavourite === 1 ? C.red : C.white}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowFilterSheet(true)} style={s.iconBtn}>
            <Ionicons name="filter-outline" size={24} color={C.white} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={s.body}>
        {isLoading && page === 1 ? (
          <View style={s.center}>
            <ActivityIndicator size="large" color={C.brand5} />
          </View>
        ) : !isLoading && recipeList.length === 0 ? (
          <View style={s.center}>
            <Text style={[s.emptyText, styles.fontMedium]}>No recipes found</Text>
          </View>
        ) : (
          <ScrollView
            ref={scrollRef}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            contentContainerStyle={s.scrollContent}
          >
            <View style={s.grid}>
              {recipeList.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={[s.recipeCard, { width: columnWidth }]}
                  activeOpacity={0.7}
                  onPress={() => props.navigation.navigate('MigratedDietDetail', { recipeId: item.id })}
                >
                  {item.recipeImage ? (
                    <Image
                      source={{ uri: item.recipeImage }}
                      style={[s.recipeImage, { width: columnWidth, height: 140 }]}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={[s.recipeImage, { width: columnWidth, height: 140, backgroundColor: C.surfaceLight }]} />
                  )}
                  <Text style={[s.recipeTitle, styles.fontBold]} numberOfLines={1}>
                    {item.title}
                  </Text>
                  {item.calories != null && (
                    <Text style={[s.recipeCalories, styles.fontRegular]}>
                      {item.calories} kcal
                    </Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
            {isLoading && page > 1 && (
              <ActivityIndicator size="small" color={C.brand5} style={{ marginVertical: 16 }} />
            )}
          </ScrollView>
        )}
      </View>

      <Modal
        visible={showFilterSheet}
        transparent
        animationType="slide"
        onShow={() => {
          setMealTypeDraft(filter.mealTypes ?? []);
          setCalMinDraft(filter.startCalories != null ? String(filter.startCalories) : '');
          setCalMaxDraft(filter.endCalories != null ? String(filter.endCalories) : '');
        }}
      >
        <Pressable style={s.modalOverlay} onPress={() => setShowFilterSheet(false)}>
          <Pressable style={s.filterSheet} onPress={(e) => e.stopPropagation()}>
            <View style={s.filterHandle} />
            <Text style={[s.filterTitle, styles.fontBold]}>Filters</Text>

            <Text style={[s.filterLabel, styles.fontSemiBold]}>Meal Type</Text>
            <View style={s.chipsRow}>
              {MEAL_TYPE_OPTIONS.map((mt) => {
                const selected = mealTypeDraft.includes(mt);
                return (
                  <TouchableOpacity
                    key={mt}
                    style={[s.chip, selected && s.chipSelected]}
                    onPress={() =>
                      setMealTypeDraft((prev) =>
                        prev.includes(mt) ? prev.filter((v) => v !== mt) : [...prev, mt]
                      )
                    }
                  >
                    <Text style={[s.chipText, selected && s.chipTextSelected, styles.fontMedium]}>
                      {mt.charAt(0).toUpperCase() + mt.slice(1)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={[s.filterLabel, styles.fontSemiBold]}>Calories (kcal)</Text>
            <View style={s.rangeRow}>
              <TextInput
                style={s.rangeInput}
                placeholder="Min"
                placeholderTextColor={C.gray40}
                keyboardType="numeric"
                value={calMinDraft}
                onChangeText={setCalMinDraft}
              />
              <Text style={[s.rangeSeparator, styles.fontRegular]}>-</Text>
              <TextInput
                style={s.rangeInput}
                placeholder="Max"
                placeholderTextColor={C.gray40}
                keyboardType="numeric"
                value={calMaxDraft}
                onChangeText={setCalMaxDraft}
              />
            </View>

            <TouchableOpacity
              style={s.applyBtn}
              onPress={() => {
                setFilter((prev) => ({
                  ...prev,
                  mealTypes: mealTypeDraft.length > 0 ? mealTypeDraft : undefined,
                  startCalories: calMinDraft ? Number(calMinDraft) : undefined,
                  endCalories: calMaxDraft ? Number(calMaxDraft) : undefined,
                }));
                setShowFilterSheet(false);
                setPage(1);
                setRecipeList([]);
              }}
            >
              <Text style={[s.applyBtnText, styles.fontSemiBold]}>Apply Filters</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  backBtn: { width: 40, alignItems: 'center' },
  headerTitle: { fontSize: 18, color: C.white, flex: 1, textAlign: 'center' },
  headerActions: { flexDirection: 'row', alignItems: 'center' },
  iconBtn: { padding: 8 },
  body: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 16, color: C.gray30 },
  scrollContent: { padding: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  recipeCard: { marginBottom: 16 },
  recipeImage: { borderRadius: 12 },
  recipeTitle: { fontSize: 14, color: C.white, marginTop: 8 },
  recipeCalories: { fontSize: 12, color: C.gray30, marginTop: 4 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  filterSheet: { backgroundColor: C.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 },
  filterHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: C.gray60, alignSelf: 'center', marginBottom: 16 },
  filterTitle: { fontSize: 20, color: C.white, marginBottom: 16 },
  filterLabel: { fontSize: 14, color: C.gray30, marginTop: 16, marginBottom: 10 },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap' },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: C.gray60,
    marginRight: 8,
    marginBottom: 8,
  },
  chipSelected: { backgroundColor: C.brand5, borderColor: C.brand5 },
  chipText: { fontSize: 13, color: C.gray30 },
  chipTextSelected: { color: C.white },
  rangeRow: { flexDirection: 'row', alignItems: 'center' },
  rangeInput: {
    flex: 1,
    backgroundColor: C.surfaceLight,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: C.white,
    fontSize: 14,
  },
  rangeSeparator: { color: C.gray30, marginHorizontal: 12 },
  applyBtn: { backgroundColor: C.brand5, borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 24 },
  applyBtnText: { fontSize: 16, color: C.white },
});

function useStyle() {
  return useResponsiveStyleSheet({
    fontBold: { fontFamily: FONT.bold },
    fontMedium: { fontFamily: FONT.medium },
    fontRegular: { fontFamily: FONT.regular },
    fontSemiBold: { fontFamily: FONT.semiBold },
  });
}

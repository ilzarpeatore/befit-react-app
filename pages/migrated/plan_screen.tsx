import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, ActivityIndicator, Alert, FlatList, Modal, TextInput, Image, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useResponsiveStyleSheet } from '@helper/responsiveStyleSheet';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { C, FONT } from './theme';
import { dietApi } from '../../api/diet';
import { recipesApi, RecipeListItem } from '../../api/recipes';
import logger from '@helper/logger';

function formatDateYMD(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

const GRAPH_CARD_HEIGHT = 260;

const MEAL_TYPES: Record<string, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snacks: 'Snacks',
};

interface MealTotal {
  totalCalories?: number;
  totalProtein?: number;
  totalCarbs?: number;
  totalFats?: number;
}

interface DailyPlanRecipeItem {
  id?: number;
  dailyPlanId?: number;
  recipeId?: number;
  mealType?: string;
  isComplete?: boolean;
  recipeName?: string;
  recipeImage?: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fats?: number;
  isCoachAssigned?: boolean;
  assignedByName?: string;
}

function getWeekDays(weekOffset: number): Date[] {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const startOfCurrentWeek = new Date(now);
  startOfCurrentWeek.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
  const startOfWeek = new Date(startOfCurrentWeek);
  startOfWeek.setDate(startOfCurrentWeek.getDate() + weekOffset * 7);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    return d;
  });
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function formatDay(d: Date): string {
  return d.getDate().toString();
}

function formatWeekday(d: Date): string {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return days[(d.getDay() + 6) % 7];
}

export default function PlanScreen(props: any) {

  const [kcalTarget, setKcalTarget] = useState(1331);
  const [kcalFrom, setKcalFrom] = useState(0);
  const [kcalTo, setKcalTo] = useState(0);
  const [proteinTarget, setProteinTarget] = useState(74);
  const [carbsTarget, setCarbsTarget] = useState(159);
  const [fatsTarget, setFatsTarget] = useState(44);

  const [kcalCurrent, setKcalCurrent] = useState(0);
  const [proteinCurrent, setProteinCurrent] = useState(0);
  const [carbsCurrent, setCarbsCurrent] = useState(0);
  const [fatsCurrent, setFatsCurrent] = useState(0);

  const [mealTotals, setMealTotals] = useState<Record<string, MealTotal>>({});
  const [mealRecipes, setMealRecipes] = useState<Record<string, DailyPlanRecipeItem[]>>({});
  const [dailyPlanId, setDailyPlanId] = useState<number | null>(null);

  const [selectedDay, setSelectedDay] = useState(new Date());
  const [showCompactSummary, setShowCompactSummary] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [plannedDays, setPlannedDays] = useState<string[]>([]);
  const [weekOffset, setWeekOffset] = useState(0);

  const [addMealFor, setAddMealFor] = useState<{ key: string; label: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<RecipeListItem[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchLoadingMore, setSearchLoadingMore] = useState(false);
  const [searchPage, setSearchPage] = useState(1);
  const [searchIsLastPage, setSearchIsLastPage] = useState(false);
  const [savingRecipeId, setSavingRecipeId] = useState<number | null>(null);

  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    fetchDailyPlan();
  }, [selectedDay]);

  useFocusEffect(
    useCallback(() => {
      fetchDailyPlan();
    }, [selectedDay])
  );

  const applyDailyPlanResponse = (value: any) => {
    const data = value?.data;
    if (!data) return;

    setDailyPlanId(data.id ?? null);

    const goals = data.daily_plan ?? {};
    setKcalTarget(goals.kCal ?? 0);
    setProteinTarget(goals.protein?.target ?? 0);
    setCarbsTarget(goals.carbs?.target ?? 0);
    setFatsTarget(goals.fat?.target ?? 0);

    setKcalCurrent(data.calories ?? 0);
    setProteinCurrent(data.protein ?? 0);
    setCarbsCurrent(data.carbs ?? 0);
    setFatsCurrent(data.fats ?? 0);

    const totals: Record<string, MealTotal> = {};
    (data.meal_type ?? []).forEach((m: any) => {
      totals[m.key] = {
        totalCalories: m.total?.total_calories ?? 0,
        totalProtein: m.total?.total_protein ?? 0,
        totalCarbs: m.total?.total_carbs ?? 0,
        totalFats: m.total?.total_fats ?? 0,
      };
    });
    setMealTotals(totals);

    const recipesByMeal: Record<string, DailyPlanRecipeItem[]> = {};
    const dailyPlanRecipe = value?.daily_plan_recipe ?? {};
    Object.keys(dailyPlanRecipe).forEach((key) => {
      recipesByMeal[key] = (dailyPlanRecipe[key] ?? []).map((entry: any) => ({
        id: entry.id,
        dailyPlanId: entry.daily_plan_id,
        recipeId: entry.recipe_id,
        mealType: entry.meal_type,
        isComplete: !!entry.is_complete,
        recipeName: entry.recipe?.title,
        recipeImage: entry.recipe?.recipe_image ?? undefined,
        calories: entry.calories,
        protein: entry.protein,
        carbs: entry.carbs,
        fats: entry.fats,
        isCoachAssigned: !!entry.is_coach_assigned,
        assignedByName: entry.assigned_by?.name,
      }));
    });
    setMealRecipes(recipesByMeal);

    setPlannedDays(value?.day_has_daily_plan ?? []);
  };

  const fetchDailyPlan = async () => {
    setIsLoading(true);
    try {
      const res = await dietApi.getDailyPlan(formatDateYMD(selectedDay));
      applyDailyPlanResponse(res.data);
    } catch (e) {
      logger.error('Plan fetch error:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const proteinProgress = proteinTarget > 0 ? Math.min(proteinCurrent / proteinTarget, 1) : 0;
  const carbsProgress = carbsTarget > 0 ? Math.min(carbsCurrent / carbsTarget, 1) : 0;
  const fatsProgress = fatsTarget > 0 ? Math.min(fatsCurrent / fatsTarget, 1) : 0;
  const kcalProgress = kcalTarget > 0 ? Math.min(kcalCurrent / kcalTarget, 1) : 0;

  const toggleRecipeCompletion = async (item: DailyPlanRecipeItem, mealType: string) => {
    if (!item.id || !item.dailyPlanId || !item.recipeId) {
      Alert.alert('Error', 'Missing required information');
      return;
    }
    setIsLoading(true);
    try {
      const response = await recipesApi.updateDailyPlanRecipe(
        item.id,
        item.dailyPlanId,
        item.recipeId,
        mealType,
        !(item.isComplete ?? false)
      );
      applyDailyPlanResponse(response.data);
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'Failed to update');
    } finally {
      setIsLoading(false);
    }
  };

  const openRecipeDetail = (recipe: DailyPlanRecipeItem) => {
    if (!recipe.recipeId) return;
    props.navigation?.navigate('MigratedDietDetail', {
      recipeId: recipe.recipeId,
      recipeImage: recipe.recipeImage,
    });
  };

  const clearDailyPlan = () => {
    if (!dailyPlanId) return;
    Alert.alert('Clear Plan', 'Are you sure you want to clear all recipes for this day?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear',
        style: 'destructive',
        onPress: async () => {
          setIsLoading(true);
          try {
            await recipesApi.deleteAllDailyPlanRecipes(dailyPlanId);
            await fetchDailyPlan();
          } catch (e) {
            Alert.alert('Error', 'Failed to clear plan');
          } finally {
            setIsLoading(false);
          }
        },
      },
    ]);
  };

  const searchRecipes = useCallback(async (mealKey: string, query: string, page: number) => {
    if (page === 1) {
      setSearchLoading(true);
    } else {
      setSearchLoadingMore(true);
    }
    try {
      const res = await recipesApi.getFilteredList({
        meal_type: [mealKey],
        title: query || undefined,
        per_page: 20,
        page,
      });
      const items = res.data?.data ?? [];
      setSearchResults((prev) => (page === 1 ? items : [...prev, ...items]));
      const totalPages = res.data?.pagination?.totalPages ?? 1;
      setSearchIsLastPage(page >= totalPages);
    } catch {
      if (page === 1) setSearchResults([]);
    } finally {
      setSearchLoading(false);
      setSearchLoadingMore(false);
    }
  }, []);

  const openAddMeal = useCallback(
    (key: string, label: string) => {
      setAddMealFor({ key, label });
      setSearchQuery('');
      setSearchResults([]);
      setSearchPage(1);
      setSearchIsLastPage(false);
      searchRecipes(key, '', 1);
    },
    [searchRecipes]
  );

  useEffect(() => {
    if (!addMealFor) return;
    const timeout = setTimeout(() => {
      setSearchPage(1);
      setSearchIsLastPage(false);
      searchRecipes(addMealFor.key, searchQuery, 1);
    }, 350);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, addMealFor]);

  const handleSearchScroll = (event: any) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const paddingToBottom = 40;
    if (layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom) {
      if (!searchIsLastPage && !searchLoading && !searchLoadingMore && addMealFor) {
        const nextPage = searchPage + 1;
        setSearchPage(nextPage);
        searchRecipes(addMealFor.key, searchQuery, nextPage);
      }
    }
  };

  const addRecipeToPlan = async (recipe: RecipeListItem) => {
    if (!dailyPlanId || !addMealFor) return;
    setSavingRecipeId(recipe.id);
    try {
      await recipesApi.saveDailyPlanRecipe(dailyPlanId, recipe.id, addMealFor.key);
      setAddMealFor(null);
      await fetchDailyPlan();
    } catch {
      Alert.alert('Error', 'Could not add this meal. Please try again.');
    } finally {
      setSavingRecipeId(null);
    }
  };

  const renderWeekDays = (offset: number) => {
    const days = getWeekDays(offset);
    return (
      <View style={s.weekStrip}>
        {days.map((day, i) => {
          const isSelected = isSameDay(day, selectedDay);
          const isToday = isSameDay(day, new Date());
          return (
            <TouchableOpacity
              key={i}
              style={[s.weekDayItem, isSelected && s.weekDayItemSelected]}
              onPress={() => setSelectedDay(day)}
            >
              <Text style={[s.weekDayLabel, isSelected && s.weekDayLabelSelected]}>{formatWeekday(day)}</Text>
              <Text style={[s.weekDayNum, isSelected && s.weekDayNumSelected, isToday && !isSelected && s.weekDayToday]}>{formatDay(day)}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  const renderCompactStat = (label: string, value: string, progress: number) => (
    <View style={s.compactStat}>
      <Text style={s.compactStatLabel}>{label}</Text>
      <Text style={s.compactStatValue}>{value}</Text>
      <View style={s.compactProgressBar}>
        <View style={[s.compactProgressFill, { width: `${progress * 100}%` }]} />
      </View>
    </View>
  );

  const renderNutrientGraph = () => (
    <View style={s.nutrientCard}>
      <View style={s.kcalSection}>
        <Text style={s.kcalValue}>{kcalCurrent}</Text>
        <Text style={s.kcalTarget}>/ {kcalTarget} kcal</Text>
      </View>
      <View style={s.nutrientRow}>
        {[
          { label: 'Protein', current: proteinCurrent, target: proteinTarget, progress: proteinProgress, color: C.textPrimary },
          { label: 'Carbs', current: carbsCurrent, target: carbsTarget, progress: carbsProgress, color: C.orange },
          { label: 'Fat', current: fatsCurrent, target: fatsTarget, progress: fatsProgress, color: C.red },
        ].map((n, i) => (
          <View key={i} style={s.nutrientItem}>
            <Text style={s.nutrientLabel}>{n.label}</Text>
            <Text style={s.nutrientValue}>{n.current}g</Text>
            <Text style={s.nutrientTarget}>of {n.target}g</Text>
            <View style={s.nutrientBar}>
              <View style={[s.nutrientBarFill, { width: `${n.progress * 100}%`, backgroundColor: n.color }]} />
            </View>
          </View>
        ))}
      </View>
    </View>
  );

  const renderMealSection = (key: string, displayName: string) => {
    const total = mealTotals[key] ?? {};
    const recipes = mealRecipes[key] ?? [];
    return (
      <View key={key} style={s.mealSection}>
        <View style={s.mealHeader}>
          <View>
            <Text style={s.mealTitle}>{displayName}</Text>
            <Text style={s.mealCalories}>{total.totalCalories ?? 0} kcal | P: {total.totalProtein ?? 0}g | C: {total.totalCarbs ?? 0}g | F: {total.totalFats ?? 0}g</Text>
          </View>
          <TouchableOpacity style={s.addMealBtn} onPress={() => openAddMeal(key, displayName)}>
            <Ionicons name="add-circle-outline" size={24} color={C.textPrimary} />
          </TouchableOpacity>
        </View>
        {recipes.length === 0 ? (
          <Text style={s.emptyMealText}>No {displayName.toLowerCase()} logged yet.</Text>
        ) : (
          recipes.map((recipe, i) => (
            <View key={i} style={s.recipeItem}>
              <TouchableOpacity
                style={s.recipeItemTouchable}
                activeOpacity={0.7}
                onPress={() => openRecipeDetail(recipe)}
              >
                {recipe.recipeImage ? (
                  <Image source={{ uri: recipe.recipeImage }} style={s.recipeImage} />
                ) : (
                  <View style={s.recipeImage} />
                )}
                <View style={s.recipeInfo}>
                  <Text style={s.recipeName} numberOfLines={1}>{recipe.recipeName ?? 'Recipe'}</Text>
                  <View style={s.recipeMacrosRow}>
                    <Text style={s.recipeMacroCal}>{recipe.calories ?? 0} kcal</Text>
                    <Text style={s.recipeMacro}>P {recipe.protein ?? 0}g</Text>
                    <Text style={s.recipeMacro}>C {recipe.carbs ?? 0}g</Text>
                    <Text style={s.recipeMacro}>F {recipe.fats ?? 0}g</Text>
                  </View>
                  {recipe.isCoachAssigned && (
                    <View style={s.coachBadge}>
                      <Ionicons name="ribbon-outline" size={11} color={C.orange} />
                      <Text style={s.coachBadgeText}>
                        Assigned by {recipe.assignedByName ?? 'your coach'}
                      </Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => toggleRecipeCompletion(recipe, key)}>
                <Ionicons
                  name={recipe.isComplete ? 'checkmark-circle' : 'ellipse-outline'}
                  size={22}
                  color={recipe.isComplete ? C.success : C.gray40}
                />
              </TouchableOpacity>
            </View>
          ))
        )}
      </View>
    );
  };

  return (
    <View style={s.container}>
      <View style={s.appBar}>
        <TouchableOpacity onPress={() => props.navigation?.goBack()} style={s.backBtn}>
          <Ionicons name="chevron-back" size={24} color={C.textPrimary} />
        </TouchableOpacity>
        <Text style={s.appBarTitle}>Daily Plan</Text>
        <TouchableOpacity onPress={clearDailyPlan} style={s.clearBtn}>
          <Ionicons name="trash-outline" size={20} color={C.destructive} />
        </TouchableOpacity>
      </View>
      <View style={s.weekdayPicker}>
        <TouchableOpacity onPress={() => setWeekOffset(prev => prev - 1)} style={s.weekNavBtn}>
          <Ionicons name="chevron-back" size={20} color={C.gray30} />
        </TouchableOpacity>
        {renderWeekDays(weekOffset)}
        <TouchableOpacity onPress={() => setWeekOffset(prev => prev + 1)} style={s.weekNavBtn}>
          <Ionicons name="chevron-forward" size={20} color={C.gray30} />
        </TouchableOpacity>
      </View>
      {showCompactSummary && (
        <View style={s.compactBar}>
          {renderCompactStat('Kcal', `${kcalCurrent}/${kcalTarget}`, kcalProgress)}
          {renderCompactStat('Protein', `${proteinCurrent}/${proteinTarget}g`, proteinProgress)}
          {renderCompactStat('Carbs', `${carbsCurrent}/${carbsTarget}g`, carbsProgress)}
          {renderCompactStat('Fat', `${fatsCurrent}/${fatsTarget}g`, fatsProgress)}
        </View>
      )}
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={s.scrollContent}
        onScroll={(e) => {
          const show = e.nativeEvent.contentOffset.y > GRAPH_CARD_HEIGHT * 0.3;
          if (show !== showCompactSummary) setShowCompactSummary(show);
        }}
        scrollEventThrottle={16}
      >
        {renderNutrientGraph()}
        {Object.entries(MEAL_TYPES).map(([key, displayName]) => renderMealSection(key, displayName))}
      </ScrollView>
      {isLoading && (
        <View style={s.loadingOverlay}>
          <ActivityIndicator size="large" color={C.textPrimary} />
        </View>
      )}

      <Modal visible={!!addMealFor} animationType="slide" onRequestClose={() => setAddMealFor(null)}>
        <KeyboardAvoidingView
          style={[s.modalSheet, { paddingTop: insets.top + 12 }]}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={s.modalHeaderRow}>
            <Text style={s.modalTitle}>Add to {addMealFor?.label ?? ''}</Text>
            <TouchableOpacity onPress={() => setAddMealFor(null)} style={s.modalCloseBtn}>
              <Ionicons name="close" size={26} color={C.white} />
            </TouchableOpacity>
          </View>
          <TextInput
            style={s.searchInput}
            placeholder="Search recipes..."
            placeholderTextColor={C.gray40}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
          />
          {searchLoading ? (
            <ActivityIndicator size="small" color={C.textPrimary} style={{ marginTop: 20 }} />
          ) : searchResults.length === 0 ? (
            <Text style={s.noResultsText}>No recipes found.</Text>
          ) : (
            <ScrollView
              style={s.searchResultsScroll}
              onScroll={handleSearchScroll}
              scrollEventThrottle={16}
              keyboardShouldPersistTaps="handled"
            >
              {searchResults.map((recipe) => (
                <TouchableOpacity
                  key={recipe.id}
                  style={s.searchResultRow}
                  disabled={savingRecipeId === recipe.id}
                  onPress={() => addRecipeToPlan(recipe)}
                >
                  {recipe.recipe_image ? (
                    <Image source={{ uri: recipe.recipe_image }} style={s.searchResultImage} />
                  ) : (
                    <View style={s.searchResultImage} />
                  )}
                  <View style={{ flex: 1 }}>
                    <Text style={s.searchResultTitle} numberOfLines={1}>{recipe.title}</Text>
                    <Text style={s.searchResultMeta}>{recipe.calories} kcal</Text>
                  </View>
                  {savingRecipeId === recipe.id ? (
                    <ActivityIndicator size="small" color={C.textPrimary} />
                  ) : (
                    <Ionicons name="add-circle-outline" size={26} color={C.textPrimary} />
                  )}
                </TouchableOpacity>
              ))}
              {searchLoadingMore && (
                <ActivityIndicator size="small" color={C.textPrimary} style={{ marginVertical: 16 }} />
              )}
            </ScrollView>
          )}
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  appBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 48, paddingBottom: 12, backgroundColor: C.surface },
  backBtn: { padding: 4 },
  appBarTitle: { fontSize: 18, fontFamily: FONT.bold, color: C.white },
  clearBtn: { padding: 4 },
  weekdayPicker: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.surface, paddingBottom: 8 },
  weekNavBtn: { paddingHorizontal: 4, paddingVertical: 8 },
  weekStrip: { flex: 1, flexDirection: 'row', justifyContent: 'space-around' },
  weekDayItem: { alignItems: 'center', paddingVertical: 8, paddingHorizontal: 6, borderRadius: 12 },
  weekDayItemSelected: { backgroundColor: C.brand5 },
  weekDayLabel: { fontSize: 11, fontFamily: FONT.medium, color: C.gray40, marginBottom: 4 },
  weekDayLabelSelected: { color: C.white },
  weekDayNum: { fontSize: 16, fontFamily: FONT.semiBold, color: C.gray40 },
  weekDayNumSelected: { color: C.white },
  weekDayToday: { color: C.textPrimary },
  compactBar: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: C.surface, marginHorizontal: 16, marginBottom: 8, borderRadius: 12, padding: 12 },
  compactStat: { alignItems: 'flex-start' },
  compactStatLabel: { fontSize: 10, color: C.gray40, fontFamily: FONT.regular },
  compactStatValue: { fontSize: 11, fontFamily: FONT.bold, color: C.white, marginTop: 2 },
  compactProgressBar: { height: 3, width: 45, backgroundColor: C.gray70, borderRadius: 2, marginTop: 4, overflow: 'hidden' },
  compactProgressFill: { height: 3, backgroundColor: C.brand5, borderRadius: 2 },
  scrollContent: { padding: 6, paddingBottom: 24 },
  nutrientCard: { backgroundColor: C.surface, borderRadius: 16, padding: 20, marginBottom: 16 },
  kcalSection: { alignItems: 'center', marginBottom: 16 },
  kcalValue: { fontSize: 32, fontFamily: FONT.extraBold, color: C.white },
  kcalTarget: { fontSize: 14, color: C.gray40, marginTop: 4 },
  nutrientRow: { flexDirection: 'row', justifyContent: 'space-between' },
  nutrientItem: { flex: 1, alignItems: 'center' },
  nutrientLabel: { fontSize: 12, color: C.gray30, fontFamily: FONT.medium },
  nutrientValue: { fontSize: 16, fontFamily: FONT.bold, color: C.white, marginTop: 4 },
  nutrientTarget: { fontSize: 11, color: C.gray50, marginTop: 2 },
  nutrientBar: { height: 4, width: '80%', backgroundColor: C.gray70, borderRadius: 2, marginTop: 8, overflow: 'hidden' },
  nutrientBarFill: { height: 4, borderRadius: 2 },
  mealSection: { backgroundColor: C.surface, borderRadius: 16, padding: 16, marginBottom: 12 },
  mealHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  mealTitle: { fontSize: 16, fontFamily: FONT.bold, color: C.white },
  mealCalories: { fontSize: 12, color: C.gray40, marginTop: 2 },
  addMealBtn: { padding: 4 },
  recipeItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10, borderTopWidth: 0.5, borderTopColor: C.border },
  recipeItemTouchable: { flex: 1, flexDirection: 'row', alignItems: 'center', marginRight: 8 },
  recipeImage: { width: 44, height: 44, borderRadius: 10, marginRight: 12, backgroundColor: C.gray40 },
  recipeInfo: { flex: 1, marginRight: 8 },
  recipeName: { fontSize: 14, fontFamily: FONT.medium, color: C.gray50, marginBottom: 4 },
  recipeMacrosRow: { flexDirection: 'row', gap: 10 },
  recipeMacroCal: { fontSize: 12, fontFamily: FONT.semiBold, color: C.textPrimary },
  recipeMacro: { fontSize: 12, fontFamily: FONT.regular, color: C.gray50 },
  coachBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  coachBadgeText: { fontSize: 10, fontFamily: FONT.medium, color: C.orange },
  emptyMealText: { fontSize: 13, fontFamily: FONT.regular, color: C.gray50, paddingVertical: 8 },
  loadingOverlay: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center' },
  modalSheet: { flex: 1, backgroundColor: C.bg, paddingHorizontal: 24 },
  modalHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  modalCloseBtn: { padding: 4 },
  modalTitle: { fontSize: 18, fontFamily: FONT.bold, color: C.white },
  searchInput: { backgroundColor: C.surfaceLight, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, fontFamily: FONT.regular, color: C.white, marginBottom: 12 },
  noResultsText: { fontSize: 14, fontFamily: FONT.regular, color: C.gray50, textAlign: 'center', marginTop: 20 },
  searchResultsScroll: { flex: 1 },
  searchResultRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: C.border },
  searchResultImage: { width: 44, height: 44, borderRadius: 10, marginRight: 12, backgroundColor: C.gray40 },
  searchResultTitle: { fontSize: 14, fontFamily: FONT.semiBold, color: C.white },
  searchResultMeta: { fontSize: 12, fontFamily: FONT.regular, color: C.gray50, marginTop: 2 },
});
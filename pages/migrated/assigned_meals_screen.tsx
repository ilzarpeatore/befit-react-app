import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C, FONT } from './theme';
import { dietApi, AssignedMealsSummary, AssignedMealRecipe } from '../../api/diet';
import logger from '@helper/logger';

type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snacks';

const MEAL_TYPES: { key: MealType; label: string }[] = [
  { key: 'breakfast', label: 'Breakfast' },
  { key: 'lunch', label: 'Lunch' },
  { key: 'dinner', label: 'Dinner' },
  { key: 'snacks', label: 'Snacks' },
];

export default function AssignedMealsScreen(props: any) {
  const dietId: number | undefined = props.route?.params?.dietId;
  const dietTitle: string | undefined = props.route?.params?.dietTitle;
  const isDietMode = !!dietId;

  const [goal, setGoal] = useState<AssignedMealsSummary['goal'] | null>(null);
  const [meals, setMeals] = useState<AssignedMealsSummary['meals'] | null>(null);
  const [title, setTitle] = useState<string>(dietTitle ?? 'Assigned to Me');
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<MealType>('breakfast');
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      if (isDietMode) {
        const res = await dietApi.getDietMealItems(dietId!);
        setMeals(res.data.meals);
        setTitle(res.data.diet?.title ?? dietTitle ?? 'Diet');
      } else {
        const res = await dietApi.getAssignedMealsSummary();
        setGoal(res.data.goal);
        setMeals(res.data.meals);
      }
    } catch (e) {
      logger.error('Failed to load meals', e);
    } finally {
      setIsLoading(false);
    }
  }, [isDietMode, dietId, dietTitle]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const openRecipe = (recipe: AssignedMealRecipe) => {
    props.navigation.navigate('MigratedDietDetail', {
      recipeId: recipe.id,
      recipeImage: recipe.recipe_image ?? undefined,
    });
  };

  const activeRecipes = meals?.[activeTab] ?? [];

  const toggleSelected = (recipeId: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(recipeId)) next.delete(recipeId);
      else next.add(recipeId);
      return next;
    });
  };

  const allRecipes: AssignedMealRecipe[] = meals
    ? (['breakfast', 'lunch', 'dinner', 'snacks'] as MealType[]).flatMap((key) => meals[key] ?? [])
    : [];
  const selectedRecipes = allRecipes.filter((r) => selectedIds.has(r.id));
  const selectedKcal = selectedRecipes.reduce((sum, r) => sum + (Number(r.calories) || 0), 0);
  const goalKcal = Number(goal?.kcal) || 0;
  const kcalRatio = goalKcal > 0 ? selectedKcal / goalKcal : 0;
  const kcalStatus: 'under' | 'onTarget' | 'over' | null =
    !isDietMode && goalKcal > 0 && selectedIds.size > 0
      ? kcalRatio > 1.1
        ? 'over'
        : kcalRatio >= 0.9
        ? 'onTarget'
        : 'under'
      : null;
  const kcalStatusColor = kcalStatus === 'over' ? C.red : kcalStatus === 'onTarget' ? C.success : C.orange;
  const kcalStatusText =
    kcalStatus === 'over'
      ? `Te pasas ${Math.round(selectedKcal - goalKcal)} kcal de tu objetivo`
      : kcalStatus === 'onTarget'
      ? 'Esta combinación se ajusta a tu objetivo'
      : kcalStatus === 'under'
      ? `Aún te faltan ${Math.round(goalKcal - selectedKcal)} kcal para tu objetivo`
      : '';

  return (
    <View style={s.container}>
      <View style={s.appBar}>
        <TouchableOpacity onPress={() => props.navigation.goBack()} style={s.backBtn}>
          <Ionicons name="chevron-back" size={24} color={C.white} />
        </TouchableOpacity>
        <Text style={s.appBarTitle} numberOfLines={1}>{title}</Text>
        <View style={{ width: 40 }} />
      </View>

      {isLoading ? (
        <View style={s.loadingWrap}>
          <ActivityIndicator size="large" color={C.textPrimary} />
        </View>
      ) : (
        <>
          {!isDietMode && (
            <View style={s.goalCard}>
              <View style={s.goalKcalRow}>
                <Ionicons name="flame-outline" size={22} color={C.orange} />
                <Text style={s.goalKcalValue}>{goal?.kcal ?? 0}</Text>
                <Text style={s.goalKcalLabel}>kcal / day goal</Text>
              </View>
              <View style={s.goalMacrosRow}>
                <View style={s.goalMacroItem}>
                  <Text style={s.goalMacroValue}>{goal?.protein ?? 0}g</Text>
                  <Text style={s.goalMacroLabel}>Protein</Text>
                </View>
                <View style={s.goalMacroItem}>
                  <Text style={s.goalMacroValue}>{goal?.carbs ?? 0}g</Text>
                  <Text style={s.goalMacroLabel}>Carbs</Text>
                </View>
                <View style={s.goalMacroItem}>
                  <Text style={s.goalMacroValue}>{goal?.fats ?? 0}g</Text>
                  <Text style={s.goalMacroLabel}>Fats</Text>
                </View>
              </View>
            </View>
          )}

          {!isDietMode && selectedIds.size > 0 && (
            <View style={[s.selectionBar, { borderColor: kcalStatusColor }]}>
              <Text style={s.selectionBarKcal}>
                {selectedKcal} <Text style={s.selectionBarKcalGoal}>/ {goalKcal} kcal seleccionadas</Text>
              </Text>
              <Text style={[s.selectionBarStatus, { color: kcalStatusColor }]}>{kcalStatusText}</Text>
            </View>
          )}

          <View style={s.tabsRow}>
            {MEAL_TYPES.map(({ key, label }) => (
              <TouchableOpacity
                key={key}
                style={[s.tab, activeTab === key && s.tabActive]}
                onPress={() => setActiveTab(key)}
              >
                <Text style={[s.tabText, activeTab === key && s.tabTextActive]}>{label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <ScrollView contentContainerStyle={s.listContent}>
            {activeRecipes.length === 0 ? (
              <View style={s.emptyWrap}>
                <Ionicons name="restaurant-outline" size={40} color={C.gray30} />
                <Text style={s.emptyText}>
                  No {MEAL_TYPES.find(m => m.key === activeTab)?.label.toLowerCase()} assigned yet.
                </Text>
              </View>
            ) : (
              activeRecipes.map(recipe => (
                <View
                  key={recipe.id}
                  style={[s.recipeCard, !isDietMode && selectedIds.has(recipe.id) && s.recipeCardSelected]}
                >
                  {!isDietMode && (
                    <TouchableOpacity
                      style={s.recipeCheckbox}
                      activeOpacity={0.7}
                      onPress={() => toggleSelected(recipe.id)}
                    >
                      <Ionicons
                        name={selectedIds.has(recipe.id) ? 'checkmark-circle' : 'ellipse-outline'}
                        size={22}
                        color={selectedIds.has(recipe.id) ? C.brand50 : C.gray40}
                      />
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity style={s.recipeCardBody} activeOpacity={0.8} onPress={() => openRecipe(recipe)}>
                    {recipe.recipe_image ? (
                      <Image source={{ uri: recipe.recipe_image }} style={s.recipeImage} />
                    ) : (
                      <View style={s.recipeImage} />
                    )}
                    <View style={s.recipeInfo}>
                      <Text style={s.recipeTitle} numberOfLines={1}>{recipe.title}</Text>
                      <View style={s.recipeMacrosRow}>
                        <Text style={s.recipeMacroCal}>{recipe.calories} kcal</Text>
                        <Text style={s.recipeMacro}>P {recipe.protein}g</Text>
                        <Text style={s.recipeMacro}>C {recipe.carbs}g</Text>
                        <Text style={s.recipeMacro}>F {recipe.fats}g</Text>
                      </View>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={C.gray30} />
                  </TouchableOpacity>
                </View>
              ))
            )}
          </ScrollView>
        </>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  appBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingTop: 48,
    paddingBottom: 12,
  },
  backBtn: { padding: 8 },
  appBarTitle: { fontFamily: FONT.bold, fontSize: 18, color: C.white },
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  goalCard: {
    backgroundColor: C.surface,
    borderRadius: 16,
    marginHorizontal: 16,
    padding: 20,
    marginBottom: 12,
  },
  goalKcalRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  goalKcalValue: { fontFamily: FONT.extraBold, fontSize: 24, color: C.white },
  goalKcalLabel: { fontFamily: FONT.regular, fontSize: 12, color: C.gray50 },
  goalMacrosRow: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 14 },
  goalMacroItem: { alignItems: 'center' },
  goalMacroValue: { fontFamily: FONT.bold, fontSize: 15, color: C.white },
  goalMacroLabel: { fontFamily: FONT.regular, fontSize: 11, color: C.gray50, marginTop: 2 },
  tabsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 12,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: C.surfaceLight,
  },
  tabActive: { backgroundColor: C.brand50 },
  tabText: { fontFamily: FONT.semiBold, fontSize: 12, color: C.gray50 },
  tabTextActive: { color: C.white },
  listContent: { paddingHorizontal: 16, paddingBottom: 24 },
  emptyWrap: { alignItems: 'center', paddingVertical: 60 },
  emptyText: { fontFamily: FONT.regular, fontSize: 13, color: C.gray30, marginTop: 10 },
  selectionBar: {
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    backgroundColor: C.surface,
  },
  selectionBarKcal: { fontFamily: FONT.extraBold, fontSize: 16, color: C.white },
  selectionBarKcalGoal: { fontFamily: FONT.regular, fontSize: 12, color: C.gray50 },
  selectionBarStatus: { fontFamily: FONT.semiBold, fontSize: 12, marginTop: 4 },
  recipeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.surface,
    borderRadius: 14,
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  recipeCardSelected: { borderColor: C.brand50 },
  recipeCardBody: { flex: 1, flexDirection: 'row', alignItems: 'center', padding: 12, paddingLeft: 0 },
  recipeCheckbox: { paddingLeft: 12, paddingVertical: 12 },
  recipeImage: { width: 52, height: 52, borderRadius: 10, backgroundColor: C.gray40, marginRight: 12 },
  recipeInfo: { flex: 1 },
  recipeTitle: { fontFamily: FONT.bold, fontSize: 14, color: C.white, marginBottom: 4 },
  recipeMacrosRow: { flexDirection: 'row', gap: 10 },
  recipeMacroCal: { fontSize: 12, fontFamily: FONT.semiBold, color: C.textPrimary },
  recipeMacro: { fontSize: 12, fontFamily: FONT.regular, color: C.gray50 },
});
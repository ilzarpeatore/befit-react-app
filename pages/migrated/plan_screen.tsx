import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, ActivityIndicator, Alert, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useResponsiveStyleSheet } from '@helper/responsiveStyleSheet';
import { C, FONT } from './theme';

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

  const [selectedDay, setSelectedDay] = useState(new Date());
  const [showCompactSummary, setShowCompactSummary] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [plannedDays, setPlannedDays] = useState<string[]>([]);
  const [weekOffset, setWeekOffset] = useState(0);

  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    fetchDailyPlan();
  }, [selectedDay]);

  const fetchDailyPlan = async () => {
    setIsLoading(true);
    try {
      // API call placeholder: getDailyPlanDetailApi(date)
      // const value = await getDailyPlanDetailApi({ date: selectedDay.toISOString() });
      // Parse response and set state
    } catch (e) {
      console.log('Plan fetch error:', e);
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
      const request = {
        id: item.id,
        daily_plan_id: item.dailyPlanId,
        recipe_id: item.recipeId,
        meal_type: mealType,
        is_complete: !(item.isComplete ?? false),
      };
      // API call placeholder: saveDailyPlanRecipeApi(request)
      // const response = await saveDailyPlanRecipeApi(request);
      // updateDataFromResponse(response);
      Alert.alert('Success', 'Recipe status updated');
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'Failed to update');
    } finally {
      setIsLoading(false);
    }
  };

  const clearDailyPlan = () => {
    Alert.alert('Clear Plan', 'Are you sure you want to clear all recipes for this day?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear',
        style: 'destructive',
        onPress: async () => {
          setIsLoading(true);
          try {
            // API call placeholder
            fetchDailyPlan();
            Alert.alert('Success', 'Daily plan cleared');
          } catch (e) {
            Alert.alert('Error', 'Failed to clear plan');
          } finally {
            setIsLoading(false);
          }
        },
      },
    ]);
  };

  const navigateToRecipeList = (mealType: string) => {
    props.navigation?.navigate('MigratedDailyPlanRecipeList', {
      mealType,
      dailyPlanId: null,
      date: selectedDay.toISOString(),
    });
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
          { label: 'Protein', current: proteinCurrent, target: proteinTarget, progress: proteinProgress, color: C.brand5 },
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
          <TouchableOpacity style={s.addMealBtn} onPress={() => navigateToRecipeList(key)}>
            <Ionicons name="add-circle-outline" size={24} color={C.brand5} />
          </TouchableOpacity>
        </View>
        {recipes.map((recipe, i) => (
          <View key={i} style={s.recipeItem}>
            <View style={s.recipeInfo}>
              <Text style={s.recipeName}>{recipe.recipeName ?? 'Recipe'}</Text>
            </View>
            <TouchableOpacity onPress={() => toggleRecipeCompletion(recipe, key)}>
              <Ionicons
                name={recipe.isComplete ? 'checkmark-circle' : 'ellipse-outline'}
                size={22}
                color={recipe.isComplete ? C.success : C.gray40}
              />
            </TouchableOpacity>
          </View>
        ))}
      </View>
    );
  };

  return (
    <View style={s.container}>
      <View style={s.appBar}>
        <TouchableOpacity onPress={() => props.navigation?.goBack()} style={s.backBtn}>
          <Ionicons name="chevron-back" size={24} color={C.brand5} />
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
          <ActivityIndicator size="large" color={C.brand5} />
        </View>
      )}
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
  weekDayNum: { fontSize: 16, fontFamily: FONT.semiBold, color: C.gray20 },
  weekDayNumSelected: { color: C.white },
  weekDayToday: { color: C.brand5 },
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
  recipeInfo: { flex: 1 },
  recipeName: { fontSize: 14, fontFamily: FONT.medium, color: C.gray10 },
  loadingOverlay: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center' },
});

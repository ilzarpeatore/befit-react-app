import React, { useState, useEffect, useCallback } from 'react';
import { ScrollView } from 'react-native';
import { Image } from 'expo-image';
import { Box } from '@components/ui/box';
import { Text } from '@components/ui/text';
import { VStack } from '@components/ui/vstack';
import { HStack } from '@components/ui/hstack';
import { Pressable } from '@components/ui/pressable';
import { Icon } from '@components/ui/icon';
import { Card } from '@components/ui/card';
import { Spinner } from '@components/ui/spinner';
import ScreenHeader from '@components/ScreenHeader';
import { C } from './theme';
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
    <Box className="flex-1 bg-background">
      <Box style={{ paddingTop: 40 }}>
        <ScreenHeader title={title} onBack={() => props.navigation.goBack()} />
      </Box>

      {isLoading ? (
        <Box className="flex-1 items-center justify-center">
          <Spinner size="large" color={C.textPrimary} />
        </Box>
      ) : (
        <>
          {!isDietMode && (
            <Card variant="ghost" className="mx-4" style={{ marginBottom: 12 }}>
              <HStack space="sm" className="items-center justify-center">
                <Icon name="flame-outline" size={22} color={C.orange} />
                <Text weight="extrabold" size="xl">{goal?.kcal ?? 0}</Text>
                <Text size="xs" muted>kcal / day goal</Text>
              </HStack>
              <HStack className="justify-around" style={{ marginTop: 14 }}>
                <VStack className="items-center">
                  <Text weight="bold" size="sm">{goal?.protein ?? 0}g</Text>
                  <Text size="xs" muted style={{ marginTop: 2 }}>Protein</Text>
                </VStack>
                <VStack className="items-center">
                  <Text weight="bold" size="sm">{goal?.carbs ?? 0}g</Text>
                  <Text size="xs" muted style={{ marginTop: 2 }}>Carbs</Text>
                </VStack>
                <VStack className="items-center">
                  <Text weight="bold" size="sm">{goal?.fats ?? 0}g</Text>
                  <Text size="xs" muted style={{ marginTop: 2 }}>Fats</Text>
                </VStack>
              </HStack>
            </Card>
          )}

          {!isDietMode && selectedIds.size > 0 && (
            <Card
              variant="ghost"
              className="mx-4"
              style={{ marginBottom: 12, borderWidth: 1.5, borderColor: kcalStatusColor }}
            >
              <Text weight="extrabold" size="lg">
                {selectedKcal} <Text size="xs" muted>/ {goalKcal} kcal seleccionadas</Text>
              </Text>
              <Text weight="semibold" size="xs" style={{ color: kcalStatusColor, marginTop: 4 }}>
                {kcalStatusText}
              </Text>
            </Card>
          )}

          <HStack space="sm" className="px-4" style={{ marginBottom: 12 }}>
            {MEAL_TYPES.map(({ key, label }) => (
              <Pressable
                key={key}
                className={`flex-1 items-center py-2 rounded-md ${activeTab === key ? 'bg-primary' : 'bg-secondary'}`}
                onPress={() => setActiveTab(key)}
              >
                <Text
                  weight="semibold"
                  size="xs"
                  className={activeTab === key ? 'text-primary-foreground' : 'text-muted-foreground'}
                >
                  {label}
                </Text>
              </Pressable>
            ))}
          </HStack>

          <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}>
            {activeRecipes.length === 0 ? (
              <Box className="items-center" style={{ paddingVertical: 60 }}>
                <Icon name="restaurant-outline" size={40} color={C.gray30} />
                <Text size="sm" style={{ color: C.gray30, marginTop: 10 }}>
                  No {MEAL_TYPES.find(m => m.key === activeTab)?.label.toLowerCase()} assigned yet.
                </Text>
              </Box>
            ) : (
              activeRecipes.map(recipe => (
                <Box
                  key={recipe.id}
                  className="flex-row items-center bg-card rounded-lg"
                  style={{
                    marginBottom: 10,
                    borderWidth: 1.5,
                    borderColor: !isDietMode && selectedIds.has(recipe.id) ? C.brand50 : 'transparent',
                  }}
                >
                  {!isDietMode && (
                    <Pressable
                      style={{ paddingLeft: 12, paddingVertical: 12 }}
                      onPress={() => toggleSelected(recipe.id)}
                    >
                      <Icon
                        name={selectedIds.has(recipe.id) ? 'checkmark-circle' : 'ellipse-outline'}
                        size={22}
                        color={selectedIds.has(recipe.id) ? C.brand50 : C.gray40}
                      />
                    </Pressable>
                  )}
                  <Pressable
                    className="flex-1 flex-row items-center p-3"
                    style={{ paddingLeft: 0 }}
                    onPress={() => openRecipe(recipe)}
                  >
                    {recipe.recipe_image ? (
                      <Image source={{ uri: recipe.recipe_image }} contentFit="cover" style={{ width: 52, height: 52, borderRadius: 10, marginRight: 12 }} />
                    ) : (
                      <Box className="bg-muted" style={{ width: 52, height: 52, borderRadius: 10, marginRight: 12 }} />
                    )}
                    <Box className="flex-1">
                      <Text weight="bold" size="sm" numberOfLines={1} style={{ marginBottom: 4 }}>{recipe.title}</Text>
                      <HStack space="sm">
                        <Text size="xs" weight="semibold">{recipe.calories} kcal</Text>
                        <Text size="xs" muted>P {recipe.protein}g</Text>
                        <Text size="xs" muted>C {recipe.carbs}g</Text>
                        <Text size="xs" muted>F {recipe.fats}g</Text>
                      </HStack>
                    </Box>
                    <Icon name="chevron-forward" size={18} color={C.gray30} />
                  </Pressable>
                </Box>
              ))
            )}
          </ScrollView>
        </>
      )}
    </Box>
  );
}

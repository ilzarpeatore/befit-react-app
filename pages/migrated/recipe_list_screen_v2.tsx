import React, { useState, useEffect, useCallback, useRef } from 'react';
import { FlatList, ActivityIndicator, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Box } from '@components/ui/box';
import { Text } from '@components/ui/text';
import { Heading } from '@components/ui/heading';
import { HStack } from '@components/ui/hstack';
import { Button, ButtonText } from '@components/ui/button';
import { Pressable } from '@components/ui/pressable';
import { Icon } from '@components/ui/icon';
import { Input, InputField } from '@components/ui/input';
import { Spinner } from '@components/ui/spinner';
import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
} from '@components/ui/actionsheet';
import { C } from './theme';
import { recipesApi } from '../../api/recipes';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface RecipeItem {
  id: number;
  title: string;
  recipeImage?: string;
  calories?: number;
  isPremium?: boolean;
  isAccessible?: boolean;
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
  const scrollRef = useRef<FlatList>(null);

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
        isPremium: r.is_premium,
        isAccessible: r.is_accessible,
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

  const handleRecipeListEndReached = () => {
    if (!isLastPage && !isLoading) {
      setPage((prev) => prev + 1);
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

  const renderRecipeItem = useCallback(
    ({ item }: { item: RecipeItem }) => (
      <Pressable
        style={{ width: columnWidth, marginBottom: 16 }}
        onPress={() => props.navigation.navigate('MigratedDietDetail', { recipeId: item.id, recipeImage: item.recipeImage })}
      >
        {item.recipeImage ? (
          <Image
            source={{ uri: item.recipeImage }}
            style={{ width: columnWidth, height: 140, borderRadius: 12 }}
            contentFit="cover"
          />
        ) : (
          <Box className="bg-card" style={{ width: columnWidth, height: 140, borderRadius: 12 }} />
        )}
        {item.isPremium && !item.isAccessible && (
          <HStack
            className="items-center rounded-pill"
            style={{
              position: 'absolute',
              top: 8,
              right: 8,
              backgroundColor: 'rgba(0,0,0,0.6)',
              paddingHorizontal: 8,
              paddingVertical: 4,
              gap: 4,
            }}
          >
            <Icon name="lock-closed" size={12} color="#FFFFFF" />
            <Text size="xs" weight="semibold" style={{ color: '#FFFFFF' }}>Exclusive</Text>
          </HStack>
        )}
        <Text weight="bold" size="sm" numberOfLines={1} style={{ marginTop: 8 }}>
          {item.title}
        </Text>
        {item.calories != null && (
          <Text size="xs" muted style={{ marginTop: 4 }}>
            {item.calories} kcal
          </Text>
        )}
      </Pressable>
    ),
    [props.navigation, columnWidth]
  );

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-background">
      <HStack className="items-center justify-between p-4">
        <Button variant="ghost" size="icon" onPress={() => props.navigation.goBack()}>
          <Icon name="chevron-back" size={24} className="text-foreground" />
        </Button>
        <Heading size="sm" className="flex-1 text-center">{title}</Heading>
        <HStack className="items-center">
          <Button variant="ghost" size="icon" onPress={toggleFavourite}>
            <Icon
              name={filter.isFavourite === 1 ? 'heart' : 'heart-outline'}
              size={24}
              className={filter.isFavourite === 1 ? 'text-destructive' : 'text-foreground'}
            />
          </Button>
          <Button variant="ghost" size="icon" onPress={() => setShowFilterSheet(true)}>
            <Icon name="filter-outline" size={24} className="text-foreground" />
          </Button>
        </HStack>
      </HStack>

      <Box className="flex-1">
        {isLoading && page === 1 ? (
          <Box className="flex-1 items-center justify-center">
            <Spinner size="large" color={C.orange} />
          </Box>
        ) : !isLoading && recipeList.length === 0 ? (
          <Box className="flex-1 items-center justify-center">
            <Text weight="medium" muted>No recipes found</Text>
          </Box>
        ) : (
          <FlatList
            ref={scrollRef}
            data={recipeList}
            keyExtractor={(item) => String(item.id)}
            renderItem={renderRecipeItem}
            numColumns={2}
            columnWrapperStyle={{ justifyContent: 'space-between' }}
            contentContainerStyle={{ padding: 16 }}
            onEndReached={handleRecipeListEndReached}
            onEndReachedThreshold={0.3}
            ListFooterComponent={
              isLoading && page > 1 ? (
                <ActivityIndicator size="small" color={C.orange} style={{ marginVertical: 16 }} />
              ) : null
            }
          />
        )}
      </Box>

      <Actionsheet
        isOpen={showFilterSheet}
        onClose={() => setShowFilterSheet(false)}
        onOpen={() => {
          setMealTypeDraft(filter.mealTypes ?? []);
          setCalMinDraft(filter.startCalories != null ? String(filter.startCalories) : '');
          setCalMaxDraft(filter.endCalories != null ? String(filter.endCalories) : '');
        }}
      >
        <ActionsheetBackdrop />
        <ActionsheetContent className="items-stretch bg-background rounded-t-lg p-6">
          <ActionsheetDragIndicatorWrapper>
            <ActionsheetDragIndicator />
          </ActionsheetDragIndicatorWrapper>
            <Heading size="lg" style={{ marginBottom: 16 }}>Filters</Heading>

            <Text weight="semibold" muted size="sm" style={{ marginTop: 16, marginBottom: 10 }}>Meal Type</Text>
            <Box className="flex-row flex-wrap gap-2">
              {MEAL_TYPE_OPTIONS.map((mt) => {
                const selected = mealTypeDraft.includes(mt);
                return (
                  <Pressable
                    key={mt}
                    className="rounded-pill"
                    style={{
                      paddingHorizontal: 16,
                      paddingVertical: 8,
                      borderWidth: 1,
                      borderColor: selected ? C.brand5 : C.gray60,
                      backgroundColor: selected ? C.brand5 : 'transparent',
                    }}
                    onPress={() =>
                      setMealTypeDraft((prev) =>
                        prev.includes(mt) ? prev.filter((v) => v !== mt) : [...prev, mt]
                      )
                    }
                  >
                    <Text size="sm" weight="medium" style={{ color: selected ? C.white : C.gray30 }}>
                      {mt.charAt(0).toUpperCase() + mt.slice(1)}
                    </Text>
                  </Pressable>
                );
              })}
            </Box>

            <Text weight="semibold" muted size="sm" style={{ marginTop: 16, marginBottom: 10 }}>Calories (kcal)</Text>
            <HStack className="items-center">
              <Input className="flex-1">
                <InputField
                  placeholder="Min"
                  keyboardType="numeric"
                  value={calMinDraft}
                  onChangeText={setCalMinDraft}
                />
              </Input>
              <Text muted style={{ marginHorizontal: 12 }}>-</Text>
              <Input className="flex-1">
                <InputField
                  placeholder="Max"
                  keyboardType="numeric"
                  value={calMaxDraft}
                  onChangeText={setCalMaxDraft}
                />
              </Input>
            </HStack>

            <Button
              size="lg"
              style={{ marginTop: 24 }}
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
              <ButtonText>Apply Filters</ButtonText>
            </Button>
        </ActionsheetContent>
      </Actionsheet>
    </SafeAreaView>
  );
}

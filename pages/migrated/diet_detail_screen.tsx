import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions, ActivityIndicator } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useResponsiveStyleSheet } from '@helper/responsiveStyleSheet';
import { C, FONT } from './theme';
import { dietApi } from '../../api/diet';
import { recipesApi, RecipeStep, RecipeIngredient } from '../../api/recipes';
import logger from '@helper/logger';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface DietModel {
  id?: number;
  title?: string;
  dietImage?: string;
  calories?: string;
  carbs?: string;
  fat?: string;
  protein?: string;
  totalTime?: string;
  ingredients?: string;
  description?: string;
  isFavourite?: number;
  isPremium?: number;
  isAccessible?: number;
  [key: string]: any;
}

interface DietDetailScreenProps {
  navigation: any;
  route: {
    params: {
      dietModel?: DietModel;
      id?: number;
      recipeId?: number;
      recipeImage?: string;
      isCategory?: boolean;
      isFeatured?: boolean;
    };
  };
}

export default function DietDetailScreen(props: DietDetailScreenProps) {
  const dietModel = props.route.params?.dietModel ?? {};
  const fallbackId = props.route.params?.id;
  const recipeId = props.route.params?.recipeId;
  const recipeImageParam = props.route.params?.recipeImage;
  const isRecipeMode = !!recipeId;
  const [select, setSelect] = useState(true);
  const [dietState, setDietState] = useState<DietModel>(dietModel);
  const [recipeIngredients, setRecipeIngredients] = useState<RecipeIngredient[]>([]);
  const [recipeSteps, setRecipeSteps] = useState<RecipeStep[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    // Fallback for when the screen is navigated with only { id } instead of the
    // full dietModel object (e.g. deep links / notifications) — fetch from the API.
    if (!dietModel?.id && fallbackId) {
      setIsLoading(true);
      dietApi
        .getDetail(fallbackId)
        .then((res) => {
          const d = res.data?.data;
          if (!d) return;
          setDietState({
            id: d.id,
            title: d.title,
            dietImage: d.diet_image,
            calories: d.calories,
            carbs: d.carbs,
            fat: d.fat,
            protein: d.protein,
            totalTime: d.total_time,
            ingredients: d.ingredients,
            description: d.description,
            isPremium: d.is_premium,
            isFavourite: 0,
          });
        })
        .catch((e) => logger.error(e))
        .finally(() => setIsLoading(false));
    }
  }, [fallbackId]);

  useEffect(() => {
    // Recipe mode: fetch a real recipe (with structured ingredients/steps) instead
    // of a legacy Diet model.
    if (recipeId) {
      setIsLoading(true);
      recipesApi
        .getDetail(recipeId)
        .then((res) => {
          const d = res.data?.data;
          if (!d) return;
          setDietState({
            id: d.id,
            title: d.title,
            dietImage: d.recipe_image || recipeImageParam,
            calories: String(d.calories ?? ''),
            carbs: String(d.carbs ?? ''),
            fat: String(d.fats ?? ''),
            protein: String(d.protein ?? ''),
            totalTime: d.preparation_time ? `${d.preparation_time} min` : '',
            description: d.description,
            isPremium: d.is_premium ? 1 : 0,
            isAccessible: d.is_accessible === false ? 0 : 1,
            isFavourite: d.is_favourite ?? 0,
          });
          setRecipeIngredients(res.data?.recipe_ingredients ?? []);
          setRecipeSteps(
            (res.data?.recipe_steps ?? []).slice().sort((a, b) => a.sequence - b.sequence)
          );
        })
        .catch((e) => logger.error(e))
        .finally(() => setIsLoading(false));
    }
  }, [recipeId]);

  const setDiet = async (id?: number) => {
    if (!id) return;
    setIsLoading(true);
    try {
      if (isRecipeMode) {
        await recipesApi.setFavourite(id);
      } else {
        await dietApi.setFavourite(id);
      }
      setDietState((prev) => ({
        ...prev,
        isFavourite: prev.isFavourite === 1 ? 0 : 1,
      }));
    } catch (e) {
      logger.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const getVitamins = (icon: string, title: string, subTitle: string) => (
    <View style={localStyles.vitaminItem}>
      <Ionicons name={icon as any} size={26} color={C.textPrimary} />
      <Text style={localStyles.vitaminTitle}>{title}</Text>
      <Text style={localStyles.vitaminSubtitle}>{subTitle}</Text>
    </View>
  );

  const isLockedRecipe = isRecipeMode && dietState.isPremium === 1 && dietState.isAccessible === 0;

  const ingredients = () =>
    isLockedRecipe ? (
      <View style={localStyles.htmlContent}>
        <Text style={localStyles.htmlText}>
          Contenido exclusivo de tu coach.
        </Text>
      </View>
    ) : isRecipeMode ? (
      <View style={localStyles.htmlContent}>
        {recipeIngredients.length === 0 ? (
          <Text style={localStyles.htmlText}>No hay ingredientes.</Text>
        ) : (
          recipeIngredients.map((ing) => (
            <View key={ing.id} style={localStyles.ingredientRow}>
              <View style={localStyles.ingredientDot} />
              <Text style={[localStyles.htmlText, { flex: 1 }]}>{ing.ingredient_title}</Text>
              <Text style={localStyles.ingredientQty}>
                {ing.quantity_display || `${ing.quantity} ${ing.measurement_unit_title}`}
              </Text>
            </View>
          ))
        )}
      </View>
    ) : (
      <View style={localStyles.htmlContent}>
        <Text style={localStyles.htmlText}>{dietState.ingredients || ''}</Text>
      </View>
    );

  const instruction = () =>
    isLockedRecipe ? (
      <View style={localStyles.htmlContent}>
        <Text style={localStyles.htmlText}>
          Contenido exclusivo de tu coach.
        </Text>
      </View>
    ) : isRecipeMode ? (
      <View style={localStyles.htmlContent}>
        {recipeSteps.length === 0 ? (
          <Text style={localStyles.htmlText}>No hay instrucciones.</Text>
        ) : (
          recipeSteps.map((step, index) => (
            <Text key={step.id} style={[localStyles.htmlText, { marginBottom: 10 }]}>
              {index + 1}. {step.instruction}
            </Text>
          ))
        )}
      </View>
    ) : (
      <View style={localStyles.htmlContent}>
        <Text style={localStyles.htmlText}>{dietState.description || ''}</Text>
      </View>
    );

  return (
    <SafeAreaView style={localStyles.container} edges={['bottom']}>
      {/* Header Image */}
      <View style={localStyles.headerSection}>
        <Image
          source={{ uri: dietState.dietImage || '' }}
          style={localStyles.headerImage}
          resizeMode="cover"
        />
        <View style={localStyles.headerOverlay} />

        {/* Back Button */}
        <TouchableOpacity
          style={[localStyles.backBtn, { top: insets.top + 8 }]}
          onPress={() => props.navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color={'#FFFFFF'} />
        </TouchableOpacity>

        {/* Premium Badge */}
        {dietState.isPremium === 1 && (
          <View style={[localStyles.premiumBadge, { top: insets.top + 16 }]}>
            <Text style={localStyles.premiumText}>PRO</Text>
          </View>
        )}

        {/* Favourite Button */}
        <TouchableOpacity
          style={[localStyles.favBtn, { top: insets.top + 18 }]}
          onPress={() => setDiet(dietState.id)}
        >
          <View style={localStyles.favBtnInner}>
            <Ionicons
              name={dietState.isFavourite === 1 ? 'heart' : 'heart-outline'}
              size={20}
              color={dietState.isFavourite === 1 ? C.red : C.white}
            />
          </View>
        </TouchableOpacity>

        {/* Title + Time */}
        <View style={localStyles.titleRow}>
          <Text style={localStyles.dietTitle} numberOfLines={2}>
            {dietState.title || ''}
          </Text>
          <View style={localStyles.timeBadge}>
            <Ionicons name="time-outline" size={16} color={'#FFFFFF'} />
            <Text style={localStyles.timeText}>{dietState.totalTime || ''}</Text>
          </View>
        </View>
      </View>

      {/* Content Sheet */}
      <View style={localStyles.contentSheet}>
        <ScrollView contentContainerStyle={{ paddingBottom: 16 }}>
          {/* Nutrients Row */}
          <View style={localStyles.nutrientsRow}>
            {getVitamins('flame-outline', `${dietState.calories || '0'} Kcal`, 'Calorías')}
            <View style={localStyles.divider} />
            {getVitamins('leaf-outline', `${dietState.carbs || '0'} g`, 'Carbohidratos')}
            <View style={localStyles.divider} />
            {getVitamins('water-outline', `${dietState.fat || '0'} g`, 'Grasas')}
            <View style={localStyles.divider} />
            {getVitamins('nutrition-outline', `${dietState.protein || '0'} g`, 'Proteína')}
          </View>

          <View style={localStyles.separator} />

          {/* Tabs: Ingredients / Instruction */}
          <View style={localStyles.tabsRowWrap}>
            <View style={localStyles.tabBar}>
              <TouchableOpacity
                style={[localStyles.tabPill, select && localStyles.tabPillActive]}
                onPress={() => setSelect(true)}
              >
                <Text style={[localStyles.tabPillText, select && localStyles.tabPillTextActive]}>
                  Ingredientes
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[localStyles.tabPill, !select && localStyles.tabPillActive]}
                onPress={() => setSelect(false)}
              >
                <Text style={[localStyles.tabPillText, !select && localStyles.tabPillTextActive]}>
                  Instrucciones
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={{ padding: 16 }}>
            {select ? ingredients() : instruction()}
          </View>
        </ScrollView>
      </View>

      {isLoading && (
        <View style={localStyles.loaderContainer}>
          <ActivityIndicator size="large" color={C.textPrimary} />
        </View>
      )}
    </SafeAreaView>
  );
}

const localStyles = StyleSheet.create({
  // Antes 'rgba(0,0,0,0.45)': pensado para una presentación modal transparente
  // que esta pantalla nunca tuvo (se registra como push normal en App.tsx),
  // así que se veía como un velo negro translúcido sobre toda la pantalla.
  container: { flex: 1, backgroundColor: C.bg },
  headerSection: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.37,
  },
  headerImage: {
    width: '100%',
    height: '100%',
  },
  headerOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  backBtn: {
    position: 'absolute',
    left: 0,
    padding: 8,
  },
  premiumBadge: {
    position: 'absolute',
    left: 16,
    backgroundColor: C.warning,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  premiumText: {
    fontFamily: FONT.bold,
    fontSize: 10,
    color: '#FFFFFF',
  },
  favBtn: {
    position: 'absolute',
    right: 16,
  },
  favBtnInner: {
    padding: 5,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  titleRow: {
    position: 'absolute',
    bottom: 40,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  dietTitle: {
    flex: 1,
    fontFamily: FONT.bold,
    fontSize: 20,
    color: '#FFFFFF',
    marginRight: 12,
  },
  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  timeText: {
    fontFamily: FONT.regular,
    fontSize: 13,
    color: '#FFFFFF',
    marginLeft: 4,
  },
  contentSheet: {
    flex: 1,
    backgroundColor: C.bg,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -20,
  },
  nutrientsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  vitaminItem: {
    alignItems: 'center',
    flex: 1,
  },
  vitaminTitle: {
    fontFamily: FONT.bold,
    fontSize: 13,
    color: C.textPrimary,
    marginTop: 8,
    textAlign: 'center',
  },
  vitaminSubtitle: {
    fontFamily: FONT.regular,
    fontSize: 12,
    color: C.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  divider: {
    width: 1,
    height: 65,
    backgroundColor: C.border,
    marginHorizontal: 4,
  },
  separator: {
    height: 0.5,
    backgroundColor: C.border,
    marginHorizontal: 16,
  },
  tabsRowWrap: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: C.surfaceLight,
    borderRadius: 30,
    padding: 4,
  },
  tabPill: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 26,
    alignItems: 'center',
  },
  tabPillActive: {
    backgroundColor: C.brand50,
  },
  tabPillText: {
    fontFamily: FONT.bold,
    fontSize: 13,
    color: C.textSecondary,
  },
  tabPillTextActive: {
    color: C.white,
  },
  htmlContent: {
    paddingHorizontal: 8,
  },
  htmlText: {
    fontFamily: FONT.regular,
    fontSize: 14,
    color: C.textPrimary,
    lineHeight: 22,
  },
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  ingredientDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: C.orange,
    marginRight: 10,
  },
  ingredientQty: {
    fontFamily: FONT.regular,
    fontSize: 13,
    color: C.textSecondary,
    marginLeft: 8,
  },
  loaderContainer: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
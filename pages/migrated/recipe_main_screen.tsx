import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, ScrollView, TextInput, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Box } from '@components/ui/box';
import { Text } from '@components/ui/text';
import { Pressable } from '@components/ui/pressable';
import { Icon } from '@components/ui/icon';
import { Spinner } from '@components/ui/spinner';
import { HStack } from '@components/ui/hstack';
import { VStack } from '@components/ui/vstack';
import { Button } from '@components/ui/button';
import { Badge, BadgeText } from '@components/ui/badge';
import ScreenHeader from '@components/ScreenHeader';
import { useResponsiveStyleSheet } from '@helper/responsiveStyleSheet';
import { C, FONT } from './theme';
import { recipesApi, RecipeListItem } from '../../api/recipes';
import logger from '@helper/logger';

// Rediseño (2026-08-18, opción B elegida por el usuario entre 3 propuestas):
// de una pila de carruseles (Favoritos/Categorías/Tags/Explorar por tipo de
// comida, cuatro secciones compitiendo por la atención) a un hub de
// exploración por categoría — la navegación principal ahora son mosaicos
// grandes tocables, con buscador siempre visible arriba. Favoritos pasa a
// ser un atajo en la cabecera hacia MigratedFavouriteRecipe (ya existe, no
// hace falta duplicar esa lista aquí). Etiquetas se conserva como un enlace
// discreto para no perder el único camino real hacia MigratedRecipeTagList,
// sin ocupar una sección entera.

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GRID_GAP = 12;
const CATEGORY_TILE_WIDTH = (SCREEN_WIDTH - 32 - GRID_GAP) / 2;

interface RecipeCategory {
  id: number;
  title: string;
  recipeCategoryImage?: string;
}

interface RecipeCardItem {
  id: number;
  title: string;
  image?: string;
  calories?: number;
  preparationTime?: number;
  mealType?: string[];
  isFavourite?: boolean;
  isPremium?: boolean;
  isAccessible?: boolean;
}

function mapRecipe(r: RecipeListItem): RecipeCardItem {
  return {
    id: r.id,
    title: r.title,
    image: r.recipe_image ?? undefined,
    calories: r.calories,
    preparationTime: r.preparation_time,
    mealType: r.meal_type,
    isFavourite: !!r.is_favourite,
    isPremium: r.is_premium,
    isAccessible: r.is_accessible,
  };
}

export default function RecipeMainScreen(props: any) {
  const [categories, setCategories] = useState<RecipeCategory[]>([]);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(false);
  const [totalCategoryItems, setTotalCategoryItems] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<RecipeCardItem[]>([]);
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const styles = useStyle();

  const isSearching = searchQuery.trim().length > 0;

  useEffect(() => {
    fetchAllCategories();
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
        if (allCategories.length >= 8) break;
        page++;
      }
      setCategories(allCategories);
    } catch (e) {
      logger.error(e);
    } finally {
      setIsCategoriesLoading(false);
    }
  }, []);

  // Búsqueda por título en el catálogo completo (soportada por el backend
  // vía el parámetro `title` de recipe-filter-list), con debounce.
  useEffect(() => {
    const query = searchQuery.trim();
    if (!query) {
      setSearchResults([]);
      setIsSearchLoading(false);
      return;
    }
    setIsSearchLoading(true);
    const handle = setTimeout(async () => {
      try {
        const res = await recipesApi.getFilteredList({ title: query, page: 1 });
        setSearchResults((res.data.data ?? []).map(mapRecipe));
      } catch (e) {
        logger.error(e);
      } finally {
        setIsSearchLoading(false);
      }
    }, 400);
    return () => clearTimeout(handle);
  }, [searchQuery]);

  const handleToggleFavourite = useCallback(async (item: RecipeCardItem) => {
    const nextFavourite = !item.isFavourite;
    setSearchResults((prev) =>
      prev.map((r) => (r.id === item.id ? { ...r, isFavourite: nextFavourite } : r))
    );
    try {
      await recipesApi.setFavourite(item.id);
    } catch (e) {
      logger.error(e);
      setSearchResults((prev) =>
        prev.map((r) => (r.id === item.id ? { ...r, isFavourite: item.isFavourite } : r))
      );
    }
  }, []);

  const showViewMore = totalCategoryItems > 8 || categories.length > 8;
  const displayCategories = showViewMore ? categories.slice(0, 7) : categories;

  const navigateToTagList = () => props.navigation.navigate('MigratedRecipeTagList');
  const navigateToCategoryList = () => props.navigation.navigate('MigratedRecipeCategoryList');
  const navigateToFavourites = () => props.navigation.navigate('MigratedFavouriteRecipe');
  const navigateToRecipeDetail = (item: RecipeCardItem) => {
    props.navigation.navigate('MigratedDietDetail', { recipeId: item.id, recipeImage: item.image });
  };
  const navigateToCategory = (category: RecipeCategory) => {
    props.navigation.navigate('MigratedRecipeListV2', { categoryId: category.id, title: category.title });
  };

  const renderRecipeCard = (item: RecipeCardItem, containerStyle: any) => (
    <Pressable key={item.id} style={[s.recipeCard, containerStyle]} onPress={() => navigateToRecipeDetail(item)}>
      <Box style={s.recipeImageWrap}>
        {item.image ? (
          <Image source={{ uri: item.image }} style={s.recipeImage} contentFit="cover" />
        ) : (
          <Box style={[s.recipeImage, { backgroundColor: C.surfaceLight }]} />
        )}
        {item.isPremium && !item.isAccessible && (
          <Badge action="muted" className="bg-black/60" style={{ position: 'absolute', top: 8, left: 8 }}>
            <Icon name="lock-closed" size={11} className="text-white" />
            <BadgeText className="text-white" style={{ fontSize: 11 }}>Exclusive</BadgeText>
          </Badge>
        )}
        <Pressable
          style={s.favBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          onPress={(e: any) => {
            e.stopPropagation?.();
            handleToggleFavourite(item);
          }}
        >
          <Icon name={item.isFavourite ? 'heart' : 'heart-outline'} size={16} color={item.isFavourite ? C.red : '#FFFFFF'} />
        </Pressable>
      </Box>
      <Text style={[s.recipeTitle, styles.fontBold]} numberOfLines={1}>
        {item.title}
      </Text>
      {(item.calories != null || item.preparationTime != null) && (
        <HStack style={s.recipeMetaRow}>
          {item.calories != null && <Text style={[s.recipeMeta, styles.fontRegular]}>{item.calories} kcal</Text>}
          {item.calories != null && item.preparationTime != null && (
            <Text style={[s.recipeMeta, styles.fontRegular]}> · </Text>
          )}
          {item.preparationTime != null && <Text style={[s.recipeMeta, styles.fontRegular]}>{item.preparationTime} min</Text>}
        </HStack>
      )}
    </Pressable>
  );

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <ScreenHeader
        title="Recetas"
        onBack={() => props.navigation.goBack()}
        rightAction={
          <Button variant="ghost" size="icon" onPress={navigateToFavourites}>
            <Icon name="heart-outline" size={22} className="text-foreground" />
          </Button>
        }
      />

      <ScrollView contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <HStack space="sm" style={s.searchWrap}>
          <Icon name="search-outline" size={18} color={C.gray40} />
          <TextInput
            style={[s.searchInput, styles.fontRegular]}
            placeholder="Buscar recetas..."
            placeholderTextColor={C.gray40}
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery('')}>
              <Icon name="close-circle" size={18} color={C.gray40} />
            </Pressable>
          )}
        </HStack>

        {isSearching ? (
          <Box style={s.section}>
            <Text style={[s.sectionTitle, styles.fontBold]}>
              {isSearchLoading ? 'Buscando…' : `Resultados (${searchResults.length})`}
            </Text>
            {isSearchLoading ? (
              <Spinner size="small" color={C.orange} style={{ paddingVertical: 24 }} />
            ) : searchResults.length === 0 ? (
              <VStack space="sm" style={s.emptyBox}>
                <Icon name="search-outline" size={40} color={C.gray30} />
                <Text style={[s.emptyText, styles.fontMedium]}>Sin resultados para "{searchQuery.trim()}"</Text>
              </VStack>
            ) : (
              <HStack style={s.grid}>
                {searchResults.map((item) => renderRecipeCard(item, { width: CATEGORY_TILE_WIDTH }))}
              </HStack>
            )}
          </Box>
        ) : isCategoriesLoading ? (
          <Spinner size="large" color={C.orange} style={{ paddingVertical: 60 }} />
        ) : (
          <>
            <HStack style={s.categoryGrid}>
              {displayCategories.map((item) => (
                <Pressable key={item.id} style={s.categoryTile} onPress={() => navigateToCategory(item)}>
                  {item.recipeCategoryImage ? (
                    <Image source={{ uri: item.recipeCategoryImage }} style={s.categoryImage} contentFit="cover" />
                  ) : (
                    <Box style={[s.categoryImage, { backgroundColor: C.surfaceLight }]} />
                  )}
                  <Box style={s.categoryOverlay} />
                  <Text style={[s.categoryTileTitle, styles.fontBold]} numberOfLines={1}>
                    {item.title}
                  </Text>
                </Pressable>
              ))}
              {showViewMore && (
                <Pressable style={s.categoryTile} onPress={navigateToCategoryList}>
                  <Box style={[s.categoryImage, s.viewMoreBox]}>
                    <Icon name="grid-outline" size={28} color={C.textPrimary} />
                    <Text style={[s.viewMoreText, styles.fontSemiBold]}>Ver todas</Text>
                  </Box>
                </Pressable>
              )}
            </HStack>

            {categories.length === 0 && (
              <VStack space="sm" style={s.emptyBox}>
                <Icon name="restaurant-outline" size={36} color={C.gray30} />
                <Text style={[s.emptyText, styles.fontMedium]}>No hay categorías todavía</Text>
              </VStack>
            )}

            <Pressable style={s.tagsLink} onPress={navigateToTagList}>
              <Icon name="pricetag-outline" size={16} color={C.textSecondary} />
              <Text style={[s.tagsLinkText, styles.fontSemiBold]}>Ver por etiquetas</Text>
              <Icon name="chevron-forward" size={16} color={C.gray40} />
            </Pressable>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  scrollContent: { padding: 16, paddingBottom: 32 },
  searchWrap: {
    alignItems: 'center',
    backgroundColor: C.surfaceLight,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: 12,
    height: 44,
    marginBottom: 20,
  },
  searchInput: { flex: 1, fontSize: 14, color: C.textPrimary },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 18, color: C.textPrimary, marginBottom: 14 },
  emptyBox: { alignItems: 'center', justifyContent: 'center', paddingVertical: 28 },
  emptyText: { fontSize: 13, color: C.gray40, textAlign: 'center' },
  categoryGrid: { flexWrap: 'wrap', justifyContent: 'space-between' },
  categoryTile: {
    width: CATEGORY_TILE_WIDTH,
    height: 130,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: GRID_GAP,
    position: 'relative',
  },
  categoryImage: { width: '100%', height: '100%' },
  categoryOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '55%',
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  categoryTileTitle: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 12,
    fontSize: 15,
    color: '#FFFFFF',
  },
  viewMoreBox: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: `${C.brand5}1A`,
  },
  viewMoreText: { fontSize: 13, color: C.textPrimary },
  tagsLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'flex-start',
    paddingVertical: 10,
    marginTop: 4,
  },
  tagsLinkText: { flex: 1, fontSize: 13.5, color: C.textSecondary },
  grid: { flexWrap: 'wrap', justifyContent: 'space-between' },
  recipeCard: { marginBottom: 16 },
  recipeImageWrap: { position: 'relative' },
  recipeImage: { width: '100%', height: 130, borderRadius: 12 },
  favBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recipeTitle: { fontSize: 14, color: C.textPrimary, marginTop: 8 },
  recipeMetaRow: { marginTop: 4 },
  recipeMeta: { fontSize: 12, color: C.textSecondary },
});

function useStyle() {
  return useResponsiveStyleSheet({
    fontBold: { fontFamily: FONT.bold },
    fontMedium: { fontFamily: FONT.medium },
    fontRegular: { fontFamily: FONT.regular },
    fontSemiBold: { fontFamily: FONT.semiBold },
  });
}

import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, FlatList, SafeAreaView, ActivityIndicator, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useResponsiveStyleSheet } from '@helper/responsiveStyleSheet';
import { C, FONT } from './theme';
import { recipesApi } from '../../api/recipes';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface RecipeCategory {
  id: number;
  title: string;
  recipeCategoryImage?: string;
}

export default function RecipeCategoryListScreen(props: any) {
  const [mCategoryList, setMCategoryList] = useState<RecipeCategory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const styles = useStyle();

  useEffect(() => {
    getCategoryData();
  }, []);

  const getCategoryData = useCallback(async () => {
    setIsLoading(true);
    try {
      let page = 1;
      let totalPages = 1;
      const allCategories: RecipeCategory[] = [];
      while (page <= totalPages) {
        const res = await recipesApi.getCategories(page);
        totalPages = res.data.pagination?.totalPages ?? 1;
        allCategories.push(
          ...(res.data.data ?? []).map((c) => ({
            id: c.id,
            title: c.title,
            recipeCategoryImage: c.recipe_category_image ?? undefined,
          }))
        );
        page++;
      }
      setMCategoryList(allCategories);
    } catch (e: any) {
      // toast(e.toString());
    } finally {
      setIsLoading(false);
    }
  }, []);

  const columnWidth = (SCREEN_WIDTH - 48) / 2;

  const handleCategoryPress = (item: RecipeCategory) => {
    props.navigation.navigate('MigratedRecipeListV2', {
      categoryId: item.id,
      title: item.title,
    });
  };

  return (
    <SafeAreaView style={[s.container]}>
      <View style={[s.header]}>
        <TouchableOpacity onPress={() => props.navigation.goBack()} style={s.backBtn}>
          <Ionicons name="chevron-back" size={24} color={C.white} />
        </TouchableOpacity>
        <Text style={[s.headerTitle, styles.fontBold]}>Categories</Text>
        <View style={s.backBtn} />
      </View>

      <View style={s.body}>
        {isLoading ? (
          <View style={s.center}>
            <ActivityIndicator size="large" color={C.brand5} />
          </View>
        ) : mCategoryList.length === 0 ? (
          <View style={s.center}>
            <Ionicons name="folder-open-outline" size={64} color={C.gray40} />
            <Text style={[s.emptyText, styles.fontMedium]}>No categories found</Text>
          </View>
        ) : (
          <ScrollView contentContainerStyle={s.scrollContent}>
            <View style={s.grid}>
              {mCategoryList.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={[s.categoryCard, { width: columnWidth }]}
                  onPress={() => handleCategoryPress(item)}
                  activeOpacity={0.7}
                >
                  {item.recipeCategoryImage ? (
                    <Image
                      source={{ uri: item.recipeCategoryImage }}
                      style={[s.categoryImage, { width: columnWidth, height: 120 }]}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={[s.categoryImage, { width: columnWidth, height: 120, backgroundColor: C.surfaceLight }]} />
                  )}
                  <Text style={[s.categoryTitle, styles.fontBold]} numberOfLines={1}>
                    {item.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  backBtn: { width: 40, alignItems: 'center' },
  headerTitle: { fontSize: 18, color: C.white },
  body: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 16, color: C.gray30, marginTop: 12 },
  scrollContent: { padding: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  categoryCard: { marginBottom: 16 },
  categoryImage: { borderRadius: 12 },
  categoryTitle: { fontSize: 14, color: C.white, marginTop: 8 },
});

function useStyle() {
  return useResponsiveStyleSheet({
    fontBold: { fontFamily: FONT.bold },
    fontMedium: { fontFamily: FONT.medium },
    fontRegular: { fontFamily: FONT.regular },
    fontSemiBold: { fontFamily: FONT.semiBold },
  });
}

import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, SafeAreaView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useResponsiveStyleSheet } from '@helper/responsiveStyleSheet';
import { C, FONT } from './theme';
import { recipesApi } from '../../api/recipes';

interface RecipeTag {
  id: number;
  title: string;
  recipeTagImage?: string;
}

export default function RecipeTagListScreen(props: any) {
  const [mTagList, setMTagList] = useState<RecipeTag[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const styles = useStyle();

  useEffect(() => {
    getTagData();
  }, []);

  const getTagData = useCallback(async () => {
    setIsLoading(true);
    try {
      let page = 1;
      let totalPages = 1;
      const allTags: RecipeTag[] = [];
      while (page <= totalPages) {
        const res = await recipesApi.getTags(page);
        totalPages = res.data.pagination?.totalPages ?? 1;
        allTags.push(
          ...(res.data.data ?? []).map((t) => ({
            id: t.id,
            title: t.title,
            recipeTagImage: t.recipe_tag_image ?? undefined,
          }))
        );
        page++;
      }
      setMTagList(allTags);
    } catch (e: any) {
      // toast(e.toString());
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleTagPress = (item: RecipeTag) => {
    props.navigation.navigate('MigratedRecipeListV2', {
      tagId: item.id,
      title: item.title,
    });
  };

  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => props.navigation.goBack()} style={s.backBtn}>
          <Ionicons name="chevron-back" size={24} color={C.white} />
        </TouchableOpacity>
        <Text style={[s.headerTitle, styles.fontBold]}>Tags</Text>
        <View style={s.backBtn} />
      </View>

      <View style={s.body}>
        {isLoading ? (
          <View style={s.center}>
            <ActivityIndicator size="large" color={C.orange} />
          </View>
        ) : mTagList.length === 0 ? (
          <View style={s.center}>
            <Ionicons name="pricetags-outline" size={64} color={C.gray40} />
            <Text style={[s.emptyText, styles.fontMedium]}>No tags found</Text>
          </View>
        ) : (
          <ScrollView contentContainerStyle={s.scrollContent}>
            <View style={s.tagWrap}>
              {mTagList.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={s.tagChip}
                  onPress={() => handleTagPress(item)}
                  activeOpacity={0.7}
                >
                  <Text style={[s.tagText, { color: C.textPrimary }]}>{item.title}</Text>
                  {item.recipeTagImage ? (
                    <Image
                      source={{ uri: item.recipeTagImage }}
                      style={s.tagImage}
                    />
                  ) : null}
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
  headerTitle: { fontSize: 18, color: C.white, flex: 1, textAlign: 'center' },
  body: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 16, color: C.gray30, marginTop: 12 },
  scrollContent: { padding: 16 },
  tagWrap: { flexDirection: 'row', flexWrap: 'wrap' },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: `${C.brand5}80`,
    backgroundColor: C.surfaceLight,
    marginRight: 12,
    marginBottom: 12,
  },
  tagText: { fontSize: 14 },
  tagImage: { width: 20, height: 20, borderRadius: 10, marginLeft: 8 },
});

function useStyle() {
  return useResponsiveStyleSheet({
    fontBold: { fontFamily: FONT.bold },
    fontMedium: { fontFamily: FONT.medium },
    fontRegular: { fontFamily: FONT.regular },
    fontSemiBold: { fontFamily: FONT.semiBold },
  });
}

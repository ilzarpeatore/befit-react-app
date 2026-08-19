import React, { useState, useEffect, useCallback } from 'react';
import { ScrollView, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Box } from '@components/ui/box';
import { Text } from '@components/ui/text';
import { Heading } from '@components/ui/heading';
import { Button } from '@components/ui/button';
import { Pressable } from '@components/ui/pressable';
import { Icon } from '@components/ui/icon';
import { C } from './theme';
import { recipesApi } from '../../api/recipes';

interface RecipeTag {
  id: number;
  title: string;
  recipeTagImage?: string;
}

export default function RecipeTagListScreen(props: any) {
  const [mTagList, setMTagList] = useState<RecipeTag[]>([]);
  const [isLoading, setIsLoading] = useState(false);

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
    <SafeAreaView style={{ flex: 1 }} className="bg-background">
      <Box className="flex-row items-center justify-between p-4">
        <Button variant="ghost" size="icon" onPress={() => props.navigation.goBack()}>
          <Icon name="chevron-back" size={24} className="text-foreground" />
        </Button>
        <Heading size="sm">Tags</Heading>
        <Box className="w-10" />
      </Box>

      <Box className="flex-1">
        {isLoading ? (
          <Box className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color={C.orange} />
          </Box>
        ) : mTagList.length === 0 ? (
          <Box className="flex-1 items-center justify-center">
            <Icon name="pricetags-outline" size={64} className="text-muted-foreground" />
            <Text weight="medium" muted style={{ marginTop: 12 }}>No tags found</Text>
          </Box>
        ) : (
          <ScrollView contentContainerStyle={{ padding: 16 }}>
            <Box className="flex-row flex-wrap gap-3">
              {mTagList.map((item) => (
                <Pressable
                  key={item.id}
                  className="flex-row items-center gap-2 px-4 py-2 rounded-pill border border-border bg-card"
                  onPress={() => handleTagPress(item)}
                >
                  <Text size="sm" className="text-foreground">{item.title}</Text>
                  {item.recipeTagImage ? (
                    <Image
                      source={{ uri: item.recipeTagImage }}
                      style={{ width: 20, height: 20, borderRadius: 10 }}
                    />
                  ) : null}
                </Pressable>
              ))}
            </Box>
          </ScrollView>
        )}
      </Box>
    </SafeAreaView>
  );
}

import React, { useState, useEffect, useRef } from 'react';
import { ScrollView, Image, ActivityIndicator } from 'react-native';
import { Box } from '@components/ui/box';
import { Text } from '@components/ui/text';
import { Heading } from '@components/ui/heading';
import { Button } from '@components/ui/button';
import { Pressable } from '@components/ui/pressable';
import { Icon } from '@components/ui/icon';
import { C } from './theme';
import { dietApi } from '../../api/diet';

function DietCategoryComponent({ item, onCall }: { item: any; onCall?: () => void }) {
  return (
    <Pressable
      className="rounded-sm overflow-hidden"
      style={{ width: '100%', height: 140 }}
      onPress={onCall}
    >
      <Image
        source={{ uri: item.image || '' }}
        style={{ width: '100%', height: '100%' }}
        resizeMode="cover"
      />
      <Box
        style={{ position: 'absolute', left: 0, right: 0, bottom: 0 }}
        className="flex-row items-center justify-between bg-black/50 px-3.5 py-2.5"
      >
        <Text weight="semibold" className="text-white">{item.title || 'Category'}</Text>
        <Text size="xs" className="text-muted-foreground">{item.count || 0} items</Text>
      </Box>
    </Pressable>
  );
}

export default function ViewDietCategoryScreen(props: any) {
  const [dietCategoryList, setDietCategoryList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [numPage, setNumPage] = useState(1);
  const [isLastPage, setIsLastPage] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    getDietCategoryData();
  }, []);

  const getDietCategoryData = async () => {
    setIsLoading(true);
    try {
      const value = await dietApi.getCategories(page);
      const items = (value.data.data ?? []).map((cat) => ({
        id: cat.id,
        title: cat.title,
        image: cat.categorydiet_image,
        // The categorydiet-list endpoint doesn't return an item count per
        // category, so this stays at 0 (not derived from real backend data).
        count: 0,
      }));
      setNumPage((value.data as any).pagination?.totalPages ?? 1);
      if (page === 1) setDietCategoryList(items);
      else setDietCategoryList((prev) => [...prev, ...items]);
      setIsLoading(false);
    } catch (e) {
      setIsLastPage(true);
      setIsLoading(false);
    }
  };

  const handleScroll = ({ nativeEvent }: any) => {
    const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
    const isAtEnd = layoutMeasurement.height + contentOffset.y >= contentSize.height - 20;
    if (isAtEnd && !isLastPage && !isLoading && page < numPage) {
      setPage(page + 1);
      getDietCategoryData();
    }
  };

  const handleCategoryPress = (item: any) => {
    props.navigation.navigate('MigratedViewAllDiet', {
      mTitle: item.title || '',
      isCategory: true,
      mCategoryId: item.id,
    });
  };

  return (
    <Box className="flex-1 bg-background">
      <Box style={{ paddingTop: 50, paddingBottom: 12 }} className="flex-row items-center px-4 gap-3">
        <Button variant="ghost" size="icon" onPress={() => props.navigation.goBack()}>
          <Icon name="arrow-back" size={24} className="text-foreground" />
        </Button>
        <Heading size="md">Diet Categories</Heading>
      </Box>

      <ScrollView
        ref={scrollRef}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16, paddingTop: 4 }}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        <Box className="gap-4">
          {dietCategoryList.map((item, index) => (
            <DietCategoryComponent
              key={item.id || index}
              item={item}
              onCall={() => handleCategoryPress(item)}
            />
          ))}
        </Box>
      </ScrollView>

      {isLoading && (
        <Box
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
          className="items-center justify-center bg-black/30"
        >
          <ActivityIndicator size="large" color={C.orange} />
        </Box>
      )}
    </Box>
  );
}

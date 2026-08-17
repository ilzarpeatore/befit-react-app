import React, { useState, useEffect, useRef } from 'react';
import { FlatList, Image, ActivityIndicator } from 'react-native';
import { Box } from '@components/ui/box';
import { Text } from '@components/ui/text';
import { Heading } from '@components/ui/heading';
import { Button } from '@components/ui/button';
import { Pressable } from '@components/ui/pressable';
import { Icon } from '@components/ui/icon';
import { C } from './theme';
import { dietApi } from '../../api/diet';

function DietItem({ item, onCall }: { item: any; onCall?: () => void }) {
  return (
    <Pressable
      className="flex-row bg-card rounded-sm overflow-hidden"
      style={{ marginBottom: 12 }}
      onPress={onCall}
    >
      <Image source={{ uri: item.image || '' }} style={{ width: 110, height: 100 }} resizeMode="cover" />
      <Box className="flex-1 justify-center p-3">
        <Text weight="semibold" size="sm" numberOfLines={2} style={{ marginBottom: 4 }}>
          {item.title || 'Diet Plan'}
        </Text>
        <Text size="xs" muted numberOfLines={1} style={{ marginBottom: 6 }}>
          {item.category || ''} {item.duration ? `• ${item.duration}` : ''}
        </Text>
        <Box className="flex-row items-center gap-1">
          <Icon name="flame" size={14} color={C.orange} />
          <Text size="xs" weight="medium" style={{ color: C.orange }}>{item.calories || '0'} kcal</Text>
        </Box>
      </Box>
    </Pressable>
  );
}

export default function ViewAllDiet(props: any) {
  const {
    isFeatured = false,
    isCategory = false,
    mCategoryId,
    mTitle = 'Diets',
    isAssign = false,
    isFav = false,
    showAppBar = true,
  } = props.route?.params || {};

  const [dietList, setDietList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [numPage, setNumPage] = useState(1);
  const [isLastPage, setIsLastPage] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    getDietData();
  }, []);

  const getDietData = async (targetPage: number = page) => {
    setIsLoading(true);
    try {
      const res = isFav
        ? await dietApi.getFavourite(targetPage)
        : isAssign
        ? await dietApi.getAssignedDiets(targetPage)
        : await dietApi.getList({
            page: targetPage,
            ...(isFeatured ? { is_featured: true } : {}),
            ...(isCategory && mCategoryId ? { categorydiet_id: mCategoryId } : {}),
          });

      const items = (res.data.data ?? []).map((d: any) => ({
        id: d.id,
        title: d.title,
        image: d.diet_image,
        calories: d.calories,
      }));

      setNumPage(res.data.pagination?.totalPages ?? 1);
      setIsLastPage(targetPage >= (res.data.pagination?.totalPages ?? 1));
      if (targetPage === 1) setDietList(items);
      else setDietList((prev) => [...prev, ...items]);
    } catch (e) {
      setIsLastPage(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadMore = () => {
    if (!isLastPage && !isLoading && page < numPage) {
      const nextPage = page + 1;
      setPage(nextPage);
      getDietData(nextPage);
    }
  };

  const handleItemCall = (item: any) => {
    props.navigation.navigate('MigratedDietDetail', { dietModel: item });
  };

  const renderEmpty = () => {
    if (isLoading) return <ActivityIndicator size="large" color={C.orange} style={{ marginTop: 60 }} />;
    return (
      <Box className="items-center" style={{ paddingVertical: 60 }}>
        <Text size="sm" muted>No results found</Text>
      </Box>
    );
  };

  return (
    <Box className="flex-1 bg-background">
      {showAppBar && (
        <Box style={{ paddingTop: 50, paddingBottom: 12 }} className="flex-row items-center px-4 gap-3">
          <Button variant="ghost" size="icon" onPress={() => props.navigation.goBack()}>
            <Icon name="arrow-back" size={24} className="text-foreground" />
          </Button>
          <Heading size="md">{mTitle}</Heading>
        </Box>
      )}

      <FlatList
        ref={flatListRef}
        data={dietList}
        keyExtractor={(item, i) => String(item.id || i)}
        renderItem={({ item }) => <DietItem item={item} onCall={() => handleItemCall(item)} />}
        contentContainerStyle={[
          { paddingHorizontal: 16, paddingVertical: 8 },
          (isFav || isAssign) && { paddingVertical: 16 },
        ]}
        showsVerticalScrollIndicator={false}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
        ListEmptyComponent={renderEmpty}
      />
    </Box>
  );
}

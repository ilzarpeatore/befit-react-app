import React, { useState, useEffect, useRef } from 'react';
import { ScrollView, Image, ActivityIndicator } from 'react-native';
import { Box } from '@components/ui/box';
import { Text } from '@components/ui/text';
import { Heading } from '@components/ui/heading';
import { Button } from '@components/ui/button';
import { Pressable } from '@components/ui/pressable';
import { Icon } from '@components/ui/icon';
import { exercisesApi } from '../../api/exercises';

interface LevelItem {
  id: number;
  title: string;
  image?: string;
  description?: string;
  [key: string]: any;
}

export default function ViewLevelScreen(props: any) {
  const [levelList, setLevelList] = useState<LevelItem[]>([]);
  const [page, setPage] = useState(1);
  const [numPage, setNumPage] = useState<number | null>(null);
  const [isLastPage, setIsLastPage] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    getLevelData();
  }, []);

  useEffect(() => {
    if (numPage && page > 1) {
      getLevelDataPagination();
    }
  }, [page]);

  const getLevelData = async () => {
    setIsLoading(true);
    try {
      const value = await exercisesApi.getLevels(page);
      const items = (value.data.data ?? []).map((l) => ({
        id: l.id,
        title: l.title,
      }));
      setNumPage(value.data.pagination?.totalPages ?? 1);
      setIsLastPage(false);
      if (page === 1) setLevelList(items);
      else setLevelList((prev) => [...prev, ...items]);
    } catch (e) {
      setIsLastPage(true);
    } finally {
      setIsLoading(false);
    }
  };

  const getLevelDataPagination = async () => {
    setIsLoading(true);
    try {
      const value = await exercisesApi.getLevels(page);
      const items = (value.data.data ?? []).map((l) => ({
        id: l.id,
        title: l.title,
      }));
      setNumPage(value.data.pagination?.totalPages ?? 1);
      setIsLastPage(false);
      setLevelList((prev) => [...prev, ...items]);
    } catch (e) {
      setIsLastPage(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleScroll = (event: any) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const isAtEnd = layoutMeasurement.height + contentOffset.y >= contentSize.height - 20;
    if (isAtEnd && !isLoading && numPage && page < numPage) {
      setPage((prev) => prev + 1);
    }
  };

  const renderLevelItem = ({ item, index }: { item: LevelItem; index: number }) => (
    <Pressable
      key={item.id?.toString() || index.toString()}
      className="flex-row items-center bg-card rounded-lg overflow-hidden"
      onPress={() =>
        props.navigation.navigate('MigratedSearch', {
          mTitle: item.title,
          isLevel: true,
          id: item.id,
        })
      }
    >
      {item.image ? (
        <Image source={{ uri: item.image }} style={{ width: 60, height: 60 }} resizeMode="cover" />
      ) : null}
      <Box className="flex-1 p-3">
        <Text weight="semibold" numberOfLines={1}>
          {item.title}
        </Text>
        {item.description ? (
          <Text muted size="sm" numberOfLines={2} style={{ marginTop: 4 }}>
            {item.description}
          </Text>
        ) : null}
      </Box>
    </Pressable>
  );

  return (
    <Box className="flex-1 bg-background">
      <Box
        style={{ paddingTop: 48, paddingBottom: 14 }}
        className="flex-row items-center justify-between px-4 bg-card border-b border-border"
      >
        <Button variant="ghost" size="icon" onPress={() => props.navigation?.goBack()}>
          <Icon name="chevron-back" size={24} className="text-foreground" />
        </Button>
        <Heading size="sm">Levels</Heading>
        <Box className="w-10" />
      </Box>

      <Box className="flex-1">
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={{ paddingVertical: 4, paddingHorizontal: 16, gap: 12 }}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          {levelList.map((item, index) => renderLevelItem({ item, index }))}
        </ScrollView>

        {isLoading && (
          <Box
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
            className="items-center justify-center bg-black/40"
          >
            <ActivityIndicator size="large" color="#000000" />
          </Box>
        )}
      </Box>
    </Box>
  );
}

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { SafeAreaView, FlatList, Image, ActivityIndicator } from 'react-native';
import { Box } from '@components/ui/box';
import { Text } from '@components/ui/text';
import { Heading } from '@components/ui/heading';
import { Button } from '@components/ui/button';
import { Pressable } from '@components/ui/pressable';
import { Icon } from '@components/ui/icon';
import { C } from './theme';
import { exercisesApi } from '../../api/exercises';

interface ExerciseModel {
  id?: number;
  title?: string;
  exerciseImage?: string;
  type?: string;
  levelTitle?: string;
  bodypartName?: string;
  [key: string]: any;
}

interface ExerciseHistoryScreenProps {
  navigation: any;
}

export default function ExerciseHistoryScreen(props: ExerciseHistoryScreenProps) {

  const [mExerciseList, setMExerciseList] = useState<ExerciseModel[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [numPage, setNumPage] = useState<number | null>(null);
  const [isLastPage, setIsLastPage] = useState(false);
  const scrollController = useRef<FlatList | null>(null);

  const getExerciseData = useCallback(async () => {
    setIsLoading(true);
    try {
      await exercisesApi.getUserExercises(page).then((res) => {
        const value: any = res.data;
        setNumPage(value.pagination?.totalPages ?? null);
        setIsLastPage(false);
        if (page === 1) setMExerciseList([]);
        const items = (value.data ?? []).map((ex: any) => ({
          id: ex.id,
          title: ex.title,
          exerciseImage: ex.exercise_image,
          type: ex.type,
          levelTitle: ex.level_title,
        }));
        setMExerciseList(prev => [...prev, ...items]);
      });
    } catch (e) {
      setIsLastPage(true);
    } finally {
      setIsLoading(false);
    }
  }, [page]);

  useEffect(() => {
    getExerciseData();
  }, [getExerciseData]);

  const handleEndReached = () => {
    if (!isLoading && !isLastPage && numPage && page < numPage) {
      setPage((prev) => prev + 1);
    }
  };

  const renderExerciseItem = ({ item }: { item: ExerciseModel }) => (
    <Pressable
      className="flex-row items-center bg-card rounded-sm"
      style={{ padding: 12, marginBottom: 10 }}
      onPress={() =>
        props.navigation.navigate('MigratedExerciseInfo', {
          mExerciseId: item.id,
          mExerciseName: item.title,
        })
      }
    >
      <Image
        source={{ uri: item.exerciseImage || '' }}
        style={{ width: 50, height: 50, borderRadius: 10, backgroundColor: C.border }}
      />
      <Box className="flex-1" style={{ marginLeft: 12 }}>
        <Text weight="semibold" size="sm" numberOfLines={1}>{item.title || ''}</Text>
        {item.levelTitle ? (
          <Text size="xs" muted style={{ marginTop: 2 }}>{item.levelTitle}</Text>
        ) : null}
      </Box>
      <Icon name="chevron-forward" size={18} className="text-muted-foreground" />
    </Pressable>
  );

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-background">
      <Box className="flex-row items-center px-2 py-3 bg-background">
        <Button variant="ghost" size="icon" onPress={() => props.navigation.goBack()}>
          <Icon name="chevron-back" size={24} className="text-foreground" />
        </Button>
        <Heading size="sm" className="flex-1 text-center">Exercise History</Heading>
        <Box style={{ width: 40 }} />
      </Box>

      <Box className="flex-1">
        <FlatList
          ref={scrollController}
          data={mExerciseList}
          renderItem={renderExerciseItem}
          keyExtractor={(item, index) => `${item.id}-${index}`}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.5}
          contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 4 }}
          ListEmptyComponent={
            !isLoading ? (
              <Box className="flex-1 items-center justify-center" style={{ paddingVertical: 60 }}>
                <Text size="sm" muted>No exercises found</Text>
              </Box>
            ) : null
          }
        />
        {isLoading && (
          <Box
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
            className="items-center justify-center"
          >
            <ActivityIndicator size="large" color={C.orange} />
          </Box>
        )}
      </Box>
    </SafeAreaView>
  );
}

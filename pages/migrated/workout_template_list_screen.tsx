import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ScrollView, SafeAreaView, ActivityIndicator, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { Box } from '@components/ui/box';
import { Text } from '@components/ui/text';
import { Heading } from '@components/ui/heading';
import { Button } from '@components/ui/button';
import { Pressable } from '@components/ui/pressable';
import { Icon } from '@components/ui/icon';
import { C } from './theme';
import { workoutTemplateApi, WorkoutTemplateListItem } from '../../api/workoutTemplate';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Navegación libre de "Workouts sueltos" (sistema v2, WorkoutTemplate) — sección
// separada de "Rutinas" en Home, que sigue usando el catálogo legacy (Workout).
// Un template marcado is_exclusive muestra candado; el acceso real (blocks vacíos
// o completos) lo decide el backend en workout-template-detail, esto solo pinta
// el estado para que el cliente sepa qué puede abrir libremente.
export default function WorkoutTemplateListScreen(props: any) {
  const [items, setItems] = useState<WorkoutTemplateListItem[]>([]);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isLastPage, setIsLastPage] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const loadWorkouts = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await workoutTemplateApi.getList(page, 20);
      const data = res.data.data ?? [];
      if (page === 1) {
        setItems(data);
      } else {
        setItems((prev) => [...prev, ...data]);
      }
      const totalPages = res.data.pagination?.totalPages ?? 1;
      setIsLastPage(page >= totalPages);
    } catch (e) {
      // best-effort, deja la lista como estaba
    } finally {
      setIsLoading(false);
    }
  }, [page]);

  useEffect(() => {
    loadWorkouts();
  }, [loadWorkouts]);

  const handleScroll = (event: any) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const paddingToBottom = 20;
    if (layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom) {
      if (!isLastPage && !isLoading) {
        setPage((prev) => prev + 1);
      }
    }
  };

  const columnWidth = (SCREEN_WIDTH - 48) / 2;

  return (
    <SafeAreaView className="flex-1 bg-background">
      <Box className="flex-row items-center justify-between p-4">
        <Button variant="ghost" size="icon" onPress={() => props.navigation.goBack()}>
          <Icon name="chevron-back" size={24} className="text-foreground" />
        </Button>
        <Heading size="sm">Workouts</Heading>
        <Box className="w-10" />
      </Box>

      <Box className="flex-1">
        {isLoading && page === 1 ? (
          <Box className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color={C.orange} />
          </Box>
        ) : !isLoading && items.length === 0 ? (
          <Box className="flex-1 items-center justify-center">
            <Text muted>No workouts found</Text>
          </Box>
        ) : (
          <ScrollView
            ref={scrollRef}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            contentContainerStyle={{ padding: 16 }}
          >
            <Box className="flex-row flex-wrap justify-between">
              {items.map((item) => {
                const locked = item.is_exclusive && !item.is_accessible;
                return (
                  <Pressable
                    key={item.id}
                    style={{ width: columnWidth, marginBottom: 16 }}
                    onPress={() =>
                      props.navigation.navigate('MigratedWorkoutPreview', {
                        workoutTemplateId: item.id,
                        mTitle: item.title,
                      })
                    }
                  >
                    {item.thumbnail ? (
                      <Image
                        source={{ uri: item.thumbnail }}
                        style={{ width: columnWidth, height: 140, borderRadius: 12 }}
                        contentFit="cover"
                      />
                    ) : (
                      <Box
                        className="bg-secondary"
                        style={{ width: columnWidth, height: 140, borderRadius: 12 }}
                      />
                    )}
                    {locked && (
                      <Box
                        className="flex-row items-center"
                        style={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          backgroundColor: 'rgba(0,0,0,0.6)',
                          borderRadius: 12,
                          paddingHorizontal: 8,
                          paddingVertical: 4,
                          gap: 4,
                        }}
                      >
                        <Icon name="lock-closed" size={14} color="#FFFFFF" />
                        <Text size="xs" weight="semibold" style={{ color: '#FFFFFF' }}>
                          Exclusive
                        </Text>
                      </Box>
                    )}
                    <Text weight="bold" numberOfLines={1} style={{ marginTop: 8 }}>
                      {item.title}
                    </Text>
                  </Pressable>
                );
              })}
            </Box>
            {isLoading && page > 1 && (
              <ActivityIndicator size="small" color={C.orange} style={{ marginVertical: 16 }} />
            )}
          </ScrollView>
        )}
      </Box>
    </SafeAreaView>
  );
}

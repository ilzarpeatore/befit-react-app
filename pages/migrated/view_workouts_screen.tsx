import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
  TextInput,
  StyleSheet,
} from 'react-native';
import { Box } from '@components/ui/box';
import { Text } from '@components/ui/text';
import { Pressable } from '@components/ui/pressable';
import { Icon } from '@components/ui/icon';
import { Spinner } from '@components/ui/spinner';
import { C, FONT } from './theme';
import { workoutsApi } from '../../api/workouts';
import { exercisesApi, BodyPartItem } from '../../api/exercises';

interface FilterOption {
  id: number;
  title: string;
}

interface WorkoutItem {
  id: number;
  title: string;
  image?: string;
  workoutTypeTitle?: string;
  levelTitle?: string;
  isFavourite?: number;
  isPremium?: number;
  [key: string]: any;
}

export default function ViewWorkoutsScreen(props: any) {
  const {
    isFav = false,
    isAssign = false,
    showAppbar = true,
  } = props.route?.params || {};

  const [workoutList, setWorkoutList] = useState<WorkoutItem[]>([]);
  const [page, setPage] = useState(1);
  const [numPage, setNumPage] = useState<number | null>(null);
  const [isLastPage, setIsLastPage] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  // Filtros — solo aplicables al modo de navegación libre (no isFav/isAssign,
  // que ya son listas acotadas por su propio endpoint).
  const canFilter = !isFav && !isAssign;
  const [searchText, setSearchText] = useState('');
  const [types, setTypes] = useState<FilterOption[]>([]);
  const [levels, setLevels] = useState<FilterOption[]>([]);
  const [bodyParts, setBodyParts] = useState<BodyPartItem[]>([]);
  const [selectedType, setSelectedType] = useState<number | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const [selectedBodyPart, setSelectedBodyPart] = useState<number | null>(null);
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    getWorkoutData(1);
    if (canFilter) {
      workoutsApi.getTypes().then((res) => setTypes(res.data?.data ?? [])).catch(() => {});
      workoutsApi.getLevels().then((res) => setLevels(res.data?.data ?? [])).catch(() => {});
      exercisesApi.getBodyParts().then((res) => setBodyParts(res.data?.data ?? [])).catch(() => {});
    }
  }, []);

  useEffect(() => {
    if (numPage && page > 1) {
      getWorkoutData(page);
    }
  }, [page]);

  const getWorkoutData = async (pageNum: number) => {
    setIsLoading(true);
    try {
      const hasFilters = canFilter && (!!selectedType || !!selectedLevel || !!selectedBodyPart || !!searchText.trim());
      const apiCall = isFav
        ? workoutsApi.getFavourite(pageNum)
        : isAssign
          ? workoutsApi.getAssigned(pageNum)
          : hasFilters
            ? workoutsApi.getFilteredList({
                page: pageNum,
                ...(selectedType ? { workout_type_id: selectedType } : {}),
                ...(selectedLevel ? { level_ids: selectedLevel } : {}),
                ...(selectedBodyPart ? { bodypart_ids: String(selectedBodyPart) } : {}),
                ...(searchText.trim() ? { title: searchText.trim() } : {}),
              })
            : workoutsApi.getList(pageNum);
      await apiCall.then((res) => {
        const value: any = res.data;
        setNumPage(value.pagination?.total_pages ?? null);
        setIsLastPage(false);
        if (pageNum === 1) setWorkoutList([]);
        const items = (value.data ?? []).map((w: any) => ({
          id: w.id,
          title: w.title,
          image: w.workout_image,
          workoutTypeTitle: w.workout_type_title,
          levelTitle: w.level_title,
          isFavourite: w.is_favourite,
          isPremium: w.is_premium,
        }));
        setWorkoutList((prev) => (pageNum === 1 ? items : [...prev, ...items]));
      });
    } catch (e) {
      setIsLastPage(true);
    } finally {
      setIsLoading(false);
    }
  };

  const refetchWithFilters = useCallback(() => {
    setPage(1);
    getWorkoutData(1);
  }, [selectedType, selectedLevel, selectedBodyPart, searchText]);

  const handleSearchChange = (text: string) => {
    setSearchText(text);
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => {
      setPage(1);
      getWorkoutData(1);
    }, 400);
  };

  const toggleType = (id: number) => {
    setSelectedType((prev) => (prev === id ? null : id));
  };

  const toggleLevel = (id: number) => {
    setSelectedLevel((prev) => (prev === id ? null : id));
  };

  const toggleBodyPart = (id: number) => {
    setSelectedBodyPart((prev) => (prev === id ? null : id));
  };

  const isFirstFilterRun = useRef(true);
  useEffect(() => {
    if (!canFilter) return;
    if (isFirstFilterRun.current) {
      isFirstFilterRun.current = false;
      return;
    }
    refetchWithFilters();
  }, [selectedType, selectedLevel, selectedBodyPart]);

  const handleRefresh = () => {
    if (isFav) {
      setWorkoutList([]);
      setPage(1);
      getWorkoutData(1);
    }
  };

  const handleScroll = (event: any) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const isAtEnd = layoutMeasurement.height + contentOffset.y >= contentSize.height - 20;
    if (isAtEnd && !isLoading && numPage && page < numPage) {
      setPage((prev) => prev + 1);
    }
  };

  const renderWorkoutItem = ({ item, index }: { item: WorkoutItem; index: number }) => (
    <TouchableOpacity
      key={item.id?.toString() || index.toString()}
      style={workoutItemStyle}
      activeOpacity={0.7}
      onPress={() => {
        props.navigation?.navigate('MigratedWorkoutDetail', { id: item.id });
      }}
    >
      {item.image ? (
        <Image source={{ uri: item.image }} style={{ width: 60, height: 60, borderRadius: 10 }} resizeMode="cover" />
      ) : null}
      <Box className="flex-1" style={{ marginLeft: 12 }}>
        <Text weight="semibold" size="sm" numberOfLines={1}>{item.title}</Text>
        {item.workoutTypeTitle ? (
          <Text size="xs" muted numberOfLines={1} style={{ marginTop: 2 }}>{item.workoutTypeTitle}</Text>
        ) : null}
        <Box className="flex-row items-center gap-2" style={{ marginTop: 4 }}>
          {item.levelTitle ? (
            <Text size="xs" style={{ color: C.gray30 }}>{item.levelTitle}</Text>
          ) : null}
          {item.isPremium === 1 && (
            <Box className="rounded-sm" style={{ backgroundColor: C.orange, paddingHorizontal: 6, paddingVertical: 2 }}>
              <Text weight="bold" size="xs" style={{ fontSize: 10, color: '#FFFFFF' }}>PRO</Text>
            </Box>
          )}
        </Box>
      </Box>
      <Icon name="chevron-forward" size={20} color={C.gray30} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-background">
      {showAppbar !== false && (
        <Box className="flex-row items-center justify-between px-4 py-3.5 bg-card border-b border-border">
          <TouchableOpacity onPress={() => props.navigation?.goBack()}>
            <Icon name="chevron-back" size={24} className="text-foreground" />
          </TouchableOpacity>
          <Text weight="semibold" size="lg">Workouts</Text>
          <Box className="w-6" />
        </Box>
      )}

      {canFilter && (
        <>
          <Box className="flex-row items-center bg-secondary rounded-sm mx-4 px-3 py-2 gap-2" style={{ marginTop: 12 }}>
            <Icon name="search" size={18} className="text-muted-foreground" />
            <TextInput
              style={{ flex: 1, fontFamily: FONT.regular, fontSize: 14, color: C.textPrimary, padding: 0 }}
              placeholder="Search workouts..."
              placeholderTextColor={C.textSecondary}
              value={searchText}
              onChangeText={handleSearchChange}
            />
            {searchText.length > 0 && (
              <TouchableOpacity onPress={() => handleSearchChange('')}>
                <Icon name="close-circle" size={18} className="text-muted-foreground" />
              </TouchableOpacity>
            )}
          </Box>

          {types.length > 0 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 8, gap: 8 }}>
              {types.map((t) => (
                <Pressable
                  key={t.id}
                  className={`rounded-pill px-3.5 py-2 ${selectedType === t.id ? '' : 'bg-secondary'}`}
                  style={selectedType === t.id ? { backgroundColor: '#1C1C1E' } : undefined}
                  onPress={() => toggleType(t.id)}
                >
                  <Text weight="medium" size="sm" style={selectedType === t.id ? { color: '#FFFFFF' } : { color: C.textSecondary }}>
                    {t.title}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          )}

          {levels.length > 0 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 8, gap: 8 }}>
              {levels.map((l) => (
                <Pressable
                  key={l.id}
                  className={`rounded-pill px-3.5 py-2 ${selectedLevel === l.id ? '' : 'bg-secondary'}`}
                  style={selectedLevel === l.id ? { backgroundColor: '#1C1C1E' } : undefined}
                  onPress={() => toggleLevel(l.id)}
                >
                  <Text weight="medium" size="sm" style={selectedLevel === l.id ? { color: '#FFFFFF' } : { color: C.textSecondary }}>
                    {l.title}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          )}

          {bodyParts.length > 0 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 8, gap: 8 }}>
              {bodyParts.map((bp) => (
                <Pressable
                  key={bp.id}
                  className={`rounded-pill px-3.5 py-2 ${selectedBodyPart === bp.id ? '' : 'bg-secondary'}`}
                  style={selectedBodyPart === bp.id ? { backgroundColor: '#1C1C1E' } : undefined}
                  onPress={() => toggleBodyPart(bp.id)}
                >
                  <Text weight="medium" size="sm" style={selectedBodyPart === bp.id ? { color: '#FFFFFF' } : { color: C.textSecondary }}>
                    {bp.title}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          )}
        </>
      )}

      <Box className="flex-1">
        {workoutList.length > 0 ? (
          <ScrollView
            ref={scrollRef}
            contentContainerStyle={[
              { paddingVertical: 4, paddingHorizontal: 16 },
              (isFav || isAssign) && { paddingVertical: 16 },
            ]}
            onScroll={handleScroll}
            scrollEventThrottle={16}
          >
            {workoutList.map((item, index) => renderWorkoutItem({ item, index }))}
          </ScrollView>
        ) : (
          !isLoading && (
            <Box className="flex-1 items-center justify-center">
              <Text muted size="lg">No Workouts Found</Text>
            </Box>
          )
        )}

        {isLoading && (
          <Box style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.4)' }]} className="items-center justify-center">
            <Spinner size="large" color="#FFFFFF" />
          </Box>
        )}
      </Box>
    </SafeAreaView>
  );
}

const workoutItemStyle = {
  flexDirection: 'row' as const,
  alignItems: 'center' as const,
  backgroundColor: C.surfaceLight,
  borderRadius: 12,
  marginBottom: 12,
  overflow: 'hidden' as const,
  padding: 10,
};

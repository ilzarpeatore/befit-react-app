import React, { useState, useEffect, useRef } from 'react';
import { ScrollView, ActivityIndicator, Image, SafeAreaView } from 'react-native';
import { Box } from '@components/ui/box';
import { Text } from '@components/ui/text';
import { Heading } from '@components/ui/heading';
import { Pressable } from '@components/ui/pressable';
import { Icon } from '@components/ui/icon';
import { Input, InputField } from '@components/ui/input';
import { C } from './theme';
import { workoutsApi } from '../../api/workouts';
import { exercisesApi, BodyPartItem } from '../../api/exercises';

interface FilterOption {
  id: number;
  title: string;
}

interface WorkoutDetail {
  id: number;
  title?: string;
  workoutImage?: string;
  levelTitle?: string;
  isPremium?: number;
  isFavourite?: number;
  isFavouriteLocally?: number | null;
}

interface FilterWorkoutScreenProps {
  navigation?: any;
  route?: any;
}

export default function FilterWorkoutScreen(props: FilterWorkoutScreenProps) {
  const { navigation, route } = props;
  const workoutId = route?.params?.id;

  const [mWorkoutList, setMWorkoutList] = useState<WorkoutDetail[]>([]);
  const [levels, setLevels] = useState<FilterOption[]>([]);
  const [types, setTypes] = useState<FilterOption[]>([]);
  const [bodyParts, setBodyParts] = useState<BodyPartItem[]>([]);
  const [searchText, setSearchText] = useState('');
  const [selectedType, setSelectedType] = useState<number | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const [selectedBodyPart, setSelectedBodyPart] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [numPage, setNumPage] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLastPage, setIsLastPage] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const getWorkoutData = async (pageNum: number) => {
    setIsLoading(true);
    try {
      const hasFilters = !!selectedType || !!selectedLevel || !!selectedBodyPart || !!searchText.trim();
      const params: any = { page: pageNum };
      if (selectedType) params.workout_type_id = selectedType;
      if (selectedLevel) params.level_ids = selectedLevel;
      if (selectedBodyPart) params.bodypart_ids = String(selectedBodyPart);
      if (searchText.trim()) params.title = searchText.trim();
      const res = hasFilters ? await workoutsApi.getFilteredList(params) : await workoutsApi.getList(pageNum);
      const value: any = res.data;
      const data: WorkoutDetail[] = (value.data ?? []).map((w: any) => ({
        id: w.id,
        title: w.title,
        workoutImage: w.workout_image,
        levelTitle: w.level_title,
        isPremium: w.is_premium,
        isFavourite: w.is_favourite,
      }));
      setNumPage(value.pagination?.total_pages ?? 1);
      setIsLastPage(false);
      setMWorkoutList((prev) => (pageNum === 1 ? data : [...prev, ...data]));
    } catch {
      setIsLastPage(true);
    } finally {
      setIsLoading(false);
    }
  };

  const setWorkoutFav = async (id?: number) => {
    try {
      if (id) await workoutsApi.setFavourite(id);
    } catch {}
  };

  useEffect(() => {
    getWorkoutData(1);
    workoutsApi.getTypes().then((res) => setTypes((res.data as any)?.data ?? [])).catch(() => {});
    workoutsApi.getLevels().then((res) => setLevels((res.data as any)?.data ?? [])).catch(() => {});
    exercisesApi.getBodyParts().then((res) => setBodyParts(res.data?.data ?? [])).catch(() => {});
  }, []);

  const isFirstFilterRun = useRef(true);
  useEffect(() => {
    if (isFirstFilterRun.current) {
      isFirstFilterRun.current = false;
      return;
    }
    setPage(1);
    getWorkoutData(1);
  }, [selectedType, selectedLevel, selectedBodyPart]);

  const handleSearchChange = (text: string) => {
    setSearchText(text);
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => {
      setPage(1);
      getWorkoutData(1);
    }, 400);
  };

  const handleWorkoutTap = (item: WorkoutDetail) => {
    navigation?.navigate('MigratedWorkoutDetail', { id: item.id });
  };

  const handleFavTap = (item: WorkoutDetail, index: number) => {
    setMWorkoutList((prev) => {
      const updated = [...prev];
      const w = { ...updated[index] };
      if (w.isFavourite === 0 && (w.isFavouriteLocally == null || w.isFavouriteLocally === 0)) {
        w.isFavouriteLocally = 1;
        w.isFavourite = 1;
      } else {
        w.isFavouriteLocally = 0;
        w.isFavourite = 0;
      }
      updated[index] = w;
      return updated;
    });
    setWorkoutFav(item.id);
  };

  const renderChip = (
    key: number,
    title: string,
    isActive: boolean,
    onPress: () => void
  ) => (
    <Pressable
      key={key}
      className={`rounded-pill px-4 py-2 border ${isActive ? 'bg-foreground border-foreground' : 'bg-secondary border-border'}`}
      onPress={onPress}
    >
      <Text size="sm" weight={isActive ? 'semibold' : 'medium'} className={isActive ? 'text-background' : 'text-muted-foreground'}>
        {title}
      </Text>
    </Pressable>
  );

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-background">
      <Heading size="lg" className="p-4">Workouts</Heading>
      <Box className="flex-row items-center bg-secondary rounded-md mx-4 px-3 gap-2" style={{ marginBottom: 8 }}>
        <Icon name="search" size={18} className="text-muted-foreground" />
        <Input className="flex-1 border-0 bg-transparent">
          <InputField
            placeholder="Search workouts..."
            value={searchText}
            onChangeText={handleSearchChange}
            className="px-0"
          />
        </Input>
        {searchText.length > 0 && (
          <Pressable onPress={() => handleSearchChange('')}>
            <Icon name="close-circle" size={18} className="text-muted-foreground" />
          </Pressable>
        )}
      </Box>
      <ScrollView ref={scrollRef} contentContainerStyle={{ paddingBottom: 20 }}>
        {types.length > 0 && (
          <Box className="flex-row flex-wrap gap-2 px-4 py-1.5">
            {types.map((t) => renderChip(t.id, t.title, selectedType === t.id, () => setSelectedType((prev) => (prev === t.id ? null : t.id))))}
          </Box>
        )}
        {levels.length > 0 && (
          <Box className="flex-row flex-wrap gap-2 px-4 py-1.5">
            {levels.map((l) => renderChip(l.id, l.title, selectedLevel === l.id, () => setSelectedLevel((prev) => (prev === l.id ? null : l.id))))}
          </Box>
        )}
        {bodyParts.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 6, gap: 8 }}>
            {bodyParts.map((bp) => renderChip(bp.id, bp.title, selectedBodyPart === bp.id, () => setSelectedBodyPart((prev) => (prev === bp.id ? null : bp.id))))}
          </ScrollView>
        )}
        <Box className="h-2" />
        {mWorkoutList.length > 0 ? (
          <Box className="px-4 gap-2.5">
            {mWorkoutList.map((item, index) => (
              <Pressable
                key={`${item.id}-${index}`}
                className="flex-row items-center bg-card rounded-md p-2.5 gap-3"
                onPress={() => handleWorkoutTap(item)}
              >
                {item.workoutImage ? (
                  <Image source={{ uri: item.workoutImage }} style={{ width: 72, height: 72, borderRadius: 10 }} resizeMode="cover" />
                ) : (
                  <Box className="bg-muted rounded-md" style={{ width: 72, height: 72 }} />
                )}
                <Box className="flex-1">
                  <Text weight="bold" numberOfLines={1}>{item.title || ''}</Text>
                  <Text size="sm" muted style={{ marginTop: 4 }}>{item.levelTitle || ''}</Text>
                </Box>
                <Pressable className="p-1" onPress={() => handleFavTap(item, index)}>
                  <Icon
                    name={item.isFavourite === 1 ? 'heart' : 'heart-outline'}
                    size={22}
                    color={item.isFavourite === 1 ? C.destructive : C.gray30}
                  />
                </Pressable>
              </Pressable>
            ))}
          </Box>
        ) : (
          !isLoading && (
            <Box className="flex-1 items-center justify-center" style={{ paddingVertical: 60 }}>
              <Text weight="medium" muted className="text-center">No workouts found</Text>
            </Box>
          )
        )}
      </ScrollView>
      {isLoading && (
        <Box
          className="items-center justify-center"
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.3)' }}
        >
          <ActivityIndicator size="large" color="#FFFFFF" />
        </Box>
      )}
    </SafeAreaView>
  );
}

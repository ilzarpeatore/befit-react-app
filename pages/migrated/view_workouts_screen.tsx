import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  SafeAreaView,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useResponsiveStyleSheet } from '@helper/responsiveStyleSheet';
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
      style={styles.workoutItem}
      activeOpacity={0.7}
      onPress={() => {
        props.navigation?.navigate('MigratedWorkoutDetail', { id: item.id });
      }}
    >
      {item.image ? (
        <Image source={{ uri: item.image }} style={styles.workoutImage} resizeMode="cover" />
      ) : null}
      <View style={styles.workoutContent}>
        <Text style={styles.workoutTitle} numberOfLines={1}>{item.title}</Text>
        {item.workoutTypeTitle ? (
          <Text style={styles.workoutSubtitle} numberOfLines={1}>{item.workoutTypeTitle}</Text>
        ) : null}
        <View style={styles.workoutMeta}>
          {item.levelTitle ? (
            <Text style={styles.levelText}>{item.levelTitle}</Text>
          ) : null}
          {item.isPremium === 1 && (
            <View style={styles.proBadge}>
              <Text style={styles.proText}>PRO</Text>
            </View>
          )}
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color={C.gray30} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {showAppbar !== false && (
        <View style={styles.header}>
          <TouchableOpacity onPress={() => props.navigation?.goBack()}>
            <Ionicons name="chevron-back" size={24} color={C.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Workouts</Text>
          <View style={{ width: 24 }} />
        </View>
      )}

      {canFilter && (
        <>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={18} color={C.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search workouts..."
              placeholderTextColor={C.textSecondary}
              value={searchText}
              onChangeText={handleSearchChange}
            />
            {searchText.length > 0 && (
              <TouchableOpacity onPress={() => handleSearchChange('')}>
                <Ionicons name="close-circle" size={18} color={C.textSecondary} />
              </TouchableOpacity>
            )}
          </View>

          {types.length > 0 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
              {types.map((t) => (
                <TouchableOpacity
                  key={t.id}
                  style={[styles.chip, selectedType === t.id && styles.chipActive]}
                  onPress={() => toggleType(t.id)}
                >
                  <Text style={[styles.chipText, selectedType === t.id && styles.chipTextActive]}>{t.title}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          {levels.length > 0 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
              {levels.map((l) => (
                <TouchableOpacity
                  key={l.id}
                  style={[styles.chip, selectedLevel === l.id && styles.chipActive]}
                  onPress={() => toggleLevel(l.id)}
                >
                  <Text style={[styles.chipText, selectedLevel === l.id && styles.chipTextActive]}>{l.title}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          {bodyParts.length > 0 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
              {bodyParts.map((bp) => (
                <TouchableOpacity
                  key={bp.id}
                  style={[styles.chip, selectedBodyPart === bp.id && styles.chipActive]}
                  onPress={() => toggleBodyPart(bp.id)}
                >
                  <Text style={[styles.chipText, selectedBodyPart === bp.id && styles.chipTextActive]}>{bp.title}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </>
      )}

      <View style={styles.body}>
        {workoutList.length > 0 ? (
          <ScrollView
            ref={scrollRef}
            contentContainerStyle={[
              styles.scrollContent,
              (isFav || isAssign) && { paddingVertical: 16 },
            ]}
            onScroll={handleScroll}
            scrollEventThrottle={16}
          >
            {workoutList.map((item, index) => renderWorkoutItem({ item, index }))}
          </ScrollView>
        ) : (
          !isLoading && (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No Workouts Found</Text>
            </View>
          )
        )}

        {isLoading && (
          <View style={styles.loaderOverlay}>
            <ActivityIndicator size="large" color="#FFFFFF" />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: C.surface,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  headerTitle: {
    fontFamily: FONT.semiBold,
    fontSize: 18,
    color: C.white,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.surfaceLight,
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontFamily: FONT.regular,
    fontSize: 14,
    color: C.white,
    padding: 0,
  },
  chipRow: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  chip: {
    backgroundColor: C.surfaceLight,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  chipActive: {
    backgroundColor: '#1C1C1E',
  },
  chipText: {
    fontFamily: FONT.medium,
    fontSize: 13,
    color: C.textSecondary,
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
  body: { flex: 1 },
  scrollContent: { paddingVertical: 4, paddingHorizontal: 16 },
  workoutItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.surfaceLight,
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    padding: 10,
  },
  workoutImage: {
    width: 60,
    height: 60,
    borderRadius: 10,
  },
  workoutContent: {
    flex: 1,
    marginLeft: 12,
  },
  workoutTitle: {
    fontFamily: FONT.semiBold,
    fontSize: 15,
    color: C.white,
  },
  workoutSubtitle: {
    fontFamily: FONT.regular,
    fontSize: 13,
    color: C.textSecondary,
    marginTop: 2,
  },
  workoutMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 8,
  },
  levelText: {
    fontFamily: FONT.regular,
    fontSize: 12,
    color: C.gray30,
  },
  proBadge: {
    backgroundColor: C.orange,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  proText: {
    fontFamily: FONT.bold,
    fontSize: 10,
    color: '#FFFFFF',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: FONT.regular,
    fontSize: 16,
    color: C.textSecondary,
  },
  loaderOverlay: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
});

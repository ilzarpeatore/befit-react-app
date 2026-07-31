import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  ActivityIndicator,
  Dimensions,
  Image,
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

  const styles = useResponsiveStyleSheet({
    container: { flex: 1, backgroundColor: C.bg },
    header: { fontSize: '20@ratio', fontFamily: FONT.bold, color: C.white, padding: '16@ratio' },
    searchContainer: {
      flexDirection: 'row', alignItems: 'center', backgroundColor: C.surfaceLight,
      borderRadius: '12@ratio', marginHorizontal: '16@ratio', marginBottom: '8@ratio',
      paddingHorizontal: '12@ratio', paddingVertical: '8@ratio', gap: 8,
    },
    searchInput: { flex: 1, fontFamily: FONT.regular, fontSize: '14@ratio', color: C.white, padding: 0 },
    filterRow: { flexDirection: 'row', paddingHorizontal: '16@ratio', paddingVertical: '6@ratio' },
    filterChip: {
      paddingHorizontal: '16@ratio', paddingVertical: '8@ratio', borderRadius: '20@ratio',
      marginRight: '8@ratio', borderWidth: 1,
    },
    filterChipActive: { backgroundColor: '#1C1C1E', borderColor: '#1C1C1E' },
    filterChipInactive: { backgroundColor: C.surface, borderColor: C.border },
    filterChipTextActive: { color: '#FFFFFF', fontFamily: FONT.semiBold, fontSize: '13@ratio' },
    filterChipTextInactive: { color: C.textSecondary, fontFamily: FONT.medium, fontSize: '13@ratio' },
    workoutCard: {
      flexDirection: 'row', alignItems: 'center', backgroundColor: C.surfaceLight,
      borderRadius: '14@ratio', marginBottom: '10@ratio', padding: '10@ratio',
    },
    workoutImage: { width: '72@ratio', height: '72@ratio', borderRadius: '10@ratio', backgroundColor: C.gray70 },
    workoutInfo: { flex: 1, marginLeft: '12@ratio' },
    workoutTitle: { fontSize: '15@ratio', fontFamily: FONT.bold, color: C.white },
    workoutSubtitle: { fontSize: '13@ratio', fontFamily: FONT.regular, color: C.textSecondary, marginTop: '4@ratio' },
    favBtn: { padding: '4@ratio' },
    emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: '60@ratio' },
    emptyText: { fontSize: '16@ratio', fontFamily: FONT.medium, color: C.textSecondary, textAlign: 'center' },
    loader: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.3)' },
  });

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

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Workouts</Text>
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
      <ScrollView ref={scrollRef} contentContainerStyle={{ paddingBottom: '20@ratio' }}>
        {types.length > 0 && (
          <View style={styles.filterRow}>
            {types.map((t) => (
              <TouchableOpacity
                key={t.id}
                style={[styles.filterChip, selectedType === t.id ? styles.filterChipActive : styles.filterChipInactive]}
                onPress={() => setSelectedType((prev) => (prev === t.id ? null : t.id))}
              >
                <Text style={selectedType === t.id ? styles.filterChipTextActive : styles.filterChipTextInactive}>
                  {t.title}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
        {levels.length > 0 && (
          <View style={styles.filterRow}>
            {levels.map((l) => (
              <TouchableOpacity
                key={l.id}
                style={[styles.filterChip, selectedLevel === l.id ? styles.filterChipActive : styles.filterChipInactive]}
                onPress={() => setSelectedLevel((prev) => (prev === l.id ? null : l.id))}
              >
                <Text style={selectedLevel === l.id ? styles.filterChipTextActive : styles.filterChipTextInactive}>
                  {l.title}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
        {bodyParts.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
            {bodyParts.map((bp) => (
              <TouchableOpacity
                key={bp.id}
                style={[styles.filterChip, selectedBodyPart === bp.id ? styles.filterChipActive : styles.filterChipInactive]}
                onPress={() => setSelectedBodyPart((prev) => (prev === bp.id ? null : bp.id))}
              >
                <Text style={selectedBodyPart === bp.id ? styles.filterChipTextActive : styles.filterChipTextInactive}>
                  {bp.title}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
        <View style={{ height: '8@ratio' }} />
        {mWorkoutList.length > 0 ? (
          <View style={{ paddingHorizontal: '16@ratio' }}>
            {mWorkoutList.map((item, index) => (
              <TouchableOpacity key={`${item.id}-${index}`} style={styles.workoutCard} onPress={() => handleWorkoutTap(item)}>
                {item.workoutImage ? (
                  <Image source={{ uri: item.workoutImage }} style={styles.workoutImage} resizeMode="cover" />
                ) : (
                  <View style={styles.workoutImage} />
                )}
                <View style={styles.workoutInfo}>
                  <Text style={styles.workoutTitle} numberOfLines={1}>{item.title || ''}</Text>
                  <Text style={styles.workoutSubtitle}>{item.levelTitle || ''}</Text>
                </View>
                <TouchableOpacity style={styles.favBtn} onPress={() => handleFavTap(item, index)}>
                  <Ionicons
                    name={item.isFavourite === 1 ? 'heart' : 'heart-outline'}
                    size={22}
                    color={item.isFavourite === 1 ? C.destructive : C.gray30}
                  />
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          !isLoading && (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No workouts found</Text>
            </View>
          )
        )}
      </ScrollView>
      {isLoading && (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#FFFFFF" />
        </View>
      )}
    </SafeAreaView>
  );
}

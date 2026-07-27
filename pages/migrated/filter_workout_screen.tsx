import React, { useState, useEffect, useRef } from 'react';
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useResponsiveStyleSheet } from '@helper/responsiveStyleSheet';
import { C, FONT } from './theme';
import { workoutsApi } from '../../api/workouts';

interface WorkoutFilterList {
  id: number;
  title: string;
  select: boolean;
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

  const [list, setList] = useState<WorkoutFilterList[]>([
    { id: 0, title: 'All', select: true },
    { id: 1, title: 'Workout Types', select: false },
    { id: 2, title: 'Workout Level', select: false },
  ]);
  const [mWorkoutList, setMWorkoutList] = useState<WorkoutDetail[]>([]);
  const [mLevelList, setMLevelList] = useState<any[]>([]);
  const [mWorkoutTypeList, setMWorkoutTypeList] = useState<any[]>([]);
  const [mSelectedList, setMSelectedList] = useState<number[]>([]);
  const [page, setPage] = useState(1);
  const [numPage, setNumPage] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLastPage, setIsLastPage] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const styles = useResponsiveStyleSheet({
    container: { flex: 1, backgroundColor: C.bg },
    header: { fontSize: '20@ratio', fontFamily: FONT.bold, color: C.white, padding: '16@ratio' },
    filterRow: { flexDirection: 'row', paddingHorizontal: '16@ratio', paddingVertical: '8@ratio' },
    filterChip: {
      paddingHorizontal: '16@ratio', paddingVertical: '8@ratio', borderRadius: '20@ratio',
      marginRight: '8@ratio', borderWidth: 1,
    },
    filterChipActive: { backgroundColor: C.brand5, borderColor: C.brand5 },
    filterChipInactive: { backgroundColor: C.surface, borderColor: C.border },
    filterChipTextActive: { color: C.white, fontFamily: FONT.semiBold, fontSize: '13@ratio' },
    filterChipTextInactive: { color: C.textSecondary, fontFamily: FONT.medium, fontSize: '13@ratio' },
    workoutCard: {
      backgroundColor: C.surfaceLight, borderRadius: '16@ratio', marginBottom: '12@ratio',
      overflow: 'hidden',
    },
    workoutImage: { width: '100%', height: '185@ratio', backgroundColor: C.gray70 },
    workoutInfo: { padding: '12@ratio' },
    workoutTitle: { fontSize: '16@ratio', fontFamily: FONT.bold, color: C.white },
    workoutSubtitle: { fontSize: '13@ratio', fontFamily: FONT.regular, color: C.textSecondary, marginTop: '4@ratio' },
    favBtn: { position: 'absolute', top: '12@ratio', right: '12@ratio' },
    emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: '60@ratio' },
    emptyText: { fontSize: '16@ratio', fontFamily: FONT.medium, color: C.textSecondary, textAlign: 'center' },
    loader: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.3)' },
  });

  const getList = () => {};

  const getWorkoutData = async (opts?: { isFilter?: boolean; ids?: string; isTypes?: boolean; isLevel?: boolean }) => {
    setIsLoading(true);
    try {
      const params: any = { page };
      if (opts?.isFilter && opts.ids) {
        if (opts.isTypes) params.workout_type_ids = opts.ids;
        if (opts.isLevel) params.level_ids = opts.ids;
      }
      await workoutsApi.getFilteredList(params).then((res) => {
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
        if (page === 1) {
          setMWorkoutList(data);
        } else {
          setMWorkoutList((prev) => [...prev, ...data]);
        }
      });
    } catch {
      setIsLastPage(true);
    } finally {
      setIsLoading(false);
    }
  };

  const getWorkoutTypeData = async () => {
    try {
      await workoutsApi.getTypes().then((res) => {
        const value: any = res.data;
        const items = (value.data ?? []).map((t: any) => ({
          id: t.id,
          title: t.title,
          select: false,
        }));
        setMWorkoutTypeList(items);
      });
    } catch {}
  };

  const getLevelData = async () => {
    try {
      await workoutsApi.getLevels().then((res) => {
        const value: any = res.data;
        const items = (value.data ?? []).map((l: any) => ({
          id: l.id,
          title: l.title,
          select: false,
        }));
        setMLevelList(items);
      });
    } catch {}
  };

  const setWorkoutFav = async (id?: number, isFav?: number) => {
    setIsLoading(true);
    try {
      if (id) await workoutsApi.setFavourite(id);
    } catch {
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getList();
    getWorkoutData();
    getWorkoutTypeData();
  }, []);

  const handleFilterSelect = (index: number) => {
    setList((prev) =>
      prev.map((item, i) => ({ ...item, select: i === index }))
    );
    if (list[index].id === 0) {
      setPage(1);
      setMWorkoutTypeList((prev) => prev.map((t) => ({ ...t, select: false })));
      setMLevelList((prev) => prev.map((l) => ({ ...l, select: false })));
      getWorkoutData({ isFilter: true });
    }
  };

  const handleFilterCall = (mList: number[]) => {
    setPage(1);
    const activeIdx = list.findIndex((el) => el.select);
    getWorkoutData({
      isFilter: true,
      ids: mList.toString().replace(/[\[\]\s]/g, '').trim(),
      isTypes: list[activeIdx]?.id === 1,
      isLevel: list[activeIdx]?.id === 2,
    });
    setMSelectedList(mList);
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
    setWorkoutFav(item.id, item.isFavourite);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Workouts</Text>
      <ScrollView ref={scrollRef} contentContainerStyle={{ paddingBottom: '20@ratio' }}>
        <View style={styles.filterRow}>
          {list.map((item, index) => (
            <TouchableOpacity
              key={item.id.toString()}
              style={[styles.filterChip, item.select ? styles.filterChipActive : styles.filterChipInactive]}
              onPress={() => handleFilterSelect(index)}
            >
              <Text style={item.select ? styles.filterChipTextActive : styles.filterChipTextInactive}>
                {item.title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={{ height: '16@ratio' }} />
        {mWorkoutList.length > 0 ? (
          <View style={{ paddingHorizontal: '16@ratio' }}>
            {mWorkoutList.map((item, index) => (
              <TouchableOpacity key={`${item.id}-${index}`} style={styles.workoutCard} onPress={() => handleWorkoutTap(item)}>
                {item.workoutImage ? (
                  <Image source={{ uri: item.workoutImage }} style={styles.workoutImage} resizeMode="cover" />
                ) : (
                  <View style={styles.workoutImage} />
                )}
                <TouchableOpacity style={styles.favBtn} onPress={() => handleFavTap(item, index)}>
                  <Ionicons
                    name={item.isFavourite === 1 ? 'heart' : 'heart-outline'}
                    size={24}
                    color={item.isFavourite === 1 ? C.destructive : C.gray30}
                  />
                </TouchableOpacity>
                <View style={styles.workoutInfo}>
                  <Text style={styles.workoutTitle}>{item.title || ''}</Text>
                  <Text style={styles.workoutSubtitle}>{item.levelTitle || ''}</Text>
                </View>
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
          <ActivityIndicator size="large" color={C.brand5} />
        </View>
      )}
    </SafeAreaView>
  );
}

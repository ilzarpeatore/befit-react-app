import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput, FlatList, SafeAreaView, Dimensions, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useResponsiveStyleSheet } from '@helper/responsiveStyleSheet';
import { C, FONT } from './theme';
import { exercisesApi } from '../../api/exercises';
import { workoutsApi } from '../../api/workouts';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ExerciseModel {
  id?: number;
  title?: string;
  exerciseImage?: string;
  type?: string;
  levelTitle?: string;
  isFavourite?: number;
  isFavouriteLocally?: number;
  [key: string]: any;
}

interface WorkoutDetailModel {
  id?: number;
  title?: string;
  workoutImage?: string;
  isPremium?: number;
  isFavourite?: number;
  isFavouriteLocally?: number;
  [key: string]: any;
}

interface ExerciseListScreenProps {
  navigation: any;
  route: {
    params: {
      mTitle?: string;
      isBodyPart?: boolean;
      isLevel?: boolean;
      isEquipment?: boolean;
      id?: number;
    };
  };
}

export default function ExerciseListScreen(props: ExerciseListScreenProps) {
  const { mTitle, isBodyPart = false, isLevel = false, isEquipment = false, id } = props.route.params;

  const [mExerciseList, setMExerciseList] = useState<ExerciseModel[]>([]);
  const [mWorkoutList, setMWorkoutList] = useState<WorkoutDetailModel[]>([]);
  const [isSearch, setIsSearch] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [exercisePage, setExercisePage] = useState(1);
  const [exerciseNumPage, setExerciseNumPage] = useState<number | null>(null);
  const [isExerciseLastPage, setIsExerciseLastPage] = useState(false);

  const [workoutPage, setWorkoutPage] = useState(1);
  const [workoutNumPage, setWorkoutNumPage] = useState<number | null>(null);
  const [isWorkoutLastPage, setIsWorkoutLastPage] = useState(false);

  const [activeTab, setActiveTab] = useState(0);

  const exerciseScrollRef = useRef<FlatList | null>(null);
  const workoutScrollRef = useRef<FlatList | null>(null);

  const showTabs = !isBodyPart && !isEquipment;

  const getExerciseData = useCallback(async () => {
    setIsLoading(true);
    try {
      let res;
      if (searchText) {
        res = await exercisesApi.search(searchText);
      } else if (isBodyPart && id) {
        res = await exercisesApi.getByBodyPart(id, exercisePage);
      } else if (isEquipment && id) {
        res = await exercisesApi.getByEquipment(id, exercisePage);
      } else if (isLevel && id) {
        res = await exercisesApi.getByLevel(id, exercisePage);
      } else {
        res = await exercisesApi.getList(exercisePage);
      }
      const list = (res.data.data ?? []).map((e: any) => ({
        id: e.id,
        title: e.title,
        exerciseImage: e.exercise_image,
        type: e.type,
        levelTitle: e.level_title,
        isFavourite: 0,
      }));
      if (exercisePage === 1) setMExerciseList(list);
      else setMExerciseList((prev) => [...prev, ...list]);
      setExerciseNumPage(res.data.pagination?.totalPages ?? null);
    } catch (e) {
      setIsExerciseLastPage(true);
    } finally {
      setIsLoading(false);
    }
  }, [exercisePage, searchText, id, isBodyPart, isEquipment, isLevel]);

  const getLevelWorkoutData = useCallback(async () => {
    if (!showTabs) return;
    setIsLoading(true);
    try {
      let res;
      if (searchText) {
        res = await workoutsApi.getFilteredList({ page: workoutPage });
      } else if (isLevel && id) {
        res = await workoutsApi.getFilteredList({ level_ids: id, page: workoutPage });
      } else {
        res = await workoutsApi.getList(workoutPage);
      }
      const list = (res.data.data ?? []).map((w: any) => ({
        id: w.id,
        title: w.title,
        workoutImage: w.workout_image,
        isPremium: w.is_premium,
        isFavourite: w.is_favourite,
      }));
      if (workoutPage === 1) setMWorkoutList(list);
      else setMWorkoutList((prev) => [...prev, ...list]);
      setWorkoutNumPage(res.data.pagination?.total_pages ?? null);
    } catch (e) {
      setIsWorkoutLastPage(true);
    } finally {
      setIsLoading(false);
    }
  }, [workoutPage, searchText, id, showTabs]);

  useEffect(() => {
    getExerciseData();
    if (showTabs) getLevelWorkoutData();
  }, []);

  const handleSearchChange = (v: string) => {
    setSearchText(v);
    if (activeTab === 0) {
      setExercisePage(1);
      setMExerciseList([]);
      getExerciseData();
    } else {
      setWorkoutPage(1);
      setMWorkoutList([]);
      getLevelWorkoutData();
    }
  };

  const toggleSearch = () => {
    if (isSearch) {
      setSearchText('');
      setIsSearch(false);
      setExercisePage(1);
      setMExerciseList([]);
      getExerciseData();
    } else {
      setIsSearch(true);
    }
  };

  const handleWorkoutTap = async (workout: WorkoutDetailModel) => {
    const isSubscriptionEnabled = false; // userStore.subscription === '1'
    const isPremiumWorkout = workout.isPremium === 1;
    const isUserSubscribed = false; // userStore.isSubscribe === 1

    if (isSubscriptionEnabled && isPremiumWorkout && !isUserSubscribed) {
      props.navigation.navigate('MigratedSubscribe');
      return;
    }
    props.navigation.navigate('MigratedWorkoutDetail', {
      id: workout.id,
      mWorkoutModel: workout,
    });
  };

  const toggleWorkoutFavourite = (index: number) => {
    const updated = [...mWorkoutList];
    const item = { ...updated[index] };
    if (item.isFavourite === 0 && (!item.isFavouriteLocally || item.isFavouriteLocally === 0)) {
      item.isFavouriteLocally = 1;
      item.isFavourite = 1;
    } else {
      item.isFavouriteLocally = 0;
      item.isFavourite = 0;
    }
    updated[index] = item;
    setMWorkoutList(updated);
  };

  const renderExerciseItem = ({ item }: { item: ExerciseModel }) => (
    <TouchableOpacity
      style={localStyles.card}
      onPress={() =>
        props.navigation.navigate('MigratedExerciseDetail', {
          mExerciseId: item.id,
          mExerciseName: item.title,
        })
      }
      activeOpacity={0.7}
    >
      <Image source={{ uri: item.exerciseImage || '' }} style={localStyles.cardImage} />
      <View style={localStyles.cardInfo}>
        <Text style={localStyles.cardTitle} numberOfLines={1}>{item.title || ''}</Text>
        {item.levelTitle ? (
          <Text style={localStyles.cardSubtitle}>{item.levelTitle}</Text>
        ) : null}
      </View>
      <Ionicons name="chevron-forward" size={18} color={C.gray40} />
    </TouchableOpacity>
  );

  const renderWorkoutItem = ({ item, index }: { item: WorkoutDetailModel; index: number }) => (
    <TouchableOpacity
      style={localStyles.card}
      onPress={() => handleWorkoutTap(item)}
      activeOpacity={0.7}
    >
      <Image source={{ uri: item.workoutImage || '' }} style={localStyles.cardImage} />
      <View style={localStyles.cardInfo}>
        <Text style={localStyles.cardTitle} numberOfLines={1}>{item.title || ''}</Text>
      </View>
      <TouchableOpacity
        onPress={() => toggleWorkoutFavourite(index)}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons
          name={(item.isFavourite === 1 || item.isFavouriteLocally === 1) ? 'heart' : 'heart-outline'}
          size={20}
          color={(item.isFavourite === 1 || item.isFavouriteLocally === 1) ? C.red : C.gray40}
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={localStyles.container}>
      {/* App Bar */}
      <View style={localStyles.appBar}>
        {isSearch ? (
          <TextInput
            style={localStyles.searchInput}
            placeholder="Search..."
            placeholderTextColor={C.gray30}
            value={searchText}
            onChangeText={handleSearchChange}
            autoFocus
          />
        ) : (
          <Text style={localStyles.appBarTitle}>
            {(mTitle || '').replace(/^\w/, (c) => c.toUpperCase())}
          </Text>
        )}
        <TouchableOpacity onPress={toggleSearch} style={localStyles.searchBtn}>
          <Ionicons name={isSearch ? 'close' : 'search'} size={22} color={C.brand5} />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      {showTabs && (
        <View style={localStyles.tabsRow}>
          <TouchableOpacity
            style={[localStyles.tab, activeTab === 0 && localStyles.activeTab]}
            onPress={() => setActiveTab(0)}
          >
            <Text style={[localStyles.tabText, activeTab === 0 && localStyles.activeTabText]}>
              Exercises
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[localStyles.tab, activeTab === 1 && localStyles.activeTab]}
            onPress={() => setActiveTab(1)}
          >
            <Text style={[localStyles.tabText, activeTab === 1 && localStyles.activeTabText]}>
              Workouts
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Content */}
      <View style={localStyles.body}>
        {activeTab === 0 ? (
          <View style={{ flex: 1 }}>
            <FlatList
              ref={exerciseScrollRef}
              data={mExerciseList}
              renderItem={renderExerciseItem}
              keyExtractor={(item, i) => `${item.id}-${i}`}
              contentContainerStyle={{ paddingHorizontal: 12 }}
              onEndReached={() => {
                if (!isExerciseLastPage && exercisePage < (exerciseNumPage ?? 1)) {
                  setExercisePage((prev) => prev + 1);
                  getExerciseData();
                }
              }}
              onEndReachedThreshold={0.5}
              ListEmptyComponent={
                !isLoading ? (
                  <View style={localStyles.emptyContainer}>
                    <Text style={localStyles.emptyText}>No exercises found</Text>
                  </View>
                ) : null
              }
            />
          </View>
        ) : (
          <View style={{ flex: 1 }}>
            <FlatList
              ref={workoutScrollRef}
              data={mWorkoutList}
              renderItem={renderWorkoutItem}
              keyExtractor={(item, i) => `${item.id}-${i}`}
              contentContainerStyle={{ paddingHorizontal: 12 }}
              onEndReached={() => {
                if (!isWorkoutLastPage && workoutPage < (workoutNumPage ?? 1)) {
                  setWorkoutPage((prev) => prev + 1);
                  getLevelWorkoutData();
                }
              }}
              onEndReachedThreshold={0.5}
              ListEmptyComponent={
                !isLoading ? (
                  <View style={localStyles.emptyContainer}>
                    <Text style={localStyles.emptyText}>No workouts found</Text>
                  </View>
                ) : null
              }
            />
          </View>
        )}

        {isLoading && (
          <View style={localStyles.loaderContainer}>
            <ActivityIndicator size="large" color={C.brand5} />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const localStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  appBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 12,
    backgroundColor: C.bg,
  },
  appBarTitle: {
    flex: 1,
    fontFamily: FONT.bold,
    fontSize: 18,
    color: C.white,
    textAlign: 'center',
  },
  searchInput: {
    flex: 1,
    fontFamily: FONT.regular,
    fontSize: 16,
    color: C.white,
    borderBottomWidth: 1,
    borderBottomColor: C.brand5,
    paddingBottom: 8,
  },
  searchBtn: { padding: 8 },
  tabsRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: C.brand5,
  },
  tabText: {
    fontFamily: FONT.medium,
    fontSize: 14,
    color: C.gray30,
  },
  activeTabText: {
    color: C.brand5,
  },
  body: { flex: 1 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.surfaceLight,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  cardImage: {
    width: 60,
    height: 60,
    borderRadius: 10,
    backgroundColor: C.gray70,
  },
  cardInfo: {
    flex: 1,
    marginLeft: 12,
  },
  cardTitle: {
    fontFamily: FONT.semiBold,
    fontSize: 14,
    color: C.white,
  },
  cardSubtitle: {
    fontFamily: FONT.regular,
    fontSize: 12,
    color: C.gray30,
    marginTop: 2,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontFamily: FONT.regular,
    fontSize: 14,
    color: C.gray30,
  },
  loaderContainer: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

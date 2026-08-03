import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
  ActivityIndicator,
  Dimensions,
  Platform,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useResponsiveStyleSheet } from '@helper/responsiveStyleSheet';
import { C, FONT } from './theme';
import { workoutsApi } from '../../api/workouts';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface DayExerciseModel {
  id: number;
  workout_day_id: number;
  exercise?: {
    type?: string;
    based?: string;
    sets?: { time?: number; reps?: number }[];
    [key: string]: any;
  };
  [key: string]: any;
}

interface Workoutday {
  id: number;
  is_rest?: number;
  [key: string]: any;
}

interface WorkoutDetailData {
  id: number;
  title: string;
  workout_image?: string;
  workout_type_title?: string;
  level_title?: string;
  is_favourite?: number;
  is_premium?: number;
  description?: string;
  [key: string]: any;
}

export default function WorkoutDetailScreen(props: any) {
  const workoutId = props.route?.params?.id;
  const onCall = props.route?.params?.onCall;

  const [workoutDetail, setWorkoutDetail] = useState<WorkoutDetailData | null>(null);
  const [dayExerciseList, setDayExerciseList] = useState<DayExerciseModel[]>([]);
  const [workoutDayList, setWorkoutDayList] = useState<Workoutday[]>([]);
  const [currentTabIndex, setCurrentTabIndex] = useState(0);
  const [page, setPage] = useState(1);
  const [numPage, setNumPage] = useState<number | null>(null);
  const [isLastPage, setIsLastPage] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDetailLoading, setIsDetailLoading] = useState(true);

  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    init();
  }, []);

  useEffect(() => {
    if (numPage && page > 1) {
      getDayExerciseData(workoutDayList[currentTabIndex]?.id);
    }
  }, [page]);

  const init = async () => {
    setIsDetailLoading(true);
    try {
      await workoutsApi.getDetail(workoutId).then((res) => {
        const value: any = res.data;
        setWorkoutDetail(value.data);
        const days = value.data?.workout_day || [];
        setWorkoutDayList(days);
        if (days.length > 0) {
          getDayExerciseData(days[0].id);
        }
      });
    } catch (e) {
    } finally {
      setIsDetailLoading(false);
    }
  };

  const getDayExerciseData = async (dayId?: number) => {
    setIsLoading(true);
    try {
      await workoutsApi.getDayExercises(dayId!).then((res) => {
        const value: any = res.data;
        setNumPage(value.pagination?.total_pages ?? null);
        setIsLastPage(false);
        if (page === 1) setDayExerciseList([]);
        setDayExerciseList((prev) => [...prev, ...value.data]);
      });
    } catch (e) {
      setIsLastPage(true);
    } finally {
      setIsLoading(false);
    }
  };

  const setWorkoutFav = async (id?: number) => {
    setIsDetailLoading(true);
    try {
      await workoutsApi.setFavourite(id!);
      if (workoutDetail) {
        const updated = { ...workoutDetail };
        updated.is_favourite = updated.is_favourite === 1 ? 0 : 1;
        setWorkoutDetail(updated);
        onCall?.(updated.is_favourite);
      }
    } catch (e) {
    } finally {
      setIsDetailLoading(false);
    }
  };

  const onTabTap = (index: number) => {
    setCurrentTabIndex(index);
    setIsLoading(true);
    getDayExerciseData(workoutDayList[index]?.id);
  };

  const renderDataItem = (img: string, title: string, value: string) => (
    <View style={styles.dataItem}>
      <Text style={styles.dataTitle}>{title}</Text>
      <Text style={styles.dataValue}>{value}</Text>
    </View>
  );

  const renderSets = (exercise: DayExerciseModel) => {
    const sets: string[] = [];
    if (exercise.exercise?.type === 'sets' && exercise.exercise?.sets?.length) {
      exercise.exercise.sets.forEach((set) => {
        if (exercise.exercise?.based === 'time') {
          sets.push(`${set.time}s`);
        } else {
          sets.push(`${set.reps}x`);
        }
      });
    }
    return sets;
  };

  const renderExerciseItem = (item: DayExerciseModel, index: number) => {
    const sets = renderSets(item);
    return (
      <TouchableOpacity
        key={item.id?.toString() || index.toString()}
        style={styles.exerciseItem}
        activeOpacity={0.7}
        onPress={() => {
          props.navigation?.navigate('MigratedExerciseDetail', {
            mExerciseId: item.exercise?.id,
            mExerciseName: item.exercise?.title,
            workOutId: workoutId?.toString(),
            workoutDayId: item.workout_day_id,
            isCompleted: true,
            isFrom: 'workoutDetail',
          });
        }}
      >
        {item.exercise?.exercise_image ? (
          <Image source={{ uri: item.exercise.exercise_image }} style={styles.exerciseImage} resizeMode="cover" />
        ) : null}
        <View style={styles.exerciseContent}>
          <Text style={styles.exerciseTitle} numberOfLines={1}>
            {item.exercise?.title || 'Exercise'}
          </Text>
          {sets.length > 0 && (
            <Text style={styles.exerciseSets}>{sets.join(' / ')}</Text>
          )}
        </View>
        <Ionicons name="chevron-forward" size={20} color={C.gray30} />
      </TouchableOpacity>
    );
  };

  if (!workoutDetail && !isDetailLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No data available</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      <View style={styles.heroSection}>
        {workoutDetail?.workout_image ? (
          <Image
            source={{ uri: workoutDetail.workout_image }}
            style={styles.heroImage}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.heroImage, { backgroundColor: C.surface }]} />
        )}
        <LinearGradient
          colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.8)']}
          style={styles.heroOverlay}
        />

        {/* Back Button */}
        <TouchableOpacity style={styles.backBtn} onPress={() => props.navigation?.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>

        {/* Premium Badge */}
        {workoutDetail?.is_premium === 1 && (
          <View style={styles.proBadge}>
            <Text style={styles.proText}>PRO</Text>
          </View>
        )}

        {/* Favorite Button */}
        <TouchableOpacity
          style={styles.favBtn}
          onPress={() => setWorkoutFav(workoutDetail?.id)}
        >
          <Ionicons
            name={workoutDetail?.is_favourite === 1 ? 'heart' : 'heart-outline'}
            size={22}
            color={workoutDetail?.is_favourite === 1 ? C.pink : '#FFFFFF'}
          />
        </TouchableOpacity>

        {/* Title */}
        <Text style={styles.heroTitle}>
          {workoutDetail?.title?.charAt(0).toUpperCase() + (workoutDetail?.title?.slice(1) || '')}
        </Text>
      </View>

      {/* Content Sheet */}
      <ScrollView
        ref={scrollRef}
        style={styles.contentSheet}
        contentContainerStyle={styles.contentSheetInner}
      >
        {/* Data Row */}
        <View style={styles.dataRow}>
          {renderDataItem('', 'Workout Type', workoutDetail?.workout_type_title || '-')}
          {renderDataItem('', 'Level', workoutDetail?.level_title || '-')}
        </View>

        <View style={styles.divider} />

        {/* Description */}
        {workoutDetail?.description && !isDetailLoading && (
          <View style={styles.descriptionSection}>
            <Text style={styles.descriptionText}>{workoutDetail.description}</Text>
          </View>
        )}

        {/* Day Tabs */}
        {workoutDayList.length > 0 && (
          <>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.tabBar}
              contentContainerStyle={styles.tabBarContent}
            >
              {workoutDayList.map((day, index) => (
                <TouchableOpacity
                  key={day.id?.toString() || index.toString()}
                  style={[styles.tab, currentTabIndex === index && styles.tabActive]}
                  onPress={() => onTabTap(index)}
                >
                  <Text
                    style={[styles.tabText, currentTabIndex === index && styles.tabTextActive]}
                  >
                    Day {index + 1}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <View style={styles.divider} />
          </>
        )}

        {/* Exercise List */}
        {dayExerciseList.length > 0 ? (
          dayExerciseList.map((item, index) => renderExerciseItem(item, index))
        ) : (
          !isLoading &&
          workoutDayList.length > 0 && (
            <View style={styles.emptyExerciseContainer}>
              <Text style={styles.emptyExerciseText}>
                {workoutDayList[currentTabIndex]?.is_rest === 1
                  ? 'Rest Day'
                  : 'No exercises found'}
              </Text>
            </View>
          )
        )}

        {isLoading && (
          <View style={styles.exerciseLoader}>
            <ActivityIndicator size="large" color={C.textPrimary} />
          </View>
        )}

        <View style={{ height: 30 }} />
      </ScrollView>

      {isDetailLoading && (
        <View style={styles.loaderOverlay}>
          <ActivityIndicator size="large" color="#FFFFFF" />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
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
  heroSection: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.39,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
  },
  backBtn: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 40,
    left: 12,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  proBadge: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 40,
    left: 60,
    backgroundColor: C.orange,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  proText: {
    fontFamily: FONT.bold,
    fontSize: 10,
    color: '#FFFFFF',
  },
  favBtn: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 40,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroTitle: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    fontFamily: FONT.bold,
    fontSize: 20,
    color: '#FFFFFF',
  },
  contentSheet: {
    flex: 1,
    backgroundColor: C.bg,
  },
  contentSheetInner: {
    paddingTop: 16,
    paddingBottom: 16,
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 32,
    paddingVertical: 10,
  },
  dataItem: {
    alignItems: 'center',
  },
  dataTitle: {
    fontFamily: FONT.bold,
    fontSize: 14,
    color: C.white,
  },
  dataValue: {
    fontFamily: FONT.regular,
    fontSize: 12,
    color: C.textSecondary,
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: C.border,
    marginHorizontal: 16,
    marginVertical: 10,
  },
  descriptionSection: {
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  descriptionText: {
    fontFamily: FONT.regular,
    fontSize: 14,
    color: C.textSecondary,
    lineHeight: 22,
  },
  tabBar: {
    marginBottom: 4,
  },
  tabBarContent: {
    paddingHorizontal: 16,
    gap: 16,
  },
  tab: {
    paddingBottom: 8,
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: C.textPrimary,
  },
  tabText: {
    fontFamily: FONT.regular,
    fontSize: 15,
    color: C.textSecondary,
    paddingBottom: 8,
  },
  tabTextActive: {
    fontFamily: FONT.bold,
    color: C.textPrimary,
  },
  exerciseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.surfaceLight,
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 12,
  },
  exerciseImage: {
    width: 55,
    height: 55,
    borderRadius: 10,
  },
  exerciseContent: {
    flex: 1,
    marginLeft: 12,
  },
  exerciseTitle: {
    fontFamily: FONT.semiBold,
    fontSize: 15,
    color: C.white,
  },
  exerciseSets: {
    fontFamily: FONT.regular,
    fontSize: 12,
    color: C.textSecondary,
    marginTop: 4,
  },
  emptyExerciseContainer: {
    alignItems: 'center',
    paddingTop: 50,
  },
  emptyExerciseText: {
    fontFamily: FONT.regular,
    fontSize: 15,
    color: C.textSecondary,
  },
  exerciseLoader: {
    alignItems: 'center',
    paddingTop: 50,
  },
  loaderOverlay: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
});

import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  ScrollView,
  Image,
  SafeAreaView,
  Dimensions,
  Platform,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Box } from '@components/ui/box';
import { Text } from '@components/ui/text';
import { Pressable } from '@components/ui/pressable';
import { Icon } from '@components/ui/icon';
import { Spinner } from '@components/ui/spinner';
import { Card } from '@components/ui/card';
import { HStack } from '@components/ui/hstack';
import { VStack } from '@components/ui/vstack';
import { Divider } from '@components/ui/divider';
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
    <Box style={styles.dataItem}>
      <Text style={styles.dataTitle}>{title}</Text>
      <Text style={styles.dataValue}>{value}</Text>
    </Box>
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
      <Pressable
        key={item.id?.toString() || index.toString()}
        onPress={() => {
          props.navigation?.navigate('MigratedExerciseInfo', {
            mExerciseId: item.exercise?.id,
          });
        }}
      >
        <Card variant="ghost" className="p-3" style={{ marginHorizontal: 16, marginBottom: 12 }}>
          <HStack space="md" className="items-center">
            {item.exercise?.exercise_image ? (
              <Image source={{ uri: item.exercise.exercise_image }} style={styles.exerciseImage} resizeMode="cover" />
            ) : null}
            <VStack className="flex-1">
              <Text style={styles.exerciseTitle} numberOfLines={1}>
                {item.exercise?.title || 'Exercise'}
              </Text>
              {sets.length > 0 && (
                <Text style={styles.exerciseSets}>{sets.join(' / ')}</Text>
              )}
            </VStack>
            <Icon name="chevron-forward" size={20} color={C.gray30} />
          </HStack>
        </Card>
      </Pressable>
    );
  };

  if (!workoutDetail && !isDetailLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <Box style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No data available</Text>
        </Box>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      <Box style={styles.heroSection}>
        {workoutDetail?.workout_image ? (
          <Image
            source={{ uri: workoutDetail.workout_image }}
            style={styles.heroImage}
            resizeMode="cover"
          />
        ) : (
          <Box style={[styles.heroImage, { backgroundColor: C.surface }]} />
        )}
        <LinearGradient
          colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.8)']}
          style={styles.heroOverlay}
        />

        {/* Back Button */}
        <Pressable style={styles.backBtn} onPress={() => props.navigation?.goBack()}>
          <Icon name="chevron-back" size={24} color="#FFFFFF" />
        </Pressable>

        {/* Premium Badge */}
        {workoutDetail?.is_premium === 1 && (
          <Box style={styles.proBadge}>
            <Text style={styles.proText}>PRO</Text>
          </Box>
        )}

        {/* Favorite Button */}
        <Pressable
          style={styles.favBtn}
          onPress={() => setWorkoutFav(workoutDetail?.id)}
        >
          <Icon
            name={workoutDetail?.is_favourite === 1 ? 'heart' : 'heart-outline'}
            size={22}
            color={workoutDetail?.is_favourite === 1 ? C.pink : '#FFFFFF'}
          />
        </Pressable>

        {/* Title */}
        <Text style={styles.heroTitle}>
          {workoutDetail?.title?.charAt(0).toUpperCase() + (workoutDetail?.title?.slice(1) || '')}
        </Text>
      </Box>

      {/* Content Sheet */}
      <ScrollView
        ref={scrollRef}
        style={styles.contentSheet}
        contentContainerStyle={styles.contentSheetInner}
      >
        {/* Data Row */}
        <HStack className="justify-around px-8 py-2.5">
          {renderDataItem('', 'Workout Type', workoutDetail?.workout_type_title || '-')}
          {renderDataItem('', 'Level', workoutDetail?.level_title || '-')}
        </HStack>

        <Divider className="mx-4" style={{ marginVertical: 10 }} />

        {/* Description */}
        {workoutDetail?.description && !isDetailLoading && (
          <Box style={styles.descriptionSection}>
            <Text style={styles.descriptionText}>{workoutDetail.description}</Text>
          </Box>
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
                <Pressable
                  key={day.id?.toString() || index.toString()}
                  style={[styles.tab, currentTabIndex === index && styles.tabActive]}
                  onPress={() => onTabTap(index)}
                >
                  <Text
                    style={[styles.tabText, currentTabIndex === index && styles.tabTextActive]}
                  >
                    Day {index + 1}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
            <Divider className="mx-4" style={{ marginVertical: 10 }} />
          </>
        )}

        {/* Exercise List */}
        {dayExerciseList.length > 0 ? (
          dayExerciseList.map((item, index) => renderExerciseItem(item, index))
        ) : (
          !isLoading &&
          workoutDayList.length > 0 && (
            <Box style={styles.emptyExerciseContainer}>
              <Text style={styles.emptyExerciseText}>
                {workoutDayList[currentTabIndex]?.is_rest === 1
                  ? 'Rest Day'
                  : 'No exercises found'}
              </Text>
            </Box>
          )
        )}

        {isLoading && (
          <Box style={styles.exerciseLoader}>
            <Spinner size="large" color={C.textPrimary} />
          </Box>
        )}

        <Box style={{ height: 30 }} />
      </ScrollView>

      {isDetailLoading && (
        <Box style={styles.loaderOverlay}>
          <Spinner size="large" color="#FFFFFF" />
        </Box>
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
  exerciseImage: {
    width: 55,
    height: 55,
    borderRadius: 10,
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

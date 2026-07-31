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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useResponsiveStyleSheet } from '@helper/responsiveStyleSheet';
import { C, FONT } from './theme';
import { workoutHistoryApi } from '../../api/workoutHistory';

interface WorkoutHistoryItem {
  exerciseId: number;
  exerciseTitle: string;
  exerciseImage: string;
  exerciseIsPremium?: number;
  workoutTitle: string;
  workoutId: number;
  workoutDayId: number;
  sets: { reps: string; weight: string; time?: string }[];
  date: string | null;
  [key: string]: any;
}

function formatHistoryDate(date: string | null): string {
  if (!date) return '';
  const d = new Date(`${date}T00:00:00`);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
}

export default function WorkoutHistoryScreen(props: any) {
  const [historyList, setHistoryList] = useState<WorkoutHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    getUserWorkoutExercise();
  };

  const getUserWorkoutExercise = async () => {
    setIsLoading(true);
    try {
      await workoutHistoryApi.getWorkoutExerciseHistory({}).then((res) => {
        const value: any = res.data;
        const items = (value.data ?? []).map((item: any) => ({
          exerciseId: item.exercise_id,
          exerciseTitle: item.exercise_title || '',
          exerciseImage: item.exercise_image || '',
          exerciseIsPremium: item.exercise_is_premium,
          workoutTitle: item.workout_title || '',
          workoutId: item.workout_id,
          workoutDayId: item.workout_day_id,
          sets: item.sets || [],
          date: item.date || null,
        }));
        setHistoryList(items);
      });
    } catch (e) {
    } finally {
      setIsLoading(false);
    }
  };

  const handleItemPress = async (item: WorkoutHistoryItem, index: number) => {
    // Check subscription
    // if (userStore.subscription === "1" && item.exerciseIsPremium === 1 && userStore.isSubscribe === 0) {
    //   props.navigation?.navigate('SubscribeScreen');
    //   return;
    // }

    const result = await props.navigation?.navigate('MigratedExerciseDetail', {
      mExerciseName: item.exerciseTitle,
      mExerciseId: item.exerciseId,
      workOutId: item.workoutId?.toString(),
      workoutDayId: item.workoutDayId,
      isCompleted: true,
      isFrom: 'workoutHistory',
    });

    if (result === 'removeWorkout') {
      setHistoryList((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const renderHistoryItem = (item: WorkoutHistoryItem, index: number) => (
    <TouchableOpacity
      key={`${item.exerciseId}-${index}`}
      style={styles.historyItem}
      activeOpacity={0.7}
      onPress={() => handleItemPress(item, index)}
    >
      <Image
        source={{ uri: item.exerciseImage }}
        style={styles.exerciseImage}
        resizeMode="cover"
      />
      <View style={styles.exerciseContent}>
        <Text style={styles.exerciseTitle} numberOfLines={1}>
          {item.exerciseTitle}
        </Text>
        <View style={styles.workoutRow}>
          <Text style={styles.workoutLabel}>Workout: </Text>
          <Text style={styles.workoutTitle} numberOfLines={1}>
            {item.workoutTitle}
          </Text>
          {item.exerciseIsPremium === 1 && (
            <View style={styles.proBadge}>
              <Text style={styles.proText}>PRO</Text>
            </View>
          )}
        </View>
        {(item.sets.length > 0 || item.date) && (
          <Text style={styles.detailText} numberOfLines={1}>
            {item.sets.length > 0 ? `${item.sets.length} series` : 'Completado'}
            {item.date ? ` · ${formatHistoryDate(item.date)}` : ''}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => props.navigation?.goBack()}>
          <Ionicons name="chevron-back" size={24} color={C.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Workout History</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.body}>
        {historyList.length > 0 ? (
          <ScrollView
            ref={scrollRef}
            contentContainerStyle={styles.scrollContent}
          >
            {historyList.map((item, index) => renderHistoryItem(item, index))}
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
            <ActivityIndicator size="large" color={C.brand5} />
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
  body: { flex: 1 },
  scrollContent: { paddingVertical: 4, paddingHorizontal: 16 },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.surfaceLight,
    borderRadius: 12,
    marginVertical: 8,
    padding: 10,
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
    maxWidth: '100%',
  },
  workoutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    flex: 1,
  },
  workoutLabel: {
    fontFamily: FONT.regular,
    fontSize: 13,
    color: C.textSecondary,
  },
  workoutTitle: {
    fontFamily: FONT.semiBold,
    fontSize: 13,
    color: C.white,
    flex: 1,
  },
  detailText: {
    fontFamily: FONT.regular,
    fontSize: 12,
    color: C.textSecondary,
    marginTop: 4,
  },
  proBadge: {
    backgroundColor: C.orange,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 8,
  },
  proText: {
    fontFamily: FONT.bold,
    fontSize: 10,
    color: C.white,
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

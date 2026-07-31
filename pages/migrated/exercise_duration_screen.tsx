import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useResponsiveStyleSheet } from '@helper/responsiveStyleSheet';
import { C, FONT } from './theme';
import { workoutHistoryApi } from '../../api/workoutHistory';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ExerciseDetailResponse {
  data?: {
    id?: number;
    title?: string;
    type?: string;
    based?: string;
    videoUrl?: string;
    exerciseImage?: string;
    duration?: string;
    [key: string]: any;
  };
  [key: string]: any;
}

interface ExerciseDurationScreenProps {
  navigation: any;
  route: {
    params: {
      mExerciseModel?: ExerciseDetailResponse;
      workOutId?: string;
      workoutDayId?: number;
    };
  };
}

export default function ExerciseDurationScreen(props: ExerciseDurationScreenProps) {
  const { mExerciseModel, workOutId, workoutDayId } = props.route?.params ?? {};

  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [totalCountdown, setTotalCountdown] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [mUpNextDayList, setMUpNextDayList] = useState<any[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    init();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const init = async () => {
    const durationStr = mExerciseModel?.data?.duration || '00:00:00';
    const totalSeconds = parseDurationString(durationStr);
    setTotalCountdown(totalSeconds);
    setCountdown(totalSeconds);
    loadUpNextExercises();
  };

  const parseDurationString = (durationString: string): number => {
    const components = durationString.split(':');
    if (components.length === 3) {
      const hours = parseInt(components[0], 10) || 0;
      const minutes = parseInt(components[1], 10) || 0;
      const seconds = parseInt(components[2], 10) || 0;
      return hours * 3600 + minutes * 60 + seconds;
    }
    return 0;
  };

  const formatTime = (totalSeconds: number): string => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const loadUpNextExercises = async () => {
    try {
      // Up-next list: not available via a single endpoint for this context
      // Leaving empty — the exercise list is already shown in WorkoutDetail
    } catch (e) {
    }
  };

  const startCountdown = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsPlaying(true);
    intervalRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          setIsPlaying(false);
          setIsCompleted(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const pauseCountdown = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsPlaying(false);
  };

  const resetCountdown = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsPlaying(false);
    setCountdown(totalCountdown);
  };

  const completeExercise = async () => {
    setIsLoading(true);
    try {
      if (workOutId && mExerciseModel?.data?.id) {
        await workoutHistoryApi.storeWorkoutExercise({
          workout_id: parseInt(workOutId, 10),
          exercise_id: mExerciseModel.data.id,
          sets: [],
          date: new Date().toISOString().split('T')[0],
          workout_day_id: workoutDayId,
        });
      }
      props.navigation.pop();
      props.navigation.navigate('MigratedExerciseDetail', {
        action: 'refreshWorkout',
        workoutDayId,
      });
    } catch (e) {
    } finally {
      setIsLoading(false);
    }
  };

  const progress = totalCountdown > 0 ? countdown / totalCountdown : 0;

  return (
    <View style={localStyles.container}>
      {/* App Bar */}
      <View style={localStyles.appBar}>
        <TouchableOpacity onPress={() => props.navigation.goBack()} style={localStyles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={C.textPrimary} />
        </TouchableOpacity>
        <Text style={localStyles.appBarTitle} numberOfLines={1}>
          {mExerciseModel?.data?.title || ''}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={localStyles.scrollContent}>
        {/* Video/Exercise Image */}
        <View style={localStyles.videoContainer}>
          {mExerciseModel?.data?.exerciseImage ? (
            <Image
              source={{ uri: mExerciseModel.data.exerciseImage }}
              style={localStyles.exerciseImage}
              resizeMode="cover"
            />
          ) : (
            <View style={[localStyles.exerciseImage, { backgroundColor: C.gray70 }]} />
          )}
        </View>

        <View style={{ height: 60 }} />

        {/* Countdown */}
        <View style={localStyles.countdownContainer}>
          <View style={localStyles.countdownRing}>
            {/* Progress Circle placeholder */}
            <View style={localStyles.countdownInner}>
              <Text style={localStyles.countdownText}>{formatTime(countdown)}</Text>
            </View>
          </View>
        </View>

        {/* Controls */}
        <View style={localStyles.controlsRow}>
          <TouchableOpacity style={localStyles.controlBtn} onPress={resetCountdown}>
            <Ionicons name="refresh" size={28} color="#FFFFFF" />
          </TouchableOpacity>

          <TouchableOpacity
            style={localStyles.playBtn}
            onPress={isPlaying ? pauseCountdown : startCountdown}
          >
            <Ionicons name={isPlaying ? 'pause' : 'play'} size={36} color={C.textPrimary} />
          </TouchableOpacity>

          <TouchableOpacity style={localStyles.controlBtn} onPress={completeExercise}>
            <Ionicons name="checkmark-circle-outline" size={28} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <View style={{ height: 30 }} />

        {/* Complete Button */}
        {workOutId ? (
          <TouchableOpacity style={localStyles.completeBtn} onPress={completeExercise}>
            <Text style={localStyles.completeBtnText}>Complete</Text>
          </TouchableOpacity>
        ) : null}

        <View style={{ height: 16 }} />

        {/* Up Next */}
        {mUpNextDayList.length > 0 && (
          <>
            <View style={localStyles.separator} />
            <Text style={localStyles.upNextTitle}>Up Next</Text>
          </>
        )}
      </ScrollView>

      {isLoading && (
        <View style={localStyles.loaderContainer}>
          <ActivityIndicator size="large" color={C.textPrimary} />
        </View>
      )}
    </View>
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
  backBtn: { padding: 8 },
  appBarTitle: {
    flex: 1,
    fontFamily: FONT.bold,
    fontSize: 18,
    color: C.white,
    textAlign: 'center',
  },
  scrollContent: { paddingBottom: 40 },
  videoContainer: {
    width: SCREEN_WIDTH,
    aspectRatio: 12 / 7,
  },
  exerciseImage: {
    width: '100%',
    height: '100%',
    backgroundColor: C.gray70,
    borderRadius: 0,
  },
  countdownContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  countdownRing: {
    width: 190,
    height: 190,
    borderRadius: 95,
    borderWidth: 10,
    borderColor: C.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  countdownInner: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  countdownText: {
    fontFamily: FONT.bold,
    fontSize: 48,
    color: C.textPrimary,
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 30,
  },
  controlBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playBtn: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: C.brand50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  completeBtn: {
    marginHorizontal: 16,
    backgroundColor: C.brand50,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  completeBtnText: {
    fontFamily: FONT.bold,
    fontSize: 16,
    color: C.white,
  },
  separator: {
    height: 1,
    backgroundColor: C.border,
    marginHorizontal: 16,
    marginVertical: 8,
  },
  upNextTitle: {
    fontFamily: FONT.bold,
    fontSize: 18,
    color: C.white,
    paddingHorizontal: 20,
    marginTop: 16,
  },
  loaderContainer: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

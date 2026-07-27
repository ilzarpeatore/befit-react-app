import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions, ActivityIndicator, Slider } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useResponsiveStyleSheet } from '@helper/responsiveStyleSheet';
import { C, FONT } from './theme';
import { workoutHistoryApi } from '../../api/workoutHistory';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface Sets {
  reps?: string;
  time?: string;
  weight?: string;
  rest?: string;
  [key: string]: any;
}

interface ExerciseDetailResponse {
  data?: {
    id?: number;
    title?: string;
    type?: string;
    based?: string;
    videoUrl?: string;
    exerciseImage?: string;
    sets?: Sets[];
    secondsPerRep?: number;
    [key: string]: any;
  };
  [key: string]: any;
}

interface ExerciseDurationScreencastProps {
  navigation: any;
  route: {
    params: {
      mExerciseModel?: ExerciseDetailResponse;
      workOutId?: string;
      workoutDayId?: number;
    };
  };
}

export default function ExerciseDurationScreencast(props: ExerciseDurationScreencastProps) {
  const { mExerciseModel, workOutId, workoutDayId } = props.route.params;

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSetIndex, setCurrentSetIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState('0:00');
  const [totalVideoTime, setTotalVideoTime] = useState('0:00');
  const [showControls, setShowControls] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [mUpNextDayList, setMUpNextDayList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const hideTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    init();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, []);

  const init = async () => {
    const sets = mExerciseModel?.data?.sets || [];
    if (sets.length > 0) {
      const firstSet = sets[0];
      const time = mExerciseModel?.data?.based === 'reps'
        ? parseInt(firstSet.reps || '0', 10)
        : parseInt(firstSet.time || '0', 10);
      setTimeLeft(time);
      setTotalTime(time);
    }
    loadUpNextExercises();
  };

  const loadUpNextExercises = async () => {
    try {
      // Up-next list: not available via a single endpoint for this context
    } catch (e) {
    }
  };

  const formatTime1 = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const startWorkout = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsPlaying(true);
    setIsResting(false);
    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleSetComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSetComplete = () => {
    const sets = mExerciseModel?.data?.sets || [];
    if (currentSetIndex < sets.length - 1) {
      setIsResting(true);
      const restTime = parseInt(sets[currentSetIndex]?.rest || '0', 10);
      setTimeLeft(restTime);
      setTotalTime(restTime);

      // Start rest countdown
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setCurrentSetIndex((prevIdx) => prevIdx + 1);
            setIsResting(false);
            const nextIdx = currentSetIndex + 1;
            const nextSet = sets[nextIdx];
            const nextTime = mExerciseModel?.data?.based === 'reps'
              ? parseInt(nextSet?.reps || '0', 10)
              : parseInt(nextSet?.time || '0', 10);
            setTimeLeft(nextTime);
            setTotalTime(nextTime);
            if (intervalRef.current) clearInterval(intervalRef.current);
            intervalRef.current = setInterval(() => {
              setTimeLeft((p) => {
                if (p <= 1) {
                  handleSetComplete();
                  return 0;
                }
                return p - 1;
              });
            }, 1000);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      // All sets done
      if (intervalRef.current) clearInterval(intervalRef.current);
      setIsPlaying(false);
      setIsCompleted(true);
      completeExercise();
    }
  };

  const pauseWorkout = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsPlaying(false);
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
        });
      }
      props.navigation.pop();
      props.navigation.navigate({
        name: 'MigratedExerciseDetail',
        params: {
          action: 'refreshWorkout',
          workoutDayId,
        },
        merge: true,
      });
    } catch (e) {
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompletePress = () => {
    // Show confirmation dialog then complete
    completeExercise();
  };

  const toggleController = () => {
    setShowControls((prev) => !prev);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    if (!showControls) {
      hideTimerRef.current = setTimeout(() => setShowControls(false), 4000);
    }
  };

  const progress = totalTime > 0 ? (totalTime - timeLeft) / totalTime : 0;

  const sets = mExerciseModel?.data?.sets || [];
  const currentWeight = currentSetIndex < sets.length
    ? sets[currentSetIndex]?.weight || '-'
    : '-';

  return (
    <View style={localStyles.container}>
      {/* App Bar */}
      <View style={localStyles.appBar}>
        <TouchableOpacity onPress={() => props.navigation.goBack()} style={localStyles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={C.brand5} />
        </TouchableOpacity>
        <Text style={localStyles.appBarTitle} numberOfLines={1}>
          {mExerciseModel?.data?.title || ''}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={localStyles.scrollContent}>
        {/* Video / Exercise Image */}
        <View style={localStyles.videoContainer}>
          {mExerciseModel?.data?.exerciseImage ? (
            <TouchableOpacity activeOpacity={1} onPress={toggleController} style={{ flex: 1 }}>
              <Image
                source={{ uri: mExerciseModel.data.exerciseImage }}
                style={localStyles.exerciseImage}
                resizeMode="cover"
              />
              {/* Controls Overlay */}
              {showControls && (
                <View style={localStyles.controlsOverlay}>
                  <View style={localStyles.controlsCenter}>
                    <TouchableOpacity onPress={pauseWorkout} style={localStyles.controlCircle}>
                      <Ionicons name={isPlaying ? 'pause' : 'play'} size={30} color={C.white} />
                    </TouchableOpacity>
                  </View>
                  <View style={localStyles.controlsBottom}>
                    <Text style={localStyles.timeText}>{currentTime} / {totalVideoTime}</Text>
                  </View>
                </View>
              )}
            </TouchableOpacity>
          ) : (
            <View style={[localStyles.exerciseImage, { backgroundColor: C.gray70 }]} />
          )}
        </View>

        <View style={{ height: 30 }} />

        {/* Sets & Weight Info */}
        <View style={localStyles.infoRow}>
          <View style={localStyles.infoCard}>
            <Text style={localStyles.infoLabel}>SETS</Text>
            <Text style={localStyles.infoValue}>
              {currentSetIndex + 1} / {sets.length}
            </Text>
          </View>
          <View style={{ width: 16 }} />
          <View style={localStyles.infoCard}>
            <Text style={localStyles.infoLabel}>WEIGHT</Text>
            <Text style={localStyles.infoValue}>
              {currentWeight} {currentWeight !== '-' ? '' : ''}
            </Text>
          </View>
        </View>

        <View style={{ height: 50 }} />

        {/* Countdown Circle */}
        <View style={localStyles.countdownContainer}>
          <View style={localStyles.countdownRing}>
            <View style={localStyles.countdownInner}>
              <Text style={localStyles.countdownText}>{formatTime1(timeLeft)}</Text>
              {mExerciseModel?.data?.based === 'reps' ? (
                <Text style={localStyles.countdownLabel}>REPS</Text>
              ) : (
                <Text style={localStyles.countdownLabel}>SECONDS</Text>
              )}
            </View>
          </View>
        </View>

        <View style={{ height: 16 }} />

        {/* Status text */}
        {isResting && (
          <Text style={localStyles.restingText}>Rest...</Text>
        )}

        <View style={{ height: 16 }} />

        {/* Complete Button */}
        {workOutId ? (
          <TouchableOpacity style={localStyles.completeBtn} onPress={handleCompletePress}>
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
          <ActivityIndicator size="large" color={C.brand5} />
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
    overflow: 'hidden',
  },
  exerciseImage: {
    width: '100%',
    height: '100%',
    backgroundColor: C.gray70,
  },
  controlsOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
  },
  controlsCenter: {
    alignItems: 'center',
  },
  controlCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlsBottom: {
    position: 'absolute',
    bottom: 10,
    left: 16,
    right: 16,
  },
  timeText: {
    fontFamily: FONT.bold,
    fontSize: 13,
    color: C.white,
  },
  infoRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
  },
  infoCard: {
    flex: 1,
    backgroundColor: C.surfaceLight,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  infoLabel: {
    fontFamily: FONT.bold,
    fontSize: 12,
    color: C.gray30,
    letterSpacing: 1.2,
  },
  infoValue: {
    fontFamily: FONT.bold,
    fontSize: 20,
    color: C.white,
    marginTop: 8,
  },
  countdownContainer: {
    alignItems: 'center',
  },
  countdownRing: {
    width: 190,
    height: 190,
    borderRadius: 95,
    borderWidth: 10,
    borderColor: C.brand5,
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
    color: C.brand5,
  },
  countdownLabel: {
    fontFamily: FONT.bold,
    fontSize: 14,
    color: C.gray30,
    letterSpacing: 2,
    marginTop: 4,
  },
  restingText: {
    fontFamily: FONT.bold,
    fontSize: 18,
    color: C.gray30,
    textAlign: 'center',
  },
  completeBtn: {
    marginHorizontal: 20,
    backgroundColor: C.brand5,
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

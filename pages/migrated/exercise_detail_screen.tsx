import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions, ActivityIndicator, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useResponsiveStyleSheet } from '@helper/responsiveStyleSheet';
import { C, FONT } from './theme';
import { exercisesApi } from '../../api/exercises';
import { workoutHistoryApi } from '../../api/workoutHistory';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface Sets {
  reps?: string;
  time?: string;
  weight?: string;
  rest?: string;
  [key: string]: any;
}

interface ExerciseDetailData {
  id?: number;
  title?: string;
  type?: string;
  based?: string;
  videoUrl?: string;
  exerciseImage?: string;
  levelTitle?: string;
  duration?: string;
  tips?: string;
  instruction?: string;
  sets?: Sets[];
  bodypartName?: { title: string; bodypartImage: string }[];
  equipmentName?: { title: string; equipmentImage: string }[];
  [key: string]: any;
}

interface ExerciseDetailScreenProps {
  navigation: any;
  route: {
    params: {
      mExerciseId?: number;
      mExerciseName?: string;
      workOutId?: string;
      workoutDayId?: number;
      isCompleted?: boolean;
      isFrom?: string;
    };
  };
}

export default function ExerciseDetailScreen(props: ExerciseDetailScreenProps) {
  const {
    mExerciseId,
    mExerciseName,
    workOutId,
    workoutDayId,
    isCompleted: initialIsCompleted,
    isFrom,
  } = props.route.params;

  const [mExerciseModel, setMExerciseModel] = useState<ExerciseDetailData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCompleted, setIsCompleted] = useState(initialIsCompleted ?? false);
  const [mWeight, setMWeight] = useState<number | undefined>(undefined);
  const [isKGClicked, setIsKGClicked] = useState(false);
  const [isLBSClicked, setIsLBSClicked] = useState(false);
  const scrollController = useRef<FlatList | null>(null);

  useEffect(() => {
    loadExerciseDetail();
  }, []);

  const loadExerciseDetail = async () => {
    setIsLoading(true);
    try {
      const res = await exercisesApi.getDetail(mExerciseId!);
      const d = res.data.data;
      setMExerciseModel({
        id: d.id,
        title: d.title,
        type: d.type,
        based: d.based,
        videoUrl: d.video_url,
        exerciseImage: d.exercise_image,
        levelTitle: d.level_title,
        duration: d.duration,
        tips: d.tips,
        instruction: d.instruction,
        sets: d.sets,
        bodypartName: (d.bodypart_name ?? []).map((bp: any) => ({
          title: bp.title,
          bodypartImage: bp.bodypart_image,
        })),
        equipmentName: d.equipment_title ? [{
          title: d.equipment_title,
          equipmentImage: d.equipment_image || '',
        }] : [],
      });
    } catch (e) {
      console.log(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    props.navigation.goBack({
      action: 'refreshWorkout',
      workoutDayId,
    });
  };

  const handleTips = () => {
    props.navigation.navigate('MigratedTips', {
      mExerciseVideo: mExerciseModel?.videoUrl || '',
      mTips: mExerciseModel?.tips || '',
      mExerciseImage: mExerciseModel?.exerciseImage || '',
      mExerciseInstruction: mExerciseModel?.instruction || '',
    });
  };

  const handleStartExercise = async () => {
    if (isCompleted) {
      setIsLoading(true);
      try {
        await workoutHistoryApi.storeWorkoutExercise({
          workout_id: Number(workOutId) || 0,
          exercise_id: mExerciseId || 0,
          sets: [],
          date: new Date().toISOString().split('T')[0],
          workout_day_id: workoutDayId,
        });
        setIsCompleted(false);
        handleBack();
      } catch (e) {
        console.log(e);
      } finally {
        setIsLoading(false);
      }
    } else {
      if (mExerciseModel?.type === 'duration') {
        props.navigation.navigate('MigratedExerciseDuration', {
          mExerciseModel,
          workOutId,
          workoutDayId,
        });
      } else {
        props.navigation.navigate('MigratedExerciseDurationCast', {
          mExerciseModel,
          workOutId,
          workoutDayId,
        });
      }
    }
  };

  const mWeightOption = (value: string, index: number) => {
    const isActive = mWeight === index;
    return (
      <TouchableOpacity
        style={[localStyles.weightBtn, isActive && localStyles.weightBtnActive]}
        onPress={() => {
          setMWeight(index);
          if (index === 0) {
            setIsLBSClicked(true);
            setIsKGClicked(false);
          } else {
            setIsKGClicked(true);
            setIsLBSClicked(false);
          }
        }}
      >
        <Text style={[localStyles.weightBtnText, isActive && localStyles.weightBtnTextActive]}>
          {value}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderSetItem = (set: Sets, index: number) => {
    const displayValue = mExerciseModel?.based === 'reps'
      ? `${set.reps || ''}x`
      : `${set.time || ''}s`;
    return (
      <View key={index} style={localStyles.setItem}>
        <Text style={localStyles.setValue}>{displayValue}</Text>
        {set.weight ? (
          <Text style={localStyles.setWeight}>
            - {set.weight} {isLBSClicked ? 'lbs' : 'kg'}
          </Text>
        ) : null}
      </View>
    );
  };

  const renderSets = () => {
    const sets = mExerciseModel?.sets;
    if (!sets || sets.length === 0) {
      return <Text style={localStyles.noSets}>No sets available</Text>;
    }
    return (
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {sets.map((set, index) => (
          <View key={index} style={localStyles.setCard}>
            {renderSetItem(set, index)}
          </View>
        ))}
      </ScrollView>
    );
  };

  const renderRestTimes = () => {
    const sets = mExerciseModel?.sets;
    if (!sets || sets.length === 0) {
      return <Text style={localStyles.noSets}>No rest data</Text>;
    }
    return (
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {sets.map((set, index) => (
          <View key={index} style={localStyles.setCard}>
            <Text style={localStyles.setValue}>{set.rest || ''}s</Text>
          </View>
        ))}
      </ScrollView>
    );
  };

  if (isLoading && !mExerciseModel) {
    return (
      <View style={localStyles.loadingContainer}>
        <ActivityIndicator size="large" color={C.orange} />
      </View>
    );
  }

  return (
    <View style={localStyles.container}>
      {/* App Bar */}
      <View style={localStyles.appBar}>
        <TouchableOpacity onPress={handleBack} style={localStyles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={C.textPrimary} />
        </TouchableOpacity>
        <Text style={localStyles.appBarTitle} numberOfLines={1}>
          {mExerciseName || ''}
        </Text>
        <TouchableOpacity onPress={handleTips} style={localStyles.tipsBtn}>
          <Ionicons name="menu" size={24} color={C.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={localStyles.scrollContent}>
        {/* Exercise Header */}
        {mExerciseModel?.exerciseImage ? (
          <Image
            source={{ uri: mExerciseModel.exerciseImage }}
            style={localStyles.exerciseImage}
            resizeMode="cover"
          />
        ) : null}

        {/* Level & Weight Toggle */}
        <View style={localStyles.levelRow}>
          {mExerciseModel?.levelTitle ? (
            <View style={localStyles.levelBadge}>
              <Ionicons name="bar-chart" size={16} color={C.textPrimary} />
              <Text style={localStyles.levelText}>{mExerciseModel.levelTitle}</Text>
            </View>
          ) : null}
          {mExerciseModel?.sets && mExerciseModel.sets.length > 0 && (
            <View style={localStyles.weightToggle}>
              {mWeightOption('lbs', 0)}
              {mWeightOption('kg', 1)}
            </View>
          )}
        </View>

        {/* Sets */}
        <View style={localStyles.section}>
          <Text style={localStyles.sectionTitle}>Sets</Text>
          {renderSets()}
        </View>

        <View style={localStyles.section}>
          <Text style={localStyles.sectionTitle}>Rest</Text>
          {renderRestTimes()}
        </View>

        {/* Duration */}
        {mExerciseModel?.type === 'duration' && mExerciseModel?.duration && (
          <View style={localStyles.durationContainer}>
            <Text style={localStyles.durationValue}>{mExerciseModel.duration}</Text>
            <Text style={localStyles.durationLabel}>Duration</Text>
          </View>
        )}

        <View style={localStyles.separator} />

        {/* Body Parts */}
        {mExerciseModel?.bodypartName && mExerciseModel.bodypartName.length > 0 && (
          <View style={localStyles.section}>
            <Text style={localStyles.sectionTitle}>Body Parts</Text>
            <FlatList
              horizontal
              data={mExerciseModel.bodypartName}
              keyExtractor={(item, i) => `${i}`}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16 }}
              renderItem={({ item }) => (
                <View style={localStyles.bodyPartItem}>
                  <Image source={{ uri: item.bodypartImage }} style={localStyles.bodyPartImage} />
                  <Text style={localStyles.bodyPartText}>{item.title}</Text>
                </View>
              )}
            />
          </View>
        )}

        {/* Equipment */}
        {mExerciseModel?.equipmentName && mExerciseModel.equipmentName.length > 0 && (
          <View style={localStyles.section}>
            <Text style={localStyles.sectionTitle}>Equipment</Text>
            <FlatList
              horizontal
              data={mExerciseModel.equipmentName}
              keyExtractor={(item, i) => `${i}`}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16 }}
              renderItem={({ item }) => (
                <View style={localStyles.bodyPartItem}>
                  <Image source={{ uri: item.equipmentImage }} style={localStyles.bodyPartImage} />
                  <Text style={localStyles.bodyPartText}>{item.title}</Text>
                </View>
              )}
            />
          </View>
        )}
      </ScrollView>

      {/* Bottom Button */}
      <View style={localStyles.bottomBar}>
        <TouchableOpacity style={localStyles.startBtn} onPress={handleStartExercise}>
          <Text style={localStyles.startBtnText}>
            {isCompleted ? 'Reset Exercise' : 'Start Exercise'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const localStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: C.bg,
  },
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
  tipsBtn: { padding: 8 },
  scrollContent: { paddingBottom: 80 },
  exerciseImage: {
    width: SCREEN_WIDTH,
    height: 200,
    backgroundColor: C.gray70,
  },
  levelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.surfaceLight,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  levelText: {
    fontFamily: FONT.regular,
    fontSize: 14,
    color: C.white,
    marginLeft: 6,
  },
  weightToggle: {
    flexDirection: 'row',
    backgroundColor: C.surfaceLight,
    borderRadius: 4,
    padding: 4,
  },
  weightBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  weightBtnActive: {
    backgroundColor: C.brand5,
  },
  weightBtnText: {
    fontFamily: FONT.regular,
    fontSize: 12,
    color: C.gray30,
  },
  weightBtnTextActive: {
    color: C.white,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: FONT.regular,
    fontSize: 14,
    color: C.gray30,
    marginBottom: 8,
  },
  setCard: {
    backgroundColor: C.surfaceLight,
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    alignItems: 'center',
    minWidth: 80,
  },
  setItem: {
    alignItems: 'center',
  },
  setValue: {
    fontFamily: FONT.bold,
    fontSize: 18,
    color: C.white,
  },
  setWeight: {
    fontFamily: FONT.regular,
    fontSize: 14,
    color: C.textPrimary,
    marginTop: 4,
  },
  noSets: {
    fontFamily: FONT.regular,
    fontSize: 14,
    color: C.gray30,
    textAlign: 'center',
    paddingVertical: 20,
  },
  durationContainer: {
    width: SCREEN_WIDTH - 32,
    marginHorizontal: 16,
    backgroundColor: C.surfaceLight,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  durationValue: {
    fontFamily: FONT.bold,
    fontSize: 16,
    color: C.white,
  },
  durationLabel: {
    fontFamily: FONT.regular,
    fontSize: 14,
    color: C.gray30,
    marginTop: 2,
  },
  separator: {
    height: 1,
    backgroundColor: C.border,
    marginHorizontal: 16,
    marginVertical: 8,
  },
  bodyPartItem: {
    alignItems: 'center',
    marginRight: 16,
    width: SCREEN_WIDTH * 0.18,
  },
  bodyPartImage: {
    width: 65,
    height: 65,
    borderRadius: 32,
    backgroundColor: C.gray70,
  },
  bodyPartText: {
    fontFamily: FONT.regular,
    fontSize: 12,
    color: C.white,
    textAlign: 'center',
    marginTop: 6,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: C.bg,
  },
  startBtn: {
    backgroundColor: C.brand5,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  startBtnText: {
    fontFamily: FONT.bold,
    fontSize: 16,
    color: C.white,
  },
});

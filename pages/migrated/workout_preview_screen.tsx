import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Dimensions,
  Platform,
  StatusBar,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { C, FONT } from './theme';
import { ExerciseThumbMem } from '../../components/ExerciseThumb';
import {
  fetchUnifiedWorkout,
  formatPrescribedSubtitle,
  UnifiedWorkout,
} from './workoutViewShared';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface Props {
  navigation?: any;
  route?: any;
}

export default function WorkoutPreviewScreen(props: Props) {
  const { navigation, route } = props;
  const insets = useSafeAreaInsets();
  const programDayAssignmentId: number | undefined = route?.params?.programDayAssignmentId;
  const workoutTemplateId: number | undefined = route?.params?.workoutTemplateId;
  const fallbackTitle: string | undefined = route?.params?.mTitle;

  const [workout, setWorkout] = useState<UnifiedWorkout | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isFavourite, setIsFavourite] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(false);
    try {
      const data = await fetchUnifiedWorkout({
        programDayAssignmentId,
        workoutTemplateId,
        fallbackTitle,
      });
      setWorkout(data);
    } catch (e) {
      setError(true);
    } finally {
      setIsLoading(false);
    }
  }, [programDayAssignmentId, workoutTemplateId, fallbackTitle]);

  useEffect(() => {
    load();
  }, [load]);

  const onStart = () => {
    navigation?.navigate('MigratedWorkoutSession', {
      programDayAssignmentId,
      workoutTemplateId,
      mTitle: workout?.title || fallbackTitle,
    });
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={C.brand50} />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !workout) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <TouchableOpacity style={styles.backBtnStatic} onPress={() => navigation?.goBack()}>
          <Ionicons name="chevron-back" size={22} color={C.white} />
        </TouchableOpacity>
        <View style={styles.loader}>
          <Text style={styles.emptyText}>No se pudo cargar el entrenamiento.</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (workout.isRest) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <TouchableOpacity style={styles.backBtnStatic} onPress={() => navigation?.goBack()}>
          <Ionicons name="chevron-back" size={22} color={C.white} />
        </TouchableOpacity>
        <View style={styles.loader}>
          <Ionicons name="moon-outline" size={40} color={C.textSecondary} />
          <Text style={[styles.emptyText, { marginTop: 12 }]}>Día de descanso</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 170 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header image */}
        <View style={styles.heroSection}>
          {workout.thumbnail ? (
            <Image source={{ uri: workout.thumbnail }} style={styles.heroImage} resizeMode="cover" />
          ) : (
            <LinearGradient
              colors={[C.surfaceLight, C.bg]}
              style={[styles.heroImage, styles.heroFallback]}
            >
              <Ionicons name="barbell-outline" size={64} color={C.gray30} />
            </LinearGradient>
          )}
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation?.goBack()}>
            <Ionicons name="chevron-back" size={22} color={C.white} />
          </TouchableOpacity>
        </View>

        {/* Title row */}
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={2}>
            {workout.title}
          </Text>
          <View style={styles.titleActions}>
            <TouchableOpacity style={styles.iconBtn} onPress={() => setIsSaved((v) => !v)}>
              <Ionicons name={isSaved ? 'bookmark' : 'bookmark-outline'} size={18} color={C.white} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn} onPress={() => setIsFavourite((v) => !v)}>
              <Ionicons name={isFavourite ? 'star' : 'star-outline'} size={18} color={C.white} />
            </TouchableOpacity>
          </View>
        </View>

        {workout.description ? (
          <Text style={styles.description}>{workout.description}</Text>
        ) : null}

        {/* Exercises header */}
        <Text style={styles.sectionHeader}>{workout.exerciseCount} EJERCICIOS</Text>

        {/* Exercise list */}
        <View style={styles.exerciseList}>
          {workout.blocks.map((block) => (
            <View key={block.id}>
              {workout.blocks.length > 1 && block.title ? (
                <Text style={styles.blockTitle}>{block.title}</Text>
              ) : null}
              {block.exercises.map((ex, idx) => (
                <View key={ex.id}>
                  <View style={styles.exerciseRow}>
                    <ExerciseThumbMem image={ex.image} />
                    <View style={styles.exerciseInfo}>
                      <Text style={styles.exerciseTitle} numberOfLines={2}>
                        {ex.title}
                      </Text>
                      <Text style={styles.exerciseSubtitle}>
                        {formatPrescribedSubtitle(ex.prescribed)}
                      </Text>
                    </View>
                  </View>
                  {idx < block.exercises.length - 1 && <View style={styles.separator} />}
                </View>
              ))}
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Sticky start button */}
      <View style={[styles.stickyFooter, { paddingBottom: Math.max(insets.bottom, 12) + 6 }]}>
        <TouchableOpacity style={styles.startBtn} activeOpacity={0.85} onPress={onStart}>
          <Text style={styles.startBtnText}>INICIAR ENTRENAMIENTO</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  loader: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { fontFamily: FONT.regular, fontSize: 15, color: C.textSecondary, textAlign: 'center', paddingHorizontal: 24 },
  heroSection: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.4,
  },
  heroImage: { width: '100%', height: '100%' },
  heroFallback: { alignItems: 'center', justifyContent: 'center' },
  backBtn: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 40,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtnStatic: {
    marginTop: Platform.OS === 'ios' ? 50 : 40,
    marginLeft: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: C.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 18,
  },
  title: {
    flex: 1,
    fontFamily: FONT.extraBold,
    fontSize: 22,
    color: C.white,
    marginRight: 12,
  },
  titleActions: { flexDirection: 'row', gap: 10 },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: C.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  description: {
    fontFamily: FONT.regular,
    fontSize: 13,
    color: C.textSecondary,
    paddingHorizontal: 20,
    marginTop: 10,
    lineHeight: 20,
  },
  sectionHeader: {
    fontFamily: FONT.bold,
    fontSize: 13,
    color: C.textSecondary,
    letterSpacing: 0.5,
    paddingHorizontal: 20,
    marginTop: 24,
    marginBottom: 12,
  },
  exerciseList: { paddingHorizontal: 20 },
  blockTitle: {
    fontFamily: FONT.bold,
    fontSize: 14,
    color: C.white,
    marginTop: 14,
    marginBottom: 8,
  },
  exerciseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  exerciseInfo: { flex: 1, marginLeft: 14 },
  exerciseTitle: {
    fontFamily: FONT.bold,
    fontSize: 15,
    color: C.white,
  },
  exerciseSubtitle: {
    fontFamily: FONT.regular,
    fontSize: 13,
    color: C.textSecondary,
    marginTop: 4,
  },
  separator: {
    height: 1,
    backgroundColor: C.border,
  },
  stickyFooter: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 28 : 18,
    backgroundColor: C.bg,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
  startBtn: {
    backgroundColor: C.brand50,
    borderRadius: 30,
    paddingVertical: 16,
    alignItems: 'center',
  },
  startBtnText: {
    fontFamily: FONT.bold,
    fontSize: 15,
    color: C.white,
    letterSpacing: 0.5,
  },
});

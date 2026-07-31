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
import { C, FONT, SHADOW } from './theme';
import { ExerciseThumbMem } from '../../components/ExerciseThumb';
import { workoutTemplateApi } from '../../api/workoutTemplate';
import {
  fetchUnifiedWorkout,
  formatPrescribedSubtitle,
  UnifiedWorkout,
  UnifiedExercise,
} from './workoutViewShared';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

function getSeriesCount(prescribed: Record<string, any>): number | null {
  const series = parseInt(prescribed?.series, 10);
  return Number.isFinite(series) && series > 0 ? series : null;
}

function formatLastPerformance(ex: UnifiedExercise): string | null {
  const sets = ex.lastPerformance?.sets;
  if (!sets || sets.length === 0) return null;
  const first = sets[0];
  const parts: string[] = [];
  if (first.carga != null && first.carga !== '') parts.push(`${first.carga} kg`);
  if (first.reps != null && first.reps !== '') parts.push(`${first.reps} reps`);
  if (parts.length === 0) return `Completado la última vez (${sets.length} series)`;
  return `Última vez: ${parts.join(' × ')}`;
}

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
      setIsFavourite(data.isFavourite);
    } catch (e) {
      setError(true);
    } finally {
      setIsLoading(false);
    }
  }, [programDayAssignmentId, workoutTemplateId, fallbackTitle]);

  useEffect(() => {
    load();
  }, [load]);

  const onToggleFavourite = () => {
    if (!workoutTemplateId) return;
    const next = !isFavourite;
    setIsFavourite(next);
    workoutTemplateApi.setFavourite(workoutTemplateId).catch(() => {
      setIsFavourite(!next);
    });
  };

  const totalSeries = (workout?.blocks ?? []).reduce(
    (sum, block) => sum + block.exercises.reduce((s, ex) => s + (getSeriesCount(ex.prescribed) ?? 0), 0),
    0
  );

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
          <ActivityIndicator size="large" color={C.textPrimary} />
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

  if (workout.isExclusive && !workout.isAccessible) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <TouchableOpacity style={styles.backBtnStatic} onPress={() => navigation?.goBack()}>
          <Ionicons name="chevron-back" size={22} color={C.white} />
        </TouchableOpacity>
        <View style={styles.loader}>
          <Ionicons name="lock-closed-outline" size={40} color={C.textSecondary} />
          <Text style={[styles.title, { textAlign: 'center', marginTop: 16 }]}>{workout.title}</Text>
          <Text style={[styles.emptyText, { marginTop: 8 }]}>
            Contenido exclusivo — hazte cliente 1:1 o compra un paquete con acceso completo a Workouts.
          </Text>
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
            <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Title row */}
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={2}>
            {workout.title}
          </Text>
          {workoutTemplateId ? (
            <View style={styles.titleActions}>
              <TouchableOpacity style={styles.iconBtn} onPress={onToggleFavourite}>
                <Ionicons name={isFavourite ? 'bookmark' : 'bookmark-outline'} size={18} color={C.white} />
              </TouchableOpacity>
            </View>
          ) : null}
        </View>

        {workout.description ? (
          <Text style={styles.description}>{workout.description}</Text>
        ) : null}

        {/* Stats row */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{workout.exerciseCount}</Text>
            <Text style={styles.statLabel}>Ejercicios</Text>
          </View>
          {totalSeries > 0 && (
            <>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{totalSeries}</Text>
                <Text style={styles.statLabel}>Series totales</Text>
              </View>
            </>
          )}
          {workout.blocks.length > 1 && (
            <>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{workout.blocks.length}</Text>
                <Text style={styles.statLabel}>Bloques</Text>
              </View>
            </>
          )}
        </View>

        {/* Exercise list */}
        <View style={styles.exerciseList}>
          {workout.blocks.map((block) => (
            <View key={block.id}>
              {workout.blocks.length > 1 && block.title ? (
                <Text style={styles.blockTitle}>{block.title}</Text>
              ) : null}
              {block.exercises.map((ex) => {
                const seriesCount = getSeriesCount(ex.prescribed);
                const lastPerformance = formatLastPerformance(ex);
                return (
                  <View key={ex.id} style={styles.exerciseCard}>
                    <View style={styles.exerciseRow}>
                      <ExerciseThumbMem image={ex.image} />
                      <View style={styles.exerciseInfo}>
                        <Text style={styles.exerciseTitle} numberOfLines={2}>
                          {ex.title}
                        </Text>
                        <View style={styles.exerciseMetaRow}>
                          {seriesCount != null && (
                            <View style={styles.seriesChip}>
                              <Text style={styles.seriesChipText}>{seriesCount} series</Text>
                            </View>
                          )}
                          <Text style={styles.exerciseSubtitle} numberOfLines={1}>
                            {formatPrescribedSubtitle(ex.prescribed)}
                          </Text>
                        </View>
                      </View>
                    </View>
                    {lastPerformance && (
                      <View style={styles.lastPerformanceRow}>
                        <Ionicons name="time-outline" size={13} color={C.textSecondary} />
                        <Text style={styles.lastPerformanceText}>{lastPerformance}</Text>
                      </View>
                    )}
                    {ex.coachNotes ? (
                      <View style={styles.coachNoteRow}>
                        <Ionicons name="chatbubble-ellipses-outline" size={13} color={C.textSecondary} />
                        <Text style={styles.coachNoteText}>{ex.coachNotes}</Text>
                      </View>
                    ) : null}
                  </View>
                );
              })}
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
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.surface,
    borderRadius: 16,
    marginHorizontal: 20,
    marginTop: 20,
    paddingVertical: 14,
    ...SHADOW.card,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: {
    fontFamily: FONT.extraBold,
    fontSize: 20,
    color: C.textPrimary,
  },
  statLabel: {
    fontFamily: FONT.regular,
    fontSize: 11,
    color: C.textSecondary,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: C.border,
  },
  exerciseList: { paddingHorizontal: 20, marginTop: 24 },
  blockTitle: {
    fontFamily: FONT.bold,
    fontSize: 14,
    color: C.textSecondary,
    letterSpacing: 0.5,
    marginTop: 14,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  exerciseCard: {
    backgroundColor: C.surface,
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
    ...SHADOW.card,
  },
  exerciseRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  exerciseInfo: { flex: 1, marginLeft: 14 },
  exerciseTitle: {
    fontFamily: FONT.bold,
    fontSize: 15,
    color: C.textPrimary,
  },
  exerciseMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 8,
  },
  seriesChip: {
    backgroundColor: C.brand50,
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  seriesChipText: {
    fontFamily: FONT.bold,
    fontSize: 11,
    color: C.textPrimary,
  },
  exerciseSubtitle: {
    flex: 1,
    fontFamily: FONT.regular,
    fontSize: 13,
    color: C.textSecondary,
  },
  lastPerformanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
  lastPerformanceText: {
    fontFamily: FONT.medium,
    fontSize: 12,
    color: C.textSecondary,
  },
  coachNoteRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginTop: 6,
  },
  coachNoteText: {
    flex: 1,
    fontFamily: FONT.regular,
    fontSize: 12,
    color: C.textSecondary,
    lineHeight: 17,
    fontStyle: 'italic',
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

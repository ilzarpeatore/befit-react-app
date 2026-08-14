import React, { useEffect, useState, useCallback } from 'react';
import {
  StyleSheet,
  ScrollView,
  Image,
  Dimensions,
  Platform,
  StatusBar,
  Alert,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Box } from '@components/ui/box';
import { Text } from '@components/ui/text';
import { Pressable } from '@components/ui/pressable';
import { Icon } from '@components/ui/icon';
import { Spinner } from '@components/ui/spinner';
import { C, FONT, SHADOW } from './theme';
import { ExerciseThumbMem } from '../../components/ExerciseThumb';
import { workoutTemplateApi } from '../../api/workoutTemplate';
import { readinessApi, ReadinessValues } from '../../api/readiness';
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
  return `${parts.join(' × ')} · ${sets.length} ${sets.length === 1 ? 'serie' : 'series'}`;
}

// ═══════════════════════════ Readiness gate ═══════════════════════════
// Formulario diario obligatorio (salvo que el admin lo desactive para este
// cliente) que se rellena antes de ver el contenido del workout. Un
// registro por usuario/dia (backend: daily_readiness_checks).

const SLEEP_LABELS = ['Muy mal', 'Mal', 'Regular', 'Bien', 'Muy bien'];
const ENERGY_LABELS = ['Agotado', 'Bajo', 'Normal', 'Alto', 'Muy alto'];
const STRESS_LABELS = ['Muy relajado', 'Relajado', 'Normal', 'Estresado', 'Muy estresado'];

function ScaleRow({
  count,
  value,
  onChange,
  labels,
}: {
  count: number;
  value: number | null;
  onChange: (v: number) => void;
  labels?: string[];
}) {
  return (
    <Box style={rs.scaleRow}>
      {Array.from({ length: count }, (_, i) => i + 1).map((n) => (
        <Pressable
          key={n}
          style={[rs.scaleChip, value === n && rs.scaleChipActive]}
          onPress={() => onChange(n)}
        >
          <Text style={[rs.scaleChipText, value === n && rs.scaleChipTextActive]}>{n}</Text>
        </Pressable>
      ))}
      {labels && value ? <Text style={rs.scaleHint}>{labels[value - 1]}</Text> : null}
    </Box>
  );
}

function ReadinessForm({ onDone }: { onDone: () => void }) {
  const insets = useSafeAreaInsets();
  const [sleepQuality, setSleepQuality] = useState<number | null>(null);
  const [sorenessLevel, setSorenessLevel] = useState<number | null>(null);
  const [energyLevel, setEnergyLevel] = useState<number | null>(null);
  const [stressLevel, setStressLevel] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  const allAnswered = sleepQuality && sorenessLevel && energyLevel && stressLevel;

  const onSubmit = async () => {
    if (!allAnswered) return;
    setSaving(true);
    try {
      const values: ReadinessValues = {
        sleep_quality: sleepQuality!,
        soreness_level: sorenessLevel!,
        energy_level: energyLevel!,
        stress_level: stressLevel!,
      };
      await readinessApi.submit(values);
      onDone();
    } catch (e) {
      Alert.alert('Error', 'No se pudo guardar tu chequeo diario. Inténtalo de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={rs.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={[rs.scroll, { paddingTop: insets.top + 12 }]} showsVerticalScrollIndicator={false}>
        <Box style={rs.badge}>
          <Icon name="pulse-outline" size={22} color={C.textPrimary} />
        </Box>
        <Text style={rs.title}>¿Cómo llegas hoy?</Text>
        <Text style={rs.subtitle}>
          Responde antes de empezar — ayuda a tu coach a ajustar tu entrenamiento a cómo te sientes de verdad.
        </Text>

        <Box style={rs.card}>
          <Text style={rs.question}>Valora tu descanso nocturno</Text>
          <ScaleRow count={5} value={sleepQuality} onChange={setSleepQuality} labels={SLEEP_LABELS} />
        </Box>

        <Box style={rs.card}>
          <Text style={rs.question}>Nivel de agujetas</Text>
          <Text style={rs.questionHint}>1 = ninguna · 10 = muy intensas</Text>
          <ScaleRow count={10} value={sorenessLevel} onChange={setSorenessLevel} />
        </Box>

        <Box style={rs.card}>
          <Text style={rs.question}>Nivel de energía</Text>
          <ScaleRow count={5} value={energyLevel} onChange={setEnergyLevel} labels={ENERGY_LABELS} />
        </Box>

        <Box style={rs.card}>
          <Text style={rs.question}>Nivel de estrés mental</Text>
          <ScaleRow count={5} value={stressLevel} onChange={setStressLevel} labels={STRESS_LABELS} />
        </Box>
      </ScrollView>

      <Box style={[rs.footer, { paddingBottom: Math.max(insets.bottom, 12) + 6 }]}>
        <Pressable
          style={[rs.submitBtn, !allAnswered && rs.submitBtnDisabled]}
          onPress={onSubmit}
          disabled={!allAnswered || saving}
        >
          {saving ? (
            <Spinner size="small" color="#FFFFFF" />
          ) : (
            <Text style={rs.submitBtnText}>CONTINUAR AL ENTRENAMIENTO</Text>
          )}
        </Pressable>
      </Box>
    </SafeAreaView>
  );
}

// ═══════════════════════════ Preview screen ═══════════════════════════

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
  const [expandedNoteId, setExpandedNoteId] = useState<number | null>(null);

  const [readinessResolved, setReadinessResolved] = useState(false);
  const [readinessNeeded, setReadinessNeeded] = useState(false);

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
    readinessApi
      .getToday()
      .then((res) => {
        const { required, submitted_today } = res.data.data;
        setReadinessNeeded(required && !submitted_today);
      })
      .catch(() => {
        // Si el chequeo de readiness falla (red, etc.) no bloqueamos el
        // entrenamiento - mejor dejar entrenar que dejar a alguien atascado.
        setReadinessNeeded(false);
      })
      .finally(() => setReadinessResolved(true));
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

  if (!readinessResolved || isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <Box style={styles.loader}>
          <Spinner size="large" color={C.textPrimary} />
        </Box>
      </SafeAreaView>
    );
  }

  if (readinessNeeded) {
    return <ReadinessForm onDone={() => setReadinessNeeded(false)} />;
  }

  if (error || !workout) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <Pressable style={styles.backBtnStatic} onPress={() => navigation?.goBack()}>
          <Icon name="chevron-back" size={22} color={C.textPrimary} />
        </Pressable>
        <Box style={styles.loader}>
          <Text style={styles.emptyText}>No se pudo cargar el entrenamiento.</Text>
        </Box>
      </SafeAreaView>
    );
  }

  if (workout.isRest || workout.isAdjusted) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <Pressable style={styles.backBtnStatic} onPress={() => navigation?.goBack()}>
          <Icon name="chevron-back" size={22} color={C.textPrimary} />
        </Pressable>
        <Box style={styles.loader}>
          <Icon name="moon-outline" size={40} color={C.textSecondary} />
          <Text style={[styles.emptyText, { marginTop: 12 }]}>
            {workout.isAdjusted ? 'Sesión ajustada por tu entrenador' : 'Día de descanso'}
          </Text>
        </Box>
      </SafeAreaView>
    );
  }

  if (workout.isExclusive && !workout.isAccessible) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <Pressable style={styles.backBtnStatic} onPress={() => navigation?.goBack()}>
          <Icon name="chevron-back" size={22} color={C.textPrimary} />
        </Pressable>
        <Box style={styles.loader}>
          <Icon name="lock-closed-outline" size={40} color={C.textSecondary} />
          <Text style={[styles.title, { textAlign: 'center', marginTop: 16 }]}>{workout.title}</Text>
          <Text style={[styles.emptyText, { marginTop: 8 }]}>
            Contenido exclusivo — hazte cliente 1:1 o compra un paquete con acceso completo a Workouts.
          </Text>
        </Box>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 170 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header image */}
        <Box style={styles.heroSection}>
          {workout.thumbnail ? (
            <Image source={{ uri: workout.thumbnail }} style={styles.heroImage} resizeMode="cover" />
          ) : (
            <LinearGradient
              colors={[C.gray20, C.surface]}
              style={[styles.heroImage, styles.heroFallback]}
            >
              <Icon name="barbell-outline" size={64} color={C.gray30} />
            </LinearGradient>
          )}
          <LinearGradient
            colors={['rgba(0,0,0,0.35)', 'rgba(0,0,0,0)']}
            style={styles.heroTopFade}
          />
          <Pressable style={styles.backBtn} onPress={() => navigation?.goBack()}>
            <Icon name="chevron-back" size={22} color="#FFFFFF" />
          </Pressable>
        </Box>

        {/* Title row — sin numberOfLines: es el título de la propia pantalla
            (dentro de un ScrollView con espacio de sobra), así que se deja
            envolver en tantas líneas como haga falta en vez de cortarlo con
            "..." cuando el nombre del workout es largo. */}
        <Box style={styles.titleRow}>
          <Text style={styles.title}>
            {workout.title}
          </Text>
          {workoutTemplateId ? (
            <Box style={styles.titleActions}>
              <Pressable style={styles.iconBtn} onPress={onToggleFavourite}>
                <Icon name={isFavourite ? 'bookmark' : 'bookmark-outline'} size={18} color={isFavourite ? C.accentBlack : C.textPrimary} />
              </Pressable>
            </Box>
          ) : null}
        </Box>

        {workout.description ? (
          <Text style={styles.description}>{workout.description}</Text>
        ) : null}

        {/* Stats row */}
        <Box style={styles.statsRow}>
          <Box style={styles.statItem}>
            <Text style={styles.statValue}>{workout.exerciseCount}</Text>
            <Text style={styles.statLabel}>Ejercicios</Text>
          </Box>
          {totalSeries > 0 && (
            <>
              <Box style={styles.statDivider} />
              <Box style={styles.statItem}>
                <Text style={styles.statValue}>{totalSeries}</Text>
                <Text style={styles.statLabel}>Series totales</Text>
              </Box>
            </>
          )}
          {workout.blocks.length > 1 && (
            <>
              <Box style={styles.statDivider} />
              <Box style={styles.statItem}>
                <Text style={styles.statValue}>{workout.blocks.length}</Text>
                <Text style={styles.statLabel}>Bloques</Text>
              </Box>
            </>
          )}
        </Box>

        {/* Exercise list */}
        <Box style={styles.exerciseList}>
          {workout.blocks.map((block) => (
            <Box key={block.id}>
              {workout.blocks.length > 1 && block.title ? (
                <Text style={styles.blockTitle}>{block.title}</Text>
              ) : null}
              {block.exercises.map((ex) => {
                const seriesCount = getSeriesCount(ex.prescribed);
                const lastPerformance = formatLastPerformance(ex);
                const noteExpanded = expandedNoteId === ex.id;
                return (
                  <Box key={ex.id} style={styles.exerciseCard}>
                    <Box style={styles.exerciseRow}>
                      <ExerciseThumbMem image={ex.image} bodyPartId={ex.bodyPartId} />
                      <Box style={styles.exerciseInfo}>
                        <Text style={styles.exerciseTitle} numberOfLines={2}>
                          {ex.title}
                        </Text>
                        <Box style={styles.exerciseMetaRow}>
                          {seriesCount != null && (
                            <Box style={styles.seriesChip}>
                              <Text style={styles.seriesChipText}>{seriesCount} series</Text>
                            </Box>
                          )}
                          <Text style={styles.exerciseSubtitle} numberOfLines={1}>
                            {formatPrescribedSubtitle(ex.prescribed)}
                          </Text>
                        </Box>
                      </Box>
                    </Box>

                    {lastPerformance && (
                      <Box style={styles.lastPerformanceRow}>
                        <Box style={styles.lastPerformanceIconWrap}>
                          <Icon name="time-outline" size={13} color={C.blue60} />
                        </Box>
                        <Text style={styles.lastPerformanceLabel}>Última vez</Text>
                        <Text style={styles.lastPerformanceText}>{lastPerformance}</Text>
                      </Box>
                    )}

                    {ex.coachNotes ? (
                      <Pressable
                        style={styles.coachNoteBanner}
                        onPress={() => setExpandedNoteId(noteExpanded ? null : ex.id)}
                      >
                        <Box style={styles.coachNoteHeaderRow}>
                          <Icon name="warning-outline" size={15} color={C.warning60} />
                          <Text style={styles.coachNoteHeaderText}>Revisa las notas de este ejercicio</Text>
                          <Icon
                            name={noteExpanded ? 'chevron-up' : 'chevron-down'}
                            size={15}
                            color={C.warning60}
                          />
                        </Box>
                        {noteExpanded ? <Text style={styles.coachNoteBody}>{ex.coachNotes}</Text> : null}
                      </Pressable>
                    ) : null}
                  </Box>
                );
              })}
            </Box>
          ))}
        </Box>
      </ScrollView>

      {/* Sticky start button */}
      <Box style={[styles.stickyFooter, { paddingBottom: Math.max(insets.bottom, 12) + 6 }]}>
        <Pressable style={styles.startBtn} onPress={onStart}>
          <Text style={styles.startBtnText}>INICIAR ENTRENAMIENTO</Text>
        </Pressable>
      </Box>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  loader: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { fontFamily: FONT.regular, fontSize: 15, color: C.textSecondary, textAlign: 'center', paddingHorizontal: 24 },
  heroSection: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.38,
  },
  heroImage: { width: '100%', height: '100%' },
  heroFallback: { alignItems: 'center', justifyContent: 'center' },
  heroTopFade: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 90,
  },
  backBtn: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 40,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.35)',
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
    ...SHADOW.card,
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
    fontSize: 24,
    color: C.textPrimary,
    marginRight: 12,
  },
  titleActions: { flexDirection: 'row', gap: 10 },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: C.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOW.card,
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
    borderRadius: 20,
    marginHorizontal: 20,
    marginTop: 20,
    paddingVertical: 16,
    ...SHADOW.card,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: {
    fontFamily: FONT.extraBold,
    fontSize: 21,
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
    borderRadius: 20,
    padding: 14,
    marginBottom: 12,
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
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
  lastPerformanceIconWrap: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: C.blue5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lastPerformanceLabel: {
    fontFamily: FONT.bold,
    fontSize: 11,
    color: C.blue60,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  lastPerformanceText: {
    fontFamily: FONT.medium,
    fontSize: 12,
    color: C.textSecondary,
    flex: 1,
  },
  coachNoteBanner: {
    marginTop: 10,
    backgroundColor: C.warning5,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  coachNoteHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  coachNoteHeaderText: {
    flex: 1,
    fontFamily: FONT.bold,
    fontSize: 12,
    color: C.warning60,
  },
  coachNoteBody: {
    marginTop: 6,
    fontFamily: FONT.regular,
    fontSize: 12.5,
    color: C.textSecondary,
    lineHeight: 18,
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
    backgroundColor: C.accentBlack,
    borderRadius: 30,
    paddingVertical: 16,
    alignItems: 'center',
  },
  startBtnText: {
    fontFamily: FONT.bold,
    fontSize: 15,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
});

const rs = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  scroll: { paddingHorizontal: 24, paddingBottom: 24 },
  badge: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: C.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    ...SHADOW.card,
  },
  title: {
    fontFamily: FONT.extraBold,
    fontSize: 24,
    color: C.textPrimary,
  },
  subtitle: {
    fontFamily: FONT.regular,
    fontSize: 13.5,
    color: C.textSecondary,
    marginTop: 6,
    lineHeight: 19,
    marginBottom: 24,
  },
  card: {
    backgroundColor: C.surface,
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
    ...SHADOW.card,
  },
  question: {
    fontFamily: FONT.bold,
    fontSize: 15,
    color: C.textPrimary,
  },
  questionHint: {
    fontFamily: FONT.regular,
    fontSize: 11.5,
    color: C.textSecondary,
    marginTop: 2,
    marginBottom: 4,
  },
  scaleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
    alignItems: 'center',
  },
  scaleChip: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: C.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scaleChipActive: {
    backgroundColor: C.accentBlack,
  },
  scaleChipText: {
    fontFamily: FONT.bold,
    fontSize: 13,
    color: C.textSecondary,
  },
  scaleChipTextActive: {
    color: '#FFFFFF',
  },
  scaleHint: {
    width: '100%',
    marginTop: 6,
    fontFamily: FONT.medium,
    fontSize: 12.5,
    color: C.textSecondary,
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 12,
    backgroundColor: C.bg,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
  submitBtn: {
    backgroundColor: C.accentBlack,
    borderRadius: 30,
    paddingVertical: 16,
    alignItems: 'center',
  },
  submitBtnDisabled: {
    opacity: 0.35,
  },
  submitBtnText: {
    fontFamily: FONT.bold,
    fontSize: 15,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
});

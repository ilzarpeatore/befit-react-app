import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { C, FONT } from './theme';
import { ExerciseThumbMem } from '../../components/ExerciseThumb';
import { workoutHistoryApi } from '../../api/workoutHistory';
import { MetricCatalogItem } from '../../api/workoutTemplate';
import {
  fetchUnifiedWorkout,
  formatPrescribedSubtitle,
  getMetricsCatalog,
  UnifiedExercise,
} from './workoutViewShared';

interface Props {
  navigation?: any;
  route?: any;
}

interface SetRow {
  values: Record<string, string>;
  completed: boolean;
}

interface SessionExercise extends UnifiedExercise {
  rows: SetRow[];
  note: string;
}

function buildDefaultRow(prescribed: Record<string, any>, enabledMetrics: string[]): SetRow {
  const values: Record<string, string> = {};
  enabledMetrics.forEach((key) => {
    if (prescribed?.[key] != null) values[key] = String(prescribed[key]);
  });
  return { values, completed: false };
}

function buildInitialRows(prescribed: Record<string, any>, enabledMetrics: string[]): SetRow[] {
  const count = Number(prescribed?.series) || 1;
  return Array.from({ length: count }, () => buildDefaultRow(prescribed, enabledMetrics));
}

function formatTimer(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
  const s = Math.floor(totalSeconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export default function WorkoutSessionScreen(props: Props) {
  const { navigation, route } = props;
  const programDayAssignmentId: number | undefined = route?.params?.programDayAssignmentId;
  const workoutTemplateId: number | undefined = route?.params?.workoutTemplateId;
  const mTitle: string | undefined = route?.params?.mTitle;

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [exercises, setExercises] = useState<SessionExercise[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [metricsCatalog, setMetricsCatalog] = useState<MetricCatalogItem[]>([]);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    timerRef.current = setInterval(() => setElapsedSeconds((s) => s + 1), 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(false);
    try {
      const [data, catalog] = await Promise.all([
        fetchUnifiedWorkout({ programDayAssignmentId, workoutTemplateId, fallbackTitle: mTitle }),
        getMetricsCatalog(),
      ]);
      setMetricsCatalog(catalog);
      const flat: SessionExercise[] = data.blocks.flatMap((b) =>
        b.exercises.map((ex) => ({
          ...ex,
          rows: buildInitialRows(ex.prescribed, ex.enabledMetrics),
          note: '',
        }))
      );
      setExercises(flat);
      setActiveIndex(0);
    } catch (e) {
      setError(true);
    } finally {
      setIsLoading(false);
    }
  }, [programDayAssignmentId, workoutTemplateId, mTitle]);

  useEffect(() => {
    load();
  }, [load]);

  const metricLabel = useCallback(
    (key: string) => {
      const m = metricsCatalog.find((c) => c.key === key);
      if (!m) return key;
      return m.unit ? `${m.label} (${m.unit})` : m.label;
    },
    [metricsCatalog]
  );

  const metricInputType = useCallback(
    (key: string): 'number' | 'text' | 'time' => {
      const m = metricsCatalog.find((c) => c.key === key);
      return (m?.input_type as any) || 'number';
    },
    [metricsCatalog]
  );

  const volumeKg = useMemo(() => {
    let total = 0;
    exercises.forEach((ex) => {
      ex.rows.forEach((row) => {
        if (!row.completed) return;
        const carga = parseFloat(row.values.carga);
        const reps = parseFloat(row.values.reps);
        if (!isNaN(carga) && !isNaN(reps)) total += carga * reps;
      });
    });
    return Math.round(total);
  }, [exercises]);

  const syncExerciseLog = useCallback(
    (ex: SessionExercise) => {
      const loggedSets = ex.rows
        .filter((r) => r.completed)
        .map((r) => {
          const clean: Record<string, any> = {};
          ex.enabledMetrics.forEach((key) => {
            if (r.values[key] != null && r.values[key] !== '') clean[key] = r.values[key];
          });
          return clean;
        });
      if (loggedSets.length === 0) return;
      workoutHistoryApi
        .logCalendarSets({
          workout_template_exercise_id: ex.id,
          logged_sets: loggedSets,
          program_day_assignment_id: programDayAssignmentId ?? null,
        })
        .catch(() => {});
    },
    [programDayAssignmentId]
  );

  const updateExercise = (index: number, updater: (ex: SessionExercise) => SessionExercise) => {
    setExercises((prev) => {
      const next = [...prev];
      next[index] = updater(next[index]);
      return next;
    });
  };

  const setCellValue = (exIndex: number, rowIndex: number, key: string, value: string) => {
    updateExercise(exIndex, (ex) => {
      const rows = [...ex.rows];
      rows[rowIndex] = { ...rows[rowIndex], values: { ...rows[rowIndex].values, [key]: value } };
      return { ...ex, rows };
    });
  };

  const toggleRowComplete = (exIndex: number, rowIndex: number) => {
    setExercises((prev) => {
      const next = [...prev];
      const ex = { ...next[exIndex] };
      const rows = [...ex.rows];
      rows[rowIndex] = { ...rows[rowIndex], completed: !rows[rowIndex].completed };
      ex.rows = rows;
      next[exIndex] = ex;
      syncExerciseLog(ex);
      return next;
    });
  };

  const addRow = (exIndex: number) => {
    updateExercise(exIndex, (ex) => {
      const last = ex.rows[ex.rows.length - 1];
      const values = last ? { ...last.values } : {};
      return { ...ex, rows: [...ex.rows, { values, completed: false }] };
    });
  };

  const markAllRows = (exIndex: number) => {
    setExercises((prev) => {
      const next = [...prev];
      const ex = { ...next[exIndex] };
      ex.rows = ex.rows.map((r) => ({ ...r, completed: true }));
      next[exIndex] = ex;
      syncExerciseLog(ex);
      return next;
    });
  };

  const onFinish = () => {
    Alert.alert(
      'Finalizar entrenamiento',
      '¿Seguro que quieres finalizar y salir de esta sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Finalizar',
          style: 'destructive',
          onPress: () => {
            if (typeof navigation?.pop === 'function') {
              navigation.pop(2);
            } else {
              navigation?.goBack();
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={C.textPrimary} />
        </View>
      </SafeAreaView>
    );
  }

  if (error || exercises.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation?.goBack()}>
            <Ionicons name="close" size={26} color={C.white} />
          </TouchableOpacity>
        </View>
        <View style={styles.loader}>
          <Text style={styles.emptyText}>No se pudo cargar el entrenamiento.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const active = exercises[activeIndex];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 80 }} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation?.goBack()}>
            <Ionicons name="close" size={26} color={C.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {mTitle || 'Entrenamiento'}
          </Text>
          <TouchableOpacity>
            <Ionicons name="ellipsis-vertical" size={22} color={C.white} />
          </TouchableOpacity>
        </View>

        {/* Live stats */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <View style={styles.statTop}>
              <View style={styles.liveDot} />
              <Text style={styles.statValue}>{formatTimer(elapsedSeconds)}</Text>
            </View>
            <Text style={styles.statLabel}>Duración</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>Calorías</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{volumeKg}</Text>
            <Text style={styles.statLabel}>Volumen (kg)</Text>
          </View>
        </View>

        {/* Count + add */}
        <View style={styles.countRow}>
          <Text style={styles.countText}>{exercises.length} EJERCICIOS</Text>
          <TouchableOpacity
            onPress={() =>
              Alert.alert('Añadir ejercicio', 'Esta función todavía no está disponible.')
            }
          >
            <Text style={styles.addExerciseText}>Añadir ejercicio +</Text>
          </TouchableOpacity>
        </View>

        {/* Active exercise */}
        {active && (
          <View style={styles.activeCard}>
            <View style={styles.activeHeaderRow}>
              <ExerciseThumbMem image={active.image} size={56} />
              <View style={styles.activeInfo}>
                <Text style={styles.activeTitle} numberOfLines={2}>
                  {active.title}
                </Text>
                <Text style={styles.activeSubtitle}>
                  {formatPrescribedSubtitle(active.prescribed)}
                </Text>
              </View>
              <TouchableOpacity>
                <Ionicons name="ellipsis-vertical" size={20} color={C.textSecondary} />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.noteInput}
              placeholder="Añadir nota..."
              placeholderTextColor={C.textSecondary}
              value={active.note}
              onChangeText={(t) => updateExercise(activeIndex, (ex) => ({ ...ex, note: t }))}
            />

            {/* Dynamic sets table */}
            <View style={styles.table}>
              <View style={styles.tableHeaderRow}>
                <Text style={[styles.tableHeaderCell, styles.serieCol]}>#</Text>
                {active.enabledMetrics.map((key) => (
                  <Text key={key} style={[styles.tableHeaderCell, styles.metricCol]}>
                    {metricLabel(key)}
                  </Text>
                ))}
                <View style={styles.checkCol} />
              </View>

              {active.rows.map((row, rowIdx) => (
                <View key={rowIdx} style={styles.tableRow}>
                  <Text style={[styles.tableCellText, styles.serieCol]}>{rowIdx + 1}</Text>
                  {active.enabledMetrics.map((key) => (
                    <TextInput
                      key={key}
                      style={[styles.tableInput, styles.metricCol]}
                      value={row.values[key] ?? ''}
                      onChangeText={(t) => setCellValue(activeIndex, rowIdx, key, t)}
                      keyboardType={metricInputType(key) === 'number' ? 'numeric' : 'default'}
                      placeholder="-"
                      placeholderTextColor={C.textSecondary}
                    />
                  ))}
                  <TouchableOpacity
                    style={styles.checkCol}
                    onPress={() => toggleRowComplete(activeIndex, rowIdx)}
                  >
                    <Ionicons
                      name={row.completed ? 'checkmark-circle' : 'checkmark-circle-outline'}
                      size={26}
                      color={row.completed ? C.success : C.textSecondary}
                    />
                  </TouchableOpacity>
                </View>
              ))}
            </View>

            <TouchableOpacity style={styles.finishBtn} activeOpacity={0.85} onPress={onFinish}>
              <Text style={styles.finishBtnText}>✓ FINALIZAR ENTRENAMIENTO</Text>
            </TouchableOpacity>

            <View style={styles.rowActions}>
              <TouchableOpacity onPress={() => addRow(activeIndex)}>
                <Text style={styles.rowActionText}>+ AÑADIR SERIE</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.rowActionRight}
                onPress={() => markAllRows(activeIndex)}
              >
                <Ionicons name="checkmark-done" size={16} color={C.textPrimary} />
                <Text style={styles.rowActionText}>MARCAR TODAS LAS SERIES</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Accordion: remaining exercises */}
        {exercises.length > 1 && <View style={styles.separator} />}
        {exercises.map((ex, idx) =>
          idx === activeIndex ? null : (
            <TouchableOpacity
              key={ex.id}
              style={styles.collapsedRow}
              activeOpacity={0.7}
              onPress={() => setActiveIndex(idx)}
            >
              <ExerciseThumbMem image={ex.image} size={48} />
              <View style={styles.collapsedInfo}>
                <Text style={styles.collapsedTitle} numberOfLines={2}>
                  {ex.title}
                </Text>
                <Text style={styles.collapsedSubtitle}>
                  {formatPrescribedSubtitle(ex.prescribed)}
                </Text>
              </View>
              <TouchableOpacity>
                <Ionicons name="ellipsis-vertical" size={18} color={C.textSecondary} />
              </TouchableOpacity>
            </TouchableOpacity>
          )
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  loader: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { fontFamily: FONT.regular, fontSize: 15, color: C.textSecondary, textAlign: 'center', paddingHorizontal: 24 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 12 : 16,
    paddingBottom: 12,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontFamily: FONT.bold,
    fontSize: 16,
    color: C.white,
    marginHorizontal: 12,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statTop: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: C.success },
  statValue: { fontFamily: FONT.bold, fontSize: 17, color: C.white },
  statLabel: { fontFamily: FONT.regular, fontSize: 12, color: C.textSecondary, marginTop: 4 },
  countRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  countText: { fontFamily: FONT.bold, fontSize: 13, color: C.textSecondary, letterSpacing: 0.5 },
  addExerciseText: { fontFamily: FONT.semiBold, fontSize: 13, color: C.textPrimary },
  activeCard: {
    marginHorizontal: 16,
    backgroundColor: C.surfaceLight,
    borderRadius: 16,
    padding: 16,
  },
  activeHeaderRow: { flexDirection: 'row', alignItems: 'center' },
  activeInfo: { flex: 1, marginLeft: 12 },
  activeTitle: { fontFamily: FONT.bold, fontSize: 16, color: C.white },
  activeSubtitle: { fontFamily: FONT.regular, fontSize: 13, color: C.textSecondary, marginTop: 4 },
  noteInput: {
    marginTop: 14,
    backgroundColor: C.surface,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontFamily: FONT.regular,
    fontSize: 13,
    color: C.white,
  },
  table: { marginTop: 16 },
  tableHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  tableHeaderCell: {
    fontFamily: FONT.semiBold,
    fontSize: 11,
    color: C.textSecondary,
    textAlign: 'center',
  },
  tableRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  tableCellText: {
    fontFamily: FONT.medium,
    fontSize: 13,
    color: C.white,
    textAlign: 'center',
  },
  tableInput: {
    backgroundColor: C.surface,
    borderRadius: 8,
    paddingVertical: 8,
    marginHorizontal: 3,
    fontFamily: FONT.regular,
    fontSize: 13,
    color: C.white,
    textAlign: 'center',
  },
  serieCol: { width: 26 },
  metricCol: { flex: 1 },
  checkCol: { width: 34, alignItems: 'center' },
  finishBtn: {
    marginTop: 18,
    backgroundColor: C.brand50,
    borderRadius: 30,
    paddingVertical: 15,
    alignItems: 'center',
  },
  finishBtnText: { fontFamily: FONT.bold, fontSize: 14, color: C.white, letterSpacing: 0.5 },
  rowActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
  },
  rowActionRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  rowActionText: { fontFamily: FONT.semiBold, fontSize: 12, color: C.textPrimary },
  separator: {
    height: 1,
    backgroundColor: C.border,
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 8,
  },
  collapsedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  collapsedInfo: { flex: 1, marginLeft: 12 },
  collapsedTitle: { fontFamily: FONT.semiBold, fontSize: 14, color: C.white },
  collapsedSubtitle: { fontFamily: FONT.regular, fontSize: 12, color: C.textSecondary, marginTop: 3 },
});

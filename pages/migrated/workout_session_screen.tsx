import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Platform,
  Modal,
  FlatList,
  Image,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { C, FONT } from './theme';
import { ExerciseThumbMem } from '../../components/ExerciseThumb';
import { ConfirmDialogMem } from '../../components/ConfirmDialog';
import PainReportSheet from '../../components/PainReportSheet';
import { useAuth } from '../../store/AuthContext';
import { workoutHistoryApi } from '../../api/workoutHistory';
import { MetricCatalogItem } from '../../api/workoutTemplate';
import { exercisesApi, ExerciseItem, BodyPartItem } from '../../api/exercises';
import { loadSuggestionApi, pickPendingSuggestion, LoadSuggestion } from '../../api/loadSuggestion';
import {
  fetchUnifiedWorkout,
  formatPrescribedSubtitle,
  getMetricsCatalog,
  UnifiedExercise,
} from './workoutViewShared';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const ADHOC_DEFAULT_METRICS = ['carga', 'reps'];
const RESISTANCE_TRAINING_MET = 5.0;
const FALLBACK_WEIGHT_KG = 70;
// Sesion activa sin guardar (punto 3/4/5 del encargo): se persiste el
// timestamp real de inicio + el estado de las series/notas en curso, para
// que 1) la duracion mostrada nunca se "pause" por bloqueo de pantalla o
// segundo plano (siempre se calcula como Date.now() - startedAt, nunca
// acumulando en JS) y 2) si la app se cierra sin finalizar el
// entrenamiento, al reabrir esta misma pantalla (mismo
// programDayAssignmentId/workoutTemplateId) se retome tal cual se dejo, sin
// limite de dias. Solo se trackea UNA sesion activa a la vez (slot unico) -
// si el cliente abre un workout distinto mientras otro quedo sin cerrar, el
// nuevo pisa al viejo (simplificacion deliberada, ver resumen de la tarea).
const ACTIVE_SESSION_STORAGE_KEY = '@befit/active_workout_session';

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
  // true para ejercicios anadidos con "Anadir ejercicio +" - no tienen
  // workout_template_exercise_id real (no forman parte de la plantilla
  // del coach), se identifican y guardan por exerciseId directamente.
  isAdhoc?: boolean;
}

interface SessionBlock {
  id: number;
  title: string;
  exercises: SessionExercise[];
}

interface PersistedSession {
  identityKey: string;
  startedAt: number;
  blocks: SessionBlock[];
  activeIndexByBlock: Record<number, number>;
}

/**
 * Superpone sobre los bloques recien cargados del servidor (fuente de
 * verdad para prescribed/coachNotes/lastPerformance, que pueden haber
 * cambiado) las filas/nota en curso que el cliente ya habia rellenado en la
 * sesion persistida — y reinyecta los ejercicios "Anadir ejercicio +"
 * (isAdhoc) de la sesion persistida, que nunca van a volver del servidor
 * porque no son parte de la plantilla del coach.
 */
function mergePersistedBlocks(freshBlocks: SessionBlock[], persistedBlocks: SessionBlock[]): SessionBlock[] {
  const persistedById = new Map<number, SessionExercise>();
  const persistedAdhocByBlock = new Map<number, SessionExercise[]>();
  persistedBlocks.forEach((b, bIdx) => {
    b.exercises.forEach((ex) => {
      persistedById.set(ex.id, ex);
      if (ex.isAdhoc) {
        const list = persistedAdhocByBlock.get(bIdx) ?? [];
        list.push(ex);
        persistedAdhocByBlock.set(bIdx, list);
      }
    });
  });

  return freshBlocks.map((block, bIdx) => {
    const exercises = block.exercises.map((ex) => {
      const prev = persistedById.get(ex.id);
      if (!prev) return ex;
      return { ...ex, rows: prev.rows, note: prev.note };
    });
    const seenIds = new Set(exercises.map((e) => e.id));
    const extraAdhoc = (persistedAdhocByBlock.get(bIdx) ?? []).filter((ex) => !seenIds.has(ex.id));
    return { ...block, exercises: [...exercises, ...extraAdhoc] };
  });
}

// Cada fila se rellena con lo que el cliente hizo REALMENTE la ultima vez
// (serie por serie, ej. 20/25/30/40 kg) en vez del objetivo marcado por el
// coach - asi el cliente ve y edita desde su progreso real, no desde cero.
// El numero de filas sigue el plan actual (prescribed.series), no el numero
// de series de la ultima sesion. El objetivo del coach (prescribed) se
// muestra aparte, como referencia, en la propia celda (ver renderizado).
function buildInitialRows(ex: UnifiedExercise): SetRow[] {
  const count = Number(ex.prescribed?.series) || 1;
  const lastSets = ex.lastPerformance?.sets ?? [];
  return Array.from({ length: count }, (_, i) => {
    const lastSet = lastSets[i];
    const values: Record<string, string> = {};
    ex.enabledMetrics.forEach((key) => {
      if (lastSet && lastSet[key] != null && lastSet[key] !== '') {
        values[key] = String(lastSet[key]);
      } else if (ex.prescribed?.[key] != null) {
        values[key] = String(ex.prescribed[key]);
      }
    });
    return { values, completed: false };
  });
}

function formatTimer(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
  const s = Math.floor(totalSeconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export default function WorkoutSessionScreen(props: Props) {
  const { navigation, route } = props;
  const { state } = useAuth();
  const insets = useSafeAreaInsets();
  const programDayAssignmentId: number | undefined = route?.params?.programDayAssignmentId;
  const workoutTemplateId: number | undefined = route?.params?.workoutTemplateId;
  const mTitle: string | undefined = route?.params?.mTitle;

  // Misma fuente de verdad que ya usan logSets()/finishSession() en el
  // backend para identificar esta sesion: program_day_assignment_id por
  // defecto, o workout_template_id (workout suelto sin programa) cuando no
  // hay asignacion de programa - usado para POST /sessions/{id}/pain-report.
  const painReportSessionId = programDayAssignmentId ?? workoutTemplateId;
  const painReportIsWorkoutTemplate = programDayAssignmentId == null && workoutTemplateId != null;

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [blocks, setBlocks] = useState<SessionBlock[]>([]);
  const [activeIndexByBlock, setActiveIndexByBlock] = useState<Record<number, number>>({});
  const [pageIndex, setPageIndex] = useState(0);
  const [metricsCatalog, setMetricsCatalog] = useState<MetricCatalogItem[]>([]);
  const [isPickerVisible, setIsPickerVisible] = useState(false);
  const [pickerQuery, setPickerQuery] = useState('');
  const [pickerResults, setPickerResults] = useState<ExerciseItem[]>([]);
  const [pickerLoading, setPickerLoading] = useState(false);
  const [pickerLoadingMore, setPickerLoadingMore] = useState(false);
  const [pickerPage, setPickerPage] = useState(1);
  const [pickerIsLastPage, setPickerIsLastPage] = useState(false);
  const [bodyParts, setBodyParts] = useState<BodyPartItem[]>([]);
  const [selectedBodyPartId, setSelectedBodyPartId] = useState<number | null>(null);
  const [closeConfirmVisible, setCloseConfirmVisible] = useState(false);
  const [emptyFinishConfirmVisible, setEmptyFinishConfirmVisible] = useState(false);
  const [painReportTarget, setPainReportTarget] = useState<SessionExercise | null>(null);
  // Motor de Auto-Regulacion: sugerencia de carga PENDIENTE (aun no
  // aprobada por el coach) por exerciseId, cargada bajo demanda solo para
  // el ejercicio activo/expandido (ver fetchLoadSuggestion). Las ya
  // aplicadas/aprobadas NO necesitan esto -- llegan directas en
  // ex.prescribed porque el backend ya las fusiona (ClientExerciseOverride).
  const [pendingLoadSuggestions, setPendingLoadSuggestions] = useState<Record<number, LoadSuggestion>>({});
  const requestedSuggestionsRef = useRef<Set<number>>(new Set());

  // Timestamp real de inicio de sesion (Date.now()), NUNCA un contador
  // incremental en JS -- ver comentario del punto 3 mas abajo. Se
  // sobreescribe con el valor persistido (si lo hay) en cuanto se resuelve
  // la carga inicial desde AsyncStorage.
  const [sessionStartedAt, setSessionStartedAt] = useState<number>(() => Date.now());
  const [nowTick, setNowTick] = useState<number>(() => Date.now());
  const pagerRef = useRef<FlatList>(null);

  const identityKey = useMemo(() => {
    if (programDayAssignmentId != null) return `pda:${programDayAssignmentId}`;
    if (workoutTemplateId != null) return `wt:${workoutTemplateId}`;
    return null;
  }, [programDayAssignmentId, workoutTemplateId]);

  // Punto 3: "el tiempo no debe pausarse cuando se bloquea la pantalla o la
  // app pasa a segundo plano". Un setInterval que hace +1 se para/desfasa
  // cuando el hilo JS se suspende. En vez de acumular, esto solo fuerza un
  // re-render cada segundo (nowTick) y el tiempo real se recalcula siempre
  // como Date.now() - sessionStartedAt -- en cuanto la app vuelve a primer
  // plano y el intervalo retoma, el siguiente tick ya muestra la duracion
  // correcta sin importar cuanto tiempo estuvo suspendida.
  useEffect(() => {
    const id = setInterval(() => setNowTick(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const elapsedSeconds = Math.max(0, Math.floor((nowTick - sessionStartedAt) / 1000));

  // Peso real del perfil (si existe) para el estimado de calorias en vivo -
  // el valor final/autoritativo se calcula en el backend con el mismo MET
  // al cerrar sesion (finishSession), esto es solo para el contador en vivo.
  const weightKg = useMemo(() => {
    const profile = state.user?.user_profile;
    const raw = profile?.weight ? parseFloat(profile.weight) : NaN;
    if (!Number.isFinite(raw) || raw <= 0) return FALLBACK_WEIGHT_KG;
    return profile?.weight_unit === 'lbs' ? raw * 0.453592 : raw;
  }, [state.user]);

  const liveCalories = Math.round(RESISTANCE_TRAINING_MET * weightKg * (elapsedSeconds / 3600));

  const clearPersistedSession = useCallback(() => {
    AsyncStorage.removeItem(ACTIVE_SESSION_STORAGE_KEY).catch(() => {});
  }, []);

  const load = useCallback(
    async (persisted?: PersistedSession | null) => {
      setIsLoading(true);
      setError(false);
      try {
        const [data, catalog] = await Promise.all([
          fetchUnifiedWorkout({ programDayAssignmentId, workoutTemplateId, fallbackTitle: mTitle }),
          getMetricsCatalog(),
        ]);
        setMetricsCatalog(catalog);
        let mappedBlocks: SessionBlock[] = data.blocks.map((b) => ({
          id: b.id,
          title: b.title,
          exercises: b.exercises.map((ex) => ({
            ...ex,
            rows: buildInitialRows(ex),
            note: '',
          })),
        }));
        let initialActiveIndex: Record<number, number> = {};
        if (persisted?.blocks?.length) {
          mappedBlocks = mergePersistedBlocks(mappedBlocks, persisted.blocks);
          initialActiveIndex = persisted.activeIndexByBlock || {};
        }
        setBlocks(mappedBlocks);
        setActiveIndexByBlock(initialActiveIndex);
        setPageIndex(0);
      } catch (e) {
        setError(true);
      } finally {
        setIsLoading(false);
      }
    },
    [programDayAssignmentId, workoutTemplateId, mTitle]
  );

  // Punto 4: al entrar en esta pantalla, mira si ya habia una sesion sin
  // guardar pendiente para este MISMO workout (mismo identityKey) guardada
  // en AsyncStorage -- si la hay, retoma su timestamp real de inicio (asi
  // la duracion sigue contando desde ahi, sin limite de dias) y fusiona las
  // series/notas que ya se habian rellenado. Si no hay nada o es de otro
  // workout distinto, arranca en limpio con startedAt = ahora.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      let persisted: PersistedSession | null = null;
      if (identityKey) {
        try {
          const raw = await AsyncStorage.getItem(ACTIVE_SESSION_STORAGE_KEY);
          if (raw) {
            const parsed: PersistedSession = JSON.parse(raw);
            if (parsed.identityKey === identityKey) persisted = parsed;
          }
        } catch {}
      }
      if (cancelled) return;
      const startedAt = persisted?.startedAt ?? Date.now();
      setSessionStartedAt(startedAt);
      setNowTick(Date.now());
      load(persisted);
    })();
    return () => {
      cancelled = true;
    };
    // Solo al montar esta instancia de pantalla -- identityKey/load no
    // cambian durante la vida de esta pantalla (vienen de route.params).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persiste la sesion en curso (debounced) cada vez que cambia algo
  // relevante -- asi si la app se mata sin previo aviso (no hay evento
  // fiable "voy a cerrar" en RN), lo ultimo escrito en AsyncStorage sigue
  // siendo una version reciente de la sesion real.
  useEffect(() => {
    if (isLoading || !identityKey || blocks.length === 0) return;
    const payload: PersistedSession = { identityKey, startedAt: sessionStartedAt, blocks, activeIndexByBlock };
    const t = setTimeout(() => {
      AsyncStorage.setItem(ACTIVE_SESSION_STORAGE_KEY, JSON.stringify(payload)).catch(() => {});
    }, 400);
    return () => clearTimeout(t);
  }, [isLoading, identityKey, blocks, activeIndexByBlock, sessionStartedAt]);

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

  const allExercises = useMemo(() => blocks.flatMap((b) => b.exercises), [blocks]);

  const volumeKg = useMemo(() => {
    let total = 0;
    allExercises.forEach((ex) => {
      ex.rows.forEach((row) => {
        if (!row.completed) return;
        const carga = parseFloat(row.values.carga);
        const reps = parseFloat(row.values.reps);
        if (!isNaN(carga) && !isNaN(reps)) total += carga * reps;
      });
    });
    return Math.round(total);
  }, [allExercises]);

  const hasAnyProgress = useMemo(
    () => allExercises.some((ex) => ex.rows.some((r) => r.completed)),
    [allExercises]
  );

  // Sets planos {exercise_id, weight, reps} de todas las series completadas
  // de la sesion - se envian tal cual a muscleVolumeApi.compute() en la
  // pantalla de resumen, sin depender de que ya esten guardadas en BD.
  const muscleVolumeSets = useMemo(() => {
    const sets: { exercise_id: number; weight: number | null; reps: number | null }[] = [];
    allExercises.forEach((ex) => {
      ex.rows.forEach((row) => {
        if (!row.completed) return;
        const carga = parseFloat(row.values.carga);
        const reps = parseFloat(row.values.reps);
        sets.push({
          exercise_id: ex.exerciseId,
          weight: isNaN(carga) ? null : carga,
          reps: isNaN(reps) ? null : reps,
        });
      });
    });
    return sets;
  }, [allExercises]);

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
          workout_template_exercise_id: ex.isAdhoc ? undefined : ex.id,
          exercise_id: ex.isAdhoc ? ex.exerciseId : undefined,
          logged_sets: loggedSets,
          program_day_assignment_id: programDayAssignmentId ?? null,
          notes: ex.note.trim() || undefined,
        })
        .catch(() => {});
    },
    [programDayAssignmentId]
  );

  const updateExercise = (
    blockIdx: number,
    exIdx: number,
    updater: (ex: SessionExercise) => SessionExercise
  ) => {
    setBlocks((prev) => {
      const next = [...prev];
      const block = { ...next[blockIdx] };
      const exercisesList = [...block.exercises];
      exercisesList[exIdx] = updater(exercisesList[exIdx]);
      block.exercises = exercisesList;
      next[blockIdx] = block;
      return next;
    });
  };

  const setCellValue = (blockIdx: number, exIdx: number, rowIndex: number, key: string, value: string) => {
    updateExercise(blockIdx, exIdx, (ex) => {
      const rows = [...ex.rows];
      rows[rowIndex] = { ...rows[rowIndex], values: { ...rows[rowIndex].values, [key]: value } };
      return { ...ex, rows };
    });
  };

  const setNoteValue = (blockIdx: number, exIdx: number, note: string) => {
    updateExercise(blockIdx, exIdx, (ex) => ({ ...ex, note }));
  };

  const toggleRowComplete = (blockIdx: number, exIdx: number, rowIndex: number) => {
    setBlocks((prev) => {
      const next = [...prev];
      const block = { ...next[blockIdx] };
      const exercisesList = [...block.exercises];
      const ex = { ...exercisesList[exIdx] };
      const rows = [...ex.rows];
      rows[rowIndex] = { ...rows[rowIndex], completed: !rows[rowIndex].completed };
      ex.rows = rows;
      exercisesList[exIdx] = ex;
      block.exercises = exercisesList;
      next[blockIdx] = block;
      syncExerciseLog(ex);
      return next;
    });
  };

  const addRow = (blockIdx: number, exIdx: number) => {
    updateExercise(blockIdx, exIdx, (ex) => {
      const last = ex.rows[ex.rows.length - 1];
      const values = last ? { ...last.values } : {};
      return { ...ex, rows: [...ex.rows, { values, completed: false }] };
    });
  };

  const markAllRows = (blockIdx: number, exIdx: number) => {
    setBlocks((prev) => {
      const next = [...prev];
      const block = { ...next[blockIdx] };
      const exercisesList = [...block.exercises];
      const ex = { ...exercisesList[exIdx] };
      ex.rows = ex.rows.map((r) => ({ ...r, completed: true }));
      exercisesList[exIdx] = ex;
      block.exercises = exercisesList;
      next[blockIdx] = block;
      syncExerciseLog(ex);
      return next;
    });
  };

  const openExerciseInfo = (ex: SessionExercise) => {
    navigation?.navigate('MigratedExerciseInfo', {
      mExerciseId: ex.exerciseId,
      mExerciseName: ex.title,
      initialTab: 'analysis',
    });
  };

  // Punto 1: carga bajo demanda (solo para el ejercicio activo/expandido,
  // una vez por exerciseId) la sugerencia PENDIENTE del Motor de
  // Auto-Regulacion para ese ejercicio, si existe. Silenciosa ante
  // cualquier error -- es un dato "extra" sobre el objetivo normal, nunca
  // debe bloquear ni romper la sesion si falla.
  const fetchLoadSuggestion = useCallback(
    (ex: SessionExercise) => {
      const clientId = state.user?.id;
      if (!clientId || requestedSuggestionsRef.current.has(ex.exerciseId)) return;
      requestedSuggestionsRef.current.add(ex.exerciseId);
      loadSuggestionApi
        .getProgressionHistory(ex.exerciseId, clientId)
        .then((res) => {
          const suggestion = pickPendingSuggestion(res.data?.data?.targets);
          if (suggestion) {
            setPendingLoadSuggestions((prev) => ({ ...prev, [ex.exerciseId]: suggestion }));
          }
        })
        .catch(() => {});
    },
    [state.user?.id]
  );

  // Al cargar la sesion (fresca o retomada), pide de una vez la sugerencia
  // del ejercicio que arranca activo/expandido en cada bloque (indice 0 por
  // defecto, o el que se retomo de la sesion persistida).
  useEffect(() => {
    if (isLoading) return;
    blocks.forEach((block, blockIdx) => {
      const activeIdx = activeIndexByBlock[blockIdx] ?? 0;
      const ex = block.exercises[activeIdx];
      if (ex) fetchLoadSuggestion(ex);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, blocks.length]);

  // ─────────────────────── Picker "Añadir ejercicio" ───────────────────────
  const runPickerSearch = useCallback(async (query: string, bodyPartId: number | null, page: number) => {
    if (page === 1) setPickerLoading(true);
    else setPickerLoadingMore(true);
    try {
      const res = await exercisesApi.getFilteredList({
        title: query.trim() || undefined,
        bodypart_id: bodyPartId ?? undefined,
        page,
        per_page: 20,
      });
      const items = res.data?.data ?? [];
      setPickerResults((prev) => (page === 1 ? items : [...prev, ...items]));
      const totalPages = res.data?.pagination?.totalPages ?? 1;
      setPickerIsLastPage(page >= totalPages);
    } catch (e) {
      if (page === 1) setPickerResults([]);
    } finally {
      setPickerLoading(false);
      setPickerLoadingMore(false);
    }
  }, []);

  const openExercisePicker = () => {
    setPickerQuery('');
    setSelectedBodyPartId(null);
    setPickerPage(1);
    setPickerIsLastPage(false);
    setIsPickerVisible(true);
    runPickerSearch('', null, 1);
    if (bodyParts.length === 0) {
      exercisesApi
        .getBodyParts(1)
        .then((res) => setBodyParts(res.data?.data ?? []))
        .catch(() => {});
    }
  };

  useEffect(() => {
    if (!isPickerVisible) return;
    const timeout = setTimeout(() => {
      setPickerPage(1);
      setPickerIsLastPage(false);
      runPickerSearch(pickerQuery, selectedBodyPartId, 1);
    }, 350);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pickerQuery, selectedBodyPartId, isPickerVisible]);

  const onPickerEndReached = () => {
    if (pickerIsLastPage || pickerLoading || pickerLoadingMore) return;
    const nextPage = pickerPage + 1;
    setPickerPage(nextPage);
    runPickerSearch(pickerQuery, selectedBodyPartId, nextPage);
  };

  const onAddExercise = (item: ExerciseItem) => {
    const targetBlockIdx = Math.min(pageIndex, blocks.length - 1);
    const baseExercise: UnifiedExercise = {
      id: -item.id, // synthetic, solo para key de React - no se envia al backend
      exerciseId: item.id,
      title: item.title,
      image: item.exercise_image,
      bodyPartId: item.bodypart_name?.[0]?.id ?? null,
      videoUrl: item.video_url,
      prescribed: {},
      enabledMetrics: ADHOC_DEFAULT_METRICS,
      coachNotes: null,
      lastPerformance: null,
      sequence: (blocks[targetBlockIdx]?.exercises.length ?? 0) + 1,
    };
    const newExercise: SessionExercise = {
      ...baseExercise,
      rows: buildInitialRows(baseExercise),
      note: '',
      isAdhoc: true,
    };
    setBlocks((prev) => {
      const next = [...prev];
      const block = { ...next[targetBlockIdx] };
      const newIdx = block.exercises.length;
      block.exercises = [...block.exercises, newExercise];
      next[targetBlockIdx] = block;
      setActiveIndexByBlock((prevActive) => ({ ...prevActive, [targetBlockIdx]: newIdx }));
      return next;
    });
    fetchLoadSuggestion(newExercise);
    setIsPickerVisible(false);
  };

  const onPagerScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    setPageIndex(idx);
  };

  const goToPage = (idx: number) => {
    pagerRef.current?.scrollToIndex({ index: idx, animated: true });
    setPageIndex(idx);
  };

  const navigateToFeedback = () => {
    // El cliente ya pulso "Finalizar" -> a partir de aqui la sesion pasa a
    // la pantalla de Feedback (que hara el POST real de finishSession), asi
    // que deja de ser una "sesion sin guardar" que haya que retomar.
    clearPersistedSession();
    const exerciseIds = Array.from(new Set(allExercises.map((ex) => ex.exerciseId)));
    // Solo ejercicios con al menos una serie completada, en el orden en que
    // aparecen en la sesion — para la lista de ejercicios del carrusel de
    // resumen (pantallas 4 y 6 de Pantallas_Resumen_Entrenamiento.md).
    const exercisesSummary = allExercises
      .map((ex) => ({ title: ex.title, sets: ex.rows.filter((r) => r.completed).length }))
      .filter((ex) => ex.sets > 0);
    navigation?.navigate('MigratedWorkoutFeedback', {
      programDayAssignmentId,
      workoutTemplateId,
      mTitle,
      durationSeconds: elapsedSeconds,
      volumeKg,
      caloriesBurned: liveCalories,
      exerciseCount: allExercises.length,
      completedSets: allExercises.reduce((sum, ex) => sum + ex.rows.filter((r) => r.completed).length, 0),
      exerciseIds,
      muscleVolumeSets,
      exercisesSummary,
    });
  };

  const onFinish = () => {
    const completedSets = allExercises.reduce((sum, ex) => sum + ex.rows.filter((r) => r.completed).length, 0);
    if (completedSets === 0) {
      setEmptyFinishConfirmVisible(true);
      return;
    }
    navigateToFeedback();
  };

  const onClose = () => {
    if (!hasAnyProgress) {
      // Sin ninguna serie marcada -- no hay nada que retomar, se descarta.
      clearPersistedSession();
      navigation?.goBack();
      return;
    }
    setCloseConfirmVisible(true);
  };

  // Punto 5: "minimizar" -- sale de la pantalla SIN preguntar y SIN borrar
  // la sesion persistida (a diferencia de onClose), porque el entrenamiento
  // sigue activo y retomable: basta con volver a entrar a este mismo
  // workout (mismo programDayAssignmentId/workoutTemplateId) para
  // continuarlo con el tiempo real ya transcurrido y las series ya
  // rellenadas intactas (ver efecto de persistencia/retomado mas arriba).
  const onMinimize = () => {
    navigation?.goBack();
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

  if (error || blocks.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation?.goBack()}>
            <Ionicons name="close" size={26} color={C.textPrimary} />
          </TouchableOpacity>
        </View>
        <View style={styles.loader}>
          <Text style={styles.emptyText}>No se pudo cargar el entrenamiento.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const renderBlockPage = ({ item: block, index: blockIdx }: { item: SessionBlock; index: number }) => {
    const activeExIdx = activeIndexByBlock[blockIdx] ?? 0;
    return (
      <ScrollView
        style={{ width: SCREEN_WIDTH }}
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {block.exercises.map((ex, exIdx) =>
          exIdx === activeExIdx ? (
            <View key={ex.id} style={styles.activeCard}>
              <View style={styles.activeHeaderRow}>
                <TouchableOpacity
                  style={styles.activeHeaderTapArea}
                  activeOpacity={0.7}
                  onPress={() => openExerciseInfo(ex)}
                >
                  <ExerciseThumbMem image={ex.image} bodyPartId={ex.bodyPartId} size={56} />
                  <View style={styles.activeInfo}>
                    <Text style={styles.activeTitle} numberOfLines={2}>
                      {ex.title}
                    </Text>
                    <Text style={styles.activeSubtitle}>
                      {formatPrescribedSubtitle(ex.prescribed)}
                    </Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.painReportBtn}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  onPress={() => setPainReportTarget(ex)}
                >
                  <Ionicons name="medkit-outline" size={20} color={C.textSecondary} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.collapseBtn}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  onPress={() => setActiveIndexByBlock((prev) => ({ ...prev, [blockIdx]: -1 }))}
                >
                  <Ionicons name="chevron-up" size={20} color={C.textSecondary} />
                </TouchableOpacity>
              </View>

              {ex.coachNotes ? (
                <View style={styles.coachNoteBanner}>
                  <Ionicons name="chatbubble-ellipses-outline" size={14} color={C.warning60} />
                  <Text style={styles.coachNoteText}>{ex.coachNotes}</Text>
                </View>
              ) : null}

              <TextInput
                style={styles.noteInput}
                placeholder="Añadir nota..."
                placeholderTextColor={C.textSecondary}
                value={ex.note}
                onChangeText={(t) => setNoteValue(blockIdx, exIdx, t)}
                onBlur={() => syncExerciseLog(ex)}
              />

              {/* Con muchas métricas (reps, carga, rir, rpe, tempo, descanso...) las
                  columnas a flex:1 se apretaban tanto que las etiquetas de
                  cabecera envolvían a 2 líneas y se solapaban con la fila de
                  inputs de abajo. Ancho fijo por columna + toda la tabla
                  como una única fila horizontalmente scrolleable (en vez de
                  comprimir texto) mantiene # / métricas / ✓ siempre alineados. */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.table}>
                  <View style={styles.tableHeaderRow}>
                    <Text style={[styles.tableHeaderCell, styles.serieCol]}>#</Text>
                    {ex.enabledMetrics.map((key) => (
                      <Text key={key} style={[styles.tableHeaderCell, styles.metricCol]} numberOfLines={1}>
                        {metricLabel(key)}
                      </Text>
                    ))}
                    <View style={styles.checkCol} />
                  </View>

                  {ex.rows.map((row, rowIdx) => (
                    <View key={rowIdx} style={styles.tableRow}>
                      <Text style={[styles.tableCellText, styles.serieCol]}>{rowIdx + 1}</Text>
                      {ex.enabledMetrics.map((key) => {
                        // Punto 1 (Motor de Auto-Regulacion de Carga): si hay una
                        // sugerencia PENDIENTE del motor para este ejercicio, esa
                        // es la carga/reps real que hay que usar -- se muestra en
                        // vez del objetivo generico del coach (que sigue siendo el
                        // fallback si no hay sugerencia, comportamiento de siempre).
                        const suggestion = pendingLoadSuggestions[ex.exerciseId];
                        const suggestedValue =
                          key === 'carga' ? suggestion?.weight : key === 'reps' ? suggestion?.reps : null;
                        const hasSuggestion = suggestedValue != null;
                        const target = hasSuggestion ? suggestedValue : ex.prescribed?.[key];
                        return (
                          <View key={key} style={styles.metricCol}>
                            <TextInput
                              style={styles.tableInput}
                              value={row.values[key] ?? ''}
                              onChangeText={(t) => setCellValue(blockIdx, exIdx, rowIdx, key, t)}
                              keyboardType={metricInputType(key) === 'number' ? 'numeric' : 'default'}
                              placeholder="-"
                              placeholderTextColor={C.textSecondary}
                            />
                            {target != null && target !== '' ? (
                              <Text
                                style={[styles.targetHint, hasSuggestion && styles.targetHintSuggested]}
                                numberOfLines={1}
                              >
                                {hasSuggestion ? `Sugerido: ${target}` : `Obj: ${target}`}
                              </Text>
                            ) : null}
                          </View>
                        );
                      })}
                      <TouchableOpacity
                        style={styles.checkCol}
                        onPress={() => toggleRowComplete(blockIdx, exIdx, rowIdx)}
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
              </ScrollView>

              <View style={styles.rowActions}>
                <TouchableOpacity onPress={() => addRow(blockIdx, exIdx)}>
                  <Text style={styles.rowActionText}>+ AÑADIR SERIE</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.rowActionRight}
                  onPress={() => markAllRows(blockIdx, exIdx)}
                >
                  <Ionicons name="checkmark-done" size={16} color={C.textPrimary} />
                  <Text style={styles.rowActionText}>MARCAR TODAS LAS SERIES</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity
              key={ex.id}
              style={styles.collapsedRow}
              activeOpacity={0.7}
              onPress={() => {
                setActiveIndexByBlock((prev) => ({ ...prev, [blockIdx]: exIdx }));
                fetchLoadSuggestion(ex);
              }}
            >
              <TouchableOpacity activeOpacity={0.7} onPress={() => openExerciseInfo(ex)}>
                <ExerciseThumbMem image={ex.image} bodyPartId={ex.bodyPartId} size={48} />
              </TouchableOpacity>
              <View style={styles.collapsedInfo}>
                <Text style={styles.collapsedTitle} numberOfLines={2}>
                  {ex.title}
                </Text>
                <Text style={styles.collapsedSubtitle}>
                  {formatPrescribedSubtitle(ex.prescribed)}
                </Text>
              </View>
              {/* Punto 2: el boton de reportar dolor solo se ve con el
                  acordeon del ejercicio abierto (tarjeta activa, arriba) --
                  aqui, en fila colapsada, se quita. */}
              <Ionicons name="chevron-down" size={18} color={C.textSecondary} />
            </TouchableOpacity>
          )
        )}
      </ScrollView>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose}>
          <Ionicons name="close" size={26} color={C.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {mTitle || 'Entrenamiento'}
        </Text>
        <TouchableOpacity
          onPress={onMinimize}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessibilityLabel="Minimizar entrenamiento"
        >
          <Ionicons name="chevron-down-circle-outline" size={24} color={C.textSecondary} />
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
          <Text style={styles.statValue}>{liveCalories}</Text>
          <Text style={styles.statLabel}>Calorías (est.)</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{volumeKg}</Text>
          <Text style={styles.statLabel}>Volumen (kg)</Text>
        </View>
      </View>

      {/* Block progress dots + count/add row */}
      {blocks.length > 1 && (
        <View style={styles.dotsRow}>
          {blocks.map((b, idx) => (
            <TouchableOpacity key={b.id} onPress={() => goToPage(idx)} hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}>
              <View style={[styles.dot, idx === pageIndex && styles.dotActive]} />
            </TouchableOpacity>
          ))}
        </View>
      )}

      <View style={styles.countRow}>
        <Text style={styles.countText} numberOfLines={1}>
          {blocks.length > 1
            ? `${blocks[pageIndex]?.title || `BLOQUE ${pageIndex + 1}`} · ${blocks[pageIndex]?.exercises.length ?? 0} EJERCICIOS`
            : `${allExercises.length} EJERCICIOS`}
        </Text>
        <TouchableOpacity onPress={openExercisePicker}>
          <Text style={styles.addExerciseText}>Añadir ejercicio +</Text>
        </TouchableOpacity>
      </View>

      {/* Horizontal pager — una página por bloque */}
      <FlatList
        ref={pagerRef}
        data={blocks}
        keyExtractor={(b) => b.id.toString()}
        renderItem={renderBlockPage}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onPagerScrollEnd}
        style={{ flex: 1 }}
      />

      {/* Sticky finish button — siempre visible, sin importar el bloque activo */}
      <View style={[styles.stickyFooter, { paddingBottom: Math.max(insets.bottom, 14) + 6 }]}>
        <TouchableOpacity style={styles.finishBtn} activeOpacity={0.85} onPress={onFinish}>
          <Text style={styles.finishBtnText}>✓ FINALIZAR ENTRENAMIENTO</Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={isPickerVisible}
        animationType="slide"
        onRequestClose={() => setIsPickerVisible(false)}
      >
        <SafeAreaView style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => setIsPickerVisible(false)}>
              <Ionicons name="close" size={26} color={C.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Añadir ejercicio</Text>
            <View style={{ width: 26 }} />
          </View>
          <TextInput
            style={styles.pickerSearchInput}
            placeholder="Buscar ejercicio..."
            placeholderTextColor={C.textSecondary}
            value={pickerQuery}
            onChangeText={setPickerQuery}
          />
          {bodyParts.length > 0 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.bodyPartRow}
            >
              <TouchableOpacity
                style={[styles.bodyPartChip, selectedBodyPartId === null && styles.bodyPartChipActive]}
                onPress={() => setSelectedBodyPartId(null)}
              >
                <Text style={[styles.bodyPartChipText, selectedBodyPartId === null && styles.bodyPartChipTextActive]}>
                  Todos
                </Text>
              </TouchableOpacity>
              {bodyParts.map((bp) => (
                <TouchableOpacity
                  key={bp.id}
                  style={[styles.bodyPartChip, selectedBodyPartId === bp.id && styles.bodyPartChipActive]}
                  onPress={() => setSelectedBodyPartId(selectedBodyPartId === bp.id ? null : bp.id)}
                >
                  <Text
                    style={[
                      styles.bodyPartChipText,
                      selectedBodyPartId === bp.id && styles.bodyPartChipTextActive,
                    ]}
                  >
                    {bp.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
          {pickerLoading ? (
            <View style={styles.loader}>
              <ActivityIndicator size="large" color={C.textPrimary} />
            </View>
          ) : (
            <FlatList
              data={pickerResults}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24 }}
              onEndReached={onPickerEndReached}
              onEndReachedThreshold={0.4}
              ListEmptyComponent={
                <Text style={styles.emptyText}>No se encontraron ejercicios.</Text>
              }
              ListFooterComponent={
                pickerLoadingMore ? (
                  <ActivityIndicator size="small" color={C.textPrimary} style={{ marginVertical: 16 }} />
                ) : null
              }
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.pickerRow} onPress={() => onAddExercise(item)}>
                  {item.exercise_image ? (
                    <Image source={{ uri: item.exercise_image }} style={styles.pickerImage} />
                  ) : (
                    <View style={styles.pickerImage} />
                  )}
                  <Text style={styles.pickerRowTitle} numberOfLines={2}>
                    {item.title}
                  </Text>
                  <Ionicons name="add-circle-outline" size={22} color={C.textPrimary} />
                </TouchableOpacity>
              )}
            />
          )}
        </SafeAreaView>
      </Modal>

      <ConfirmDialogMem
        visible={closeConfirmVisible}
        icon="log-out-outline"
        destructive
        title="Salir del entrenamiento"
        message="Todavía no has finalizado esta sesión. Si sales ahora se perderá la duración y el feedback (las series ya marcadas quedan guardadas)."
        confirmText="Salir sin finalizar"
        cancelText="Seguir entrenando"
        onCancel={() => setCloseConfirmVisible(false)}
        onConfirm={() => {
          setCloseConfirmVisible(false);
          clearPersistedSession();
          navigation?.goBack();
        }}
      />

      <ConfirmDialogMem
        visible={emptyFinishConfirmVisible}
        icon="alert-circle-outline"
        destructive
        title="No has registrado ninguna serie"
        message="¿Seguro que quieres finalizar el entrenamiento sin apuntar ningún dato?"
        confirmText="Finalizar igualmente"
        cancelText="Seguir entrenando"
        onCancel={() => setEmptyFinishConfirmVisible(false)}
        onConfirm={() => {
          setEmptyFinishConfirmVisible(false);
          navigateToFeedback();
        }}
      />

      <PainReportSheet
        visible={!!painReportTarget}
        onClose={() => setPainReportTarget(null)}
        sessionId={painReportSessionId}
        isWorkoutTemplate={painReportIsWorkoutTemplate}
        exerciseId={painReportTarget?.exerciseId ?? 0}
        exerciseTitle={painReportTarget?.title}
      />
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
    color: C.textPrimary,
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
  statValue: { fontFamily: FONT.bold, fontSize: 17, color: C.textPrimary },
  statLabel: { fontFamily: FONT.regular, fontSize: 12, color: C.textSecondary, marginTop: 4 },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: C.border,
  },
  dotActive: {
    backgroundColor: C.textPrimary,
    width: 18,
  },
  countRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 12,
    gap: 12,
  },
  countText: { flex: 1, fontFamily: FONT.bold, fontSize: 13, color: C.textSecondary, letterSpacing: 0.5 },
  addExerciseText: { fontFamily: FONT.semiBold, fontSize: 13, color: C.textPrimary },
  pickerSearchInput: {
    marginHorizontal: 20,
    marginBottom: 12,
    backgroundColor: C.surfaceLight,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: FONT.regular,
    fontSize: 14,
    color: C.textPrimary,
  },
  bodyPartRow: {
    paddingHorizontal: 20,
    gap: 8,
    paddingBottom: 12,
  },
  bodyPartChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: C.surfaceLight,
    marginRight: 8,
  },
  bodyPartChipActive: {
    backgroundColor: C.accentBlack,
  },
  bodyPartChipText: {
    fontFamily: FONT.semiBold,
    fontSize: 12.5,
    color: C.textSecondary,
  },
  bodyPartChipTextActive: {
    color: '#FFFFFF',
  },
  pickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  pickerImage: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: C.surfaceLight,
    marginRight: 12,
  },
  pickerRowTitle: {
    flex: 1,
    fontFamily: FONT.semiBold,
    fontSize: 14,
    color: C.textPrimary,
    marginRight: 8,
  },
  activeCard: {
    marginHorizontal: 16,
    marginBottom: 10,
    backgroundColor: C.surfaceLight,
    borderRadius: 16,
    padding: 16,
  },
  activeHeaderRow: { flexDirection: 'row', alignItems: 'center' },
  activeHeaderTapArea: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  collapseBtn: { padding: 4, marginLeft: 8 },
  painReportBtn: { padding: 4, marginLeft: 8 },
  activeInfo: { flex: 1, marginLeft: 12 },
  activeTitle: { fontFamily: FONT.bold, fontSize: 16, color: C.textPrimary },
  activeSubtitle: { fontFamily: FONT.regular, fontSize: 13, color: C.textSecondary, marginTop: 4 },
  coachNoteBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginTop: 14,
    backgroundColor: C.warning5,
    borderRadius: 12,
    padding: 10,
  },
  coachNoteText: {
    flex: 1,
    fontFamily: FONT.regular,
    fontSize: 12.5,
    color: C.textSecondary,
    lineHeight: 18,
  },
  noteInput: {
    marginTop: 14,
    backgroundColor: C.surface,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontFamily: FONT.regular,
    fontSize: 13,
    color: C.textPrimary,
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
    color: C.textPrimary,
    textAlign: 'center',
  },
  tableInput: {
    backgroundColor: C.surface,
    borderRadius: 8,
    paddingVertical: 8,
    marginHorizontal: 3,
    fontFamily: FONT.regular,
    fontSize: 13,
    color: C.textPrimary,
    textAlign: 'center',
  },
  targetHint: {
    fontFamily: FONT.regular,
    fontSize: 9.5,
    color: C.textSecondary,
    textAlign: 'center',
    marginTop: 2,
  },
  // Punto 1: carga sugerida por el Motor de Auto-Regulacion (aun pendiente
  // de aprobacion del coach) -- distinguible en color/peso del objetivo
  // generico normal, misma posicion y tamano.
  targetHintSuggested: {
    fontFamily: FONT.semiBold,
    color: C.warning60,
  },
  serieCol: { width: 26 },
  metricCol: { width: 72, marginHorizontal: 2 },
  checkCol: { width: 34, alignItems: 'center' },
  stickyFooter: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 16 : 14,
    backgroundColor: C.bg,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
  finishBtn: {
    backgroundColor: C.accentBlack,
    borderRadius: 30,
    paddingVertical: 15,
    alignItems: 'center',
  },
  finishBtnText: { fontFamily: FONT.bold, fontSize: 14, color: '#FFFFFF', letterSpacing: 0.5 },
  rowActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
  },
  rowActionRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  rowActionText: { fontFamily: FONT.semiBold, fontSize: 12, color: C.textPrimary },
  collapsedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 10,
    padding: 12,
    backgroundColor: C.surfaceLight,
    borderRadius: 16,
  },
  collapsedInfo: { flex: 1, marginLeft: 12 },
  collapsedTitle: { fontFamily: FONT.semiBold, fontSize: 14, color: C.textPrimary },
  collapsedSubtitle: { fontFamily: FONT.regular, fontSize: 12, color: C.textSecondary, marginTop: 3 },
});

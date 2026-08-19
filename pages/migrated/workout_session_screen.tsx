import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import {
  ScrollView,
  TextInput,
  Platform,
  Modal,
  FlatList,
  Image,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Vibration,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Box } from '@components/ui/box';
import { HStack } from '@components/ui/hstack';
import { Text } from '@components/ui/text';
import { Heading } from '@components/ui/heading';
import { Card } from '@components/ui/card';
import { Button, ButtonText } from '@components/ui/button';
import { Pressable } from '@components/ui/pressable';
import { Icon } from '@components/ui/icon';
import { Spinner } from '@components/ui/spinner';
import { Divider } from '@components/ui/divider';
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
  ACTIVE_SESSION_STORAGE_KEY,
  updateActiveWorkoutSession,
  setWorkoutSessionMinimized,
  clearActiveWorkoutSession,
} from '../../helper/workoutSessionBus';
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
// ACTIVE_SESSION_STORAGE_KEY vive en helper/workoutSessionBus.ts (import de
// arriba) -- se centralizo ahi porque App.tsx tambien la lee al arrancar.

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
  mTitle?: string;
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
  // Popup de descanso: segundos restantes, o null si no hay ninguno activo.
  // Se dispara al marcar una serie como hecha (nunca al desmarcarla) si esa
  // serie concreta tiene un valor de "descanso" (metrica real del catalogo
  // -- series/reps/carga/tiempo/tempo/descanso/rir/rpe) configurado.
  const [restCountdown, setRestCountdown] = useState<number | null>(null);
  const restIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
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
    clearActiveWorkoutSession();
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
    const payload: PersistedSession = {
      identityKey,
      startedAt: sessionStartedAt,
      blocks,
      activeIndexByBlock,
      mTitle,
    };
    const t = setTimeout(() => {
      AsyncStorage.setItem(ACTIVE_SESSION_STORAGE_KEY, JSON.stringify(payload)).catch(() => {});
    }, 400);
    let completedSets = 0;
    let totalSets = 0;
    blocks.forEach((b) =>
      b.exercises.forEach((ex) =>
        ex.rows.forEach((r) => {
          totalSets += 1;
          if (r.completed) completedSets += 1;
        })
      )
    );
    updateActiveWorkoutSession({
      identityKey,
      programDayAssignmentId,
      workoutTemplateId,
      mTitle,
      startedAt: sessionStartedAt,
      completedSets,
      totalSets,
    });
    return () => clearTimeout(t);
  }, [isLoading, identityKey, blocks, activeIndexByBlock, sessionStartedAt, mTitle, programDayAssignmentId, workoutTemplateId]);

  // La barra flotante global (WorkoutMinimizedBar, montada en App.tsx) solo
  // debe verse cuando esta pantalla NO esta en primer plano -- aqui es
  // donde ya se ve la sesion en vivo. Cualquier forma de salir (boton
  // minimizar, gesto de swipe-back, boton fisico Atras) desmonta esta
  // pantalla y dispara este cleanup por igual, asi que no hace falta
  // repetir la llamada en cada handler de salida por separado.
  useEffect(() => {
    setWorkoutSessionMinimized(false);
    return () => setWorkoutSessionMinimized(true);
  }, []);

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

  // Acepta "90" (segundos) o "1:30" (mm:ss) -- el catalogo real no fija un
  // formato unico para "descanso", asi que se manejan los dos sin asumir.
  const parseRestSeconds = (raw?: string): number | null => {
    if (!raw) return null;
    const trimmed = raw.trim();
    if (trimmed.includes(':')) {
      const [m, s] = trimmed.split(':').map(Number);
      if (Number.isFinite(m) && Number.isFinite(s)) return m * 60 + s;
      return null;
    }
    const n = Number(trimmed);
    return Number.isFinite(n) && n > 0 ? n : null;
  };

  const startRestCountdown = (seconds: number) => {
    if (restIntervalRef.current) clearInterval(restIntervalRef.current);
    setRestCountdown(seconds);
    restIntervalRef.current = setInterval(() => {
      setRestCountdown((prev) => (prev != null && prev > 1 ? prev - 1 : null));
    }, 1000);
  };

  const dismissRestCountdown = () => {
    if (restIntervalRef.current) {
      clearInterval(restIntervalRef.current);
      restIntervalRef.current = null;
    }
    setRestCountdown(null);
  };

  // fires once when the countdown reaches zero on its own (the ref guard
  // distinguishes that from dismissRestCountdown, which already clears the
  // ref before setting restCountdown to null). Kept out of setRestCountdown's
  // updater above: React may re-invoke that updater, and it must stay pure.
  useEffect(() => {
    if (restCountdown === null && restIntervalRef.current) {
      clearInterval(restIntervalRef.current);
      restIntervalRef.current = null;
      Vibration.vibrate([0, 400, 200, 400]);
    }
  }, [restCountdown]);

  useEffect(() => {
    return () => {
      if (restIntervalRef.current) clearInterval(restIntervalRef.current);
    };
  }, []);

  const toggleRowComplete = (blockIdx: number, exIdx: number, rowIndex: number) => {
    const currentEx = blocks[blockIdx].exercises[exIdx];
    const wasCompleted = currentEx.rows[rowIndex].completed;
    const rows = [...currentEx.rows];
    rows[rowIndex] = { ...rows[rowIndex], completed: !wasCompleted };
    const ex = { ...currentEx, rows };

    // side effects live outside the updater below: setBlocks's updater must
    // stay pure since React may re-invoke it, which would duplicate the
    // network sync and could start overlapping rest timers.
    setBlocks((prev) => {
      const next = [...prev];
      const block = { ...next[blockIdx] };
      const exercisesList = [...block.exercises];
      exercisesList[exIdx] = ex;
      block.exercises = exercisesList;
      next[blockIdx] = block;
      return next;
    });
    syncExerciseLog(ex);
    // Solo al MARCAR (no al desmarcar) y solo si esta serie concreta tiene
    // un valor de descanso real configurado -- sin dato, no se inventa.
    if (!wasCompleted && ex.enabledMetrics.includes('descanso')) {
      const seconds = parseRestSeconds(rows[rowIndex].values.descanso);
      if (seconds != null) startRestCountdown(seconds);
    }
  };

  const addRow = (blockIdx: number, exIdx: number) => {
    updateExercise(blockIdx, exIdx, (ex) => {
      const last = ex.rows[ex.rows.length - 1];
      const values = last ? { ...last.values } : {};
      return { ...ex, rows: [...ex.rows, { values, completed: false }] };
    });
  };

  const markAllRows = (blockIdx: number, exIdx: number) => {
    const currentEx = blocks[blockIdx].exercises[exIdx];
    const ex = { ...currentEx, rows: currentEx.rows.map((r) => ({ ...r, completed: true })) };

    setBlocks((prev) => {
      const next = [...prev];
      const block = { ...next[blockIdx] };
      const exercisesList = [...block.exercises];
      exercisesList[exIdx] = ex;
      block.exercises = exercisesList;
      next[blockIdx] = block;
      return next;
    });
    syncExerciseLog(ex);
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
    const newIdx = blocks[targetBlockIdx]?.exercises.length ?? 0;
    setBlocks((prev) => {
      const next = [...prev];
      const block = { ...next[targetBlockIdx] };
      block.exercises = [...block.exercises, newExercise];
      next[targetBlockIdx] = block;
      return next;
    });
    setActiveIndexByBlock((prevActive) => ({ ...prevActive, [targetBlockIdx]: newIdx }));
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
      <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
        <Box className="flex-1 items-center justify-center">
          <Spinner size="large" color={C.textPrimary} />
        </Box>
      </SafeAreaView>
    );
  }

  if (error || blocks.length === 0) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
        <Box
          className="flex-row items-center justify-between px-5"
          style={{ paddingTop: Platform.OS === 'ios' ? 12 : 16, paddingBottom: 12 }}
        >
          <Pressable onPress={() => navigation?.goBack()}>
            <Icon name="close" size={26} color={C.textPrimary} />
          </Pressable>
        </Box>
        <Box className="flex-1 items-center justify-center">
          <Text muted className="text-center px-6" style={{ fontSize: 15 }}>
            No se pudo cargar el entrenamiento.
          </Text>
        </Box>
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
            <Card key={ex.id} variant="filled" className="mx-4" style={{ marginBottom: 10 }}>
              <HStack className="items-center">
                <Pressable
                  className="flex-1 flex-row items-center"
                  onPress={() => openExerciseInfo(ex)}
                >
                  <ExerciseThumbMem image={ex.image} bodyPartId={ex.bodyPartId} size={56} />
                  <Box className="flex-1" style={{ marginLeft: 12 }}>
                    <Text weight="bold" className="text-foreground" style={{ fontSize: 16 }} numberOfLines={2}>
                      {ex.title}
                    </Text>
                    <Text muted style={{ fontSize: 13, marginTop: 4 }}>
                      {formatPrescribedSubtitle(ex.prescribed)}
                    </Text>
                  </Box>
                </Pressable>
                <Pressable
                  className="p-1"
                  style={{ marginLeft: 8 }}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  onPress={() => setPainReportTarget(ex)}
                >
                  <Icon name="medkit-outline" size={20} className="text-muted-foreground" />
                </Pressable>
                <Pressable
                  className="p-1"
                  style={{ marginLeft: 8 }}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  onPress={() => setActiveIndexByBlock((prev) => ({ ...prev, [blockIdx]: -1 }))}
                >
                  <Icon name="chevron-up" size={20} className="text-muted-foreground" />
                </Pressable>
              </HStack>

              {ex.coachNotes ? (
                <HStack
                  space="sm"
                  className="items-start rounded-md p-2.5"
                  style={{ marginTop: 14, backgroundColor: C.warning5 }}
                >
                  <Icon name="chatbubble-ellipses-outline" size={14} color={C.warning60} />
                  <Text muted className="flex-1" style={{ fontSize: 12.5, lineHeight: 18 }}>
                    {ex.coachNotes}
                  </Text>
                </HStack>
              ) : null}

              <TextInput
                className="bg-card rounded-md px-3 py-2.5 text-foreground"
                style={{ marginTop: 14, fontFamily: FONT.regular, fontSize: 13 }}
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
                <Box style={{ marginTop: 16 }}>
                  <HStack className="items-center" style={{ marginBottom: 8 }}>
                    <Text weight="semibold" muted className="text-center" style={{ fontSize: 11, width: 26 }}>
                      #
                    </Text>
                    {ex.enabledMetrics.map((key) => (
                      <Text
                        key={key}
                        weight="semibold"
                        muted
                        className="text-center"
                        style={{ fontSize: 11, width: 72, marginHorizontal: 2 }}
                        numberOfLines={1}
                      >
                        {metricLabel(key)}
                      </Text>
                    ))}
                    <Box style={{ width: 34 }} />
                  </HStack>

                  {ex.rows.map((row, rowIdx) => (
                    <HStack
                      key={rowIdx}
                      className="items-center rounded-sm"
                      style={{
                        marginBottom: 8,
                        paddingVertical: row.completed ? 4 : 0,
                        backgroundColor: row.completed ? C.success5 : 'transparent',
                      }}
                    >
                      <Text
                        weight="medium"
                        className="text-center text-foreground"
                        style={{ fontSize: 13, width: 26 }}
                      >
                        {rowIdx + 1}
                      </Text>
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
                          <Box key={key} style={{ width: 72, marginHorizontal: 2 }}>
                            <TextInput
                              className="bg-card rounded-sm text-foreground"
                              style={{ paddingVertical: 8, fontFamily: FONT.regular, fontSize: 13, textAlign: 'center' }}
                              value={row.values[key] ?? ''}
                              onChangeText={(t) => setCellValue(blockIdx, exIdx, rowIdx, key, t)}
                              keyboardType={metricInputType(key) === 'number' ? 'numeric' : 'default'}
                              placeholder="-"
                              placeholderTextColor={C.textSecondary}
                            />
                            {target != null && target !== '' ? (
                              <Text
                                className="text-center"
                                style={{
                                  fontSize: 9.5,
                                  marginTop: 2,
                                  fontFamily: hasSuggestion ? FONT.semiBold : FONT.regular,
                                  color: hasSuggestion ? C.warning60 : C.textSecondary,
                                }}
                                numberOfLines={1}
                              >
                                {hasSuggestion ? `Sugerido: ${target}` : `Obj: ${target}`}
                              </Text>
                            ) : null}
                          </Box>
                        );
                      })}
                      <Pressable
                        className="items-center"
                        style={{ width: 34 }}
                        onPress={() => toggleRowComplete(blockIdx, exIdx, rowIdx)}
                      >
                        <Icon
                          name={row.completed ? 'checkmark-circle' : 'checkmark-circle-outline'}
                          size={26}
                          color={row.completed ? C.success : C.textSecondary}
                        />
                      </Pressable>
                    </HStack>
                  ))}
                </Box>
              </ScrollView>

              <HStack className="items-center justify-between" style={{ marginTop: 14 }}>
                <Pressable onPress={() => addRow(blockIdx, exIdx)}>
                  <Text weight="semibold" className="text-foreground" style={{ fontSize: 12 }}>
                    + AÑADIR SERIE
                  </Text>
                </Pressable>
                <Pressable
                  className="flex-row items-center"
                  style={{ gap: 6 }}
                  onPress={() => markAllRows(blockIdx, exIdx)}
                >
                  <Icon name="checkmark-done" size={16} className="text-foreground" />
                  <Text weight="semibold" className="text-foreground" style={{ fontSize: 12 }}>
                    MARCAR TODAS LAS SERIES
                  </Text>
                </Pressable>
              </HStack>
            </Card>
          ) : (
            <Pressable
              key={ex.id}
              className="flex-row items-center mx-4 p-3 rounded-lg bg-card"
              style={{ marginBottom: 10 }}
              onPress={() => {
                setActiveIndexByBlock((prev) => ({ ...prev, [blockIdx]: exIdx }));
                fetchLoadSuggestion(ex);
              }}
            >
              <Pressable onPress={() => openExerciseInfo(ex)}>
                <ExerciseThumbMem image={ex.image} bodyPartId={ex.bodyPartId} size={48} />
              </Pressable>
              <Box className="flex-1" style={{ marginLeft: 12 }}>
                <Text weight="semibold" className="text-foreground" style={{ fontSize: 14 }} numberOfLines={2}>
                  {ex.title}
                </Text>
                <Text muted style={{ fontSize: 12, marginTop: 3 }}>
                  {formatPrescribedSubtitle(ex.prescribed)}
                </Text>
              </Box>
              {/* Punto 2: el boton de reportar dolor solo se ve con el
                  acordeon del ejercicio abierto (tarjeta activa, arriba) --
                  aqui, en fila colapsada, se quita. */}
              <Icon name="chevron-down" size={18} className="text-muted-foreground" />
            </Pressable>
          )
        )}
      </ScrollView>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }} edges={['top', 'left', 'right']}>
      {/* Header */}
      <Box
        className="flex-row items-center justify-between px-5"
        style={{ paddingTop: Platform.OS === 'ios' ? 12 : 16, paddingBottom: 12 }}
      >
        <Pressable onPress={onClose}>
          <Icon name="close" size={26} className="text-foreground" />
        </Pressable>
        <Heading size="sm" className="flex-1 text-center mx-3" numberOfLines={1}>
          {mTitle || 'Entrenamiento'}
        </Heading>
        <Pressable
          onPress={onMinimize}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessibilityLabel="Minimizar entrenamiento"
        >
          <Icon name="chevron-down-circle-outline" size={24} className="text-muted-foreground" />
        </Pressable>
      </Box>

      {/* Live stats */}
      <HStack className="px-5 py-4">
        <Box className="flex-1 items-center">
          <HStack space="xs" className="items-center">
            <Box className="w-2 h-2 rounded-pill bg-success" />
            <Text weight="bold" className="text-foreground" style={{ fontSize: 17 }}>
              {formatTimer(elapsedSeconds)}
            </Text>
          </HStack>
          <Text muted style={{ fontSize: 12, marginTop: 4 }}>
            Duración
          </Text>
        </Box>
        <Box className="flex-1 items-center">
          <Text weight="bold" className="text-foreground" style={{ fontSize: 17 }}>
            {liveCalories}
          </Text>
          <Text muted style={{ fontSize: 12, marginTop: 4 }}>
            Calorías (est.)
          </Text>
        </Box>
        <Box className="flex-1 items-center">
          <Text weight="bold" className="text-foreground" style={{ fontSize: 17 }}>
            {volumeKg}
          </Text>
          <Text muted style={{ fontSize: 12, marginTop: 4 }}>
            Volumen (kg)
          </Text>
        </Box>
      </HStack>

      {/* Block progress dots + count/add row */}
      {blocks.length > 1 && (
        <HStack space="sm" className="justify-center items-center" style={{ marginBottom: 8 }}>
          {blocks.map((b, idx) => (
            <Pressable key={b.id} onPress={() => goToPage(idx)} hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}>
              <Box
                className="rounded-pill"
                style={{
                  width: idx === pageIndex ? 18 : 7,
                  height: 7,
                  backgroundColor: idx === pageIndex ? C.textPrimary : C.border,
                }}
              />
            </Pressable>
          ))}
        </HStack>
      )}

      <HStack space="md" className="items-center justify-between px-5" style={{ marginBottom: 12 }}>
        <Text weight="bold" muted className="flex-1" style={{ fontSize: 13, letterSpacing: 0.5 }} numberOfLines={1}>
          {blocks.length > 1
            ? `${blocks[pageIndex]?.title || `BLOQUE ${pageIndex + 1}`} · ${blocks[pageIndex]?.exercises.length ?? 0} EJERCICIOS`
            : `${allExercises.length} EJERCICIOS`}
        </Text>
        <Pressable onPress={openExercisePicker}>
          <Text weight="semibold" className="text-foreground" style={{ fontSize: 13 }}>
            Añadir ejercicio +
          </Text>
        </Pressable>
      </HStack>

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

      {/* Countdown de descanso — aparece al completar una serie con
          "descanso" configurado, vibra al llegar a 0. */}
      {restCountdown != null && (
        <HStack
          space="sm"
          className="items-center justify-between px-5 rounded-md"
          style={{
            marginHorizontal: 20,
            marginBottom: 10,
            paddingVertical: 10,
            paddingHorizontal: 14,
            backgroundColor: C.accentBlack,
          }}
        >
          <HStack space="sm" className="items-center">
            <Icon name="time-outline" size={18} className="text-background" />
            <Text weight="bold" className="text-background" style={{ fontSize: 15 }}>
              Descanso: {formatTimer(restCountdown)}
            </Text>
          </HStack>
          <Pressable onPress={dismissRestCountdown} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Text weight="semibold" className="text-background" style={{ fontSize: 13 }}>
              Saltar
            </Text>
          </Pressable>
        </HStack>
      )}

      {/* Sticky finish button — siempre visible, sin importar el bloque activo */}
      <Box
        className="px-5 border-t border-border bg-background"
        style={{ paddingTop: 10, paddingBottom: Math.max(insets.bottom, 14) + 6 }}
      >
        <Button radius="pill" onPress={onFinish}>
          <ButtonText style={{ letterSpacing: 0.5 }}>✓ FINALIZAR ENTRENAMIENTO</ButtonText>
        </Button>
      </Box>

      <Modal
        visible={isPickerVisible}
        animationType="slide"
        onRequestClose={() => setIsPickerVisible(false)}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
          <Box
            className="flex-row items-center justify-between px-5"
            style={{ paddingTop: Platform.OS === 'ios' ? 12 : 16, paddingBottom: 12 }}
          >
            <Pressable onPress={() => setIsPickerVisible(false)}>
              <Icon name="close" size={26} className="text-foreground" />
            </Pressable>
            <Heading size="sm">Añadir ejercicio</Heading>
            <Box style={{ width: 26 }} />
          </Box>
          <TextInput
            className="mx-5 bg-card rounded-md px-3.5 py-3 text-foreground"
            style={{ fontFamily: FONT.regular, fontSize: 14, marginBottom: 12 }}
            placeholder="Buscar ejercicio..."
            placeholderTextColor={C.textSecondary}
            value={pickerQuery}
            onChangeText={setPickerQuery}
          />
          {bodyParts.length > 0 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 20, gap: 8, paddingBottom: 12 }}
            >
              <Pressable
                className="px-3.5 py-1.5 rounded-pill"
                style={{ backgroundColor: selectedBodyPartId === null ? C.accentBlack : C.surfaceLight }}
                onPress={() => setSelectedBodyPartId(null)}
              >
                <Text
                  weight="semibold"
                  style={{ fontSize: 12.5, color: selectedBodyPartId === null ? '#FFFFFF' : C.textSecondary }}
                >
                  Todos
                </Text>
              </Pressable>
              {bodyParts.map((bp) => (
                <Pressable
                  key={bp.id}
                  className="px-3.5 py-1.5 rounded-pill"
                  style={{ backgroundColor: selectedBodyPartId === bp.id ? C.accentBlack : C.surfaceLight }}
                  onPress={() => setSelectedBodyPartId(selectedBodyPartId === bp.id ? null : bp.id)}
                >
                  <Text
                    weight="semibold"
                    style={{ fontSize: 12.5, color: selectedBodyPartId === bp.id ? '#FFFFFF' : C.textSecondary }}
                  >
                    {bp.title}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          )}
          {pickerLoading ? (
            <Box className="flex-1 items-center justify-center">
              <Spinner size="large" color={C.textPrimary} />
            </Box>
          ) : (
            <FlatList
              data={pickerResults}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24 }}
              onEndReached={onPickerEndReached}
              onEndReachedThreshold={0.4}
              ItemSeparatorComponent={Divider}
              ListEmptyComponent={
                <Text muted className="text-center" style={{ fontSize: 15 }}>
                  No se encontraron ejercicios.
                </Text>
              }
              ListFooterComponent={
                pickerLoadingMore ? (
                  <Spinner size="small" color={C.textPrimary} style={{ marginVertical: 16 }} />
                ) : null
              }
              renderItem={({ item }) => (
                <Pressable className="flex-row items-center py-2.5" onPress={() => onAddExercise(item)}>
                  {item.exercise_image ? (
                    <Image source={{ uri: item.exercise_image }} style={{ width: 44, height: 44, borderRadius: 8, marginRight: 12 }} />
                  ) : (
                    <Box className="rounded-md bg-card" style={{ width: 44, height: 44, marginRight: 12 }} />
                  )}
                  <Text weight="semibold" className="flex-1 text-foreground" style={{ fontSize: 14, marginRight: 8 }} numberOfLines={2}>
                    {item.title}
                  </Text>
                  <Icon name="add-circle-outline" size={22} className="text-foreground" />
                </Pressable>
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

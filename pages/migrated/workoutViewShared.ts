import { workoutTemplateApi, MetricCatalogItem } from '../../api/workoutTemplate';
import { workoutHistoryApi } from '../../api/workoutHistory';

// Pantallas de Workout (Preview + Sesión en marcha) — lógica compartida
// para normalizar los dos orígenes posibles de un "click en un workout"
// del sistema v2 (WorkoutTemplate/ProgramDayAssignment) en una única
// forma de datos. Ver docs/PANTALLAS WORKOUT.md.

export interface UnifiedExercise {
  id: number; // workout_template_exercise_id — clave para log-sets
  exerciseId: number;
  title: string;
  image: string | null;
  videoUrl: string | null;
  prescribed: Record<string, any>;
  enabledMetrics: string[];
  coachNotes: string | null;
  lastPerformance: { sets: Record<string, any>[] } | null;
  sequence: number;
}

export interface UnifiedBlock {
  id: number;
  title: string;
  instructions: string | null;
  exercises: UnifiedExercise[];
}

export interface UnifiedWorkout {
  title: string;
  description: string | null;
  thumbnail: string | null;
  isRest: boolean;
  blocks: UnifiedBlock[];
  exerciseCount: number;
  programDayAssignmentId: number | null;
  workoutTemplateId: number | null;
}

export interface WorkoutViewParams {
  programDayAssignmentId?: number | null;
  workoutTemplateId?: number | null;
  fallbackTitle?: string;
}

export async function fetchUnifiedWorkout(params: WorkoutViewParams): Promise<UnifiedWorkout> {
  if (params.programDayAssignmentId) {
    const res = await workoutHistoryApi.getMyCalendarDayDetail(params.programDayAssignmentId);
    const data = res.data.data;
    const blocks: UnifiedBlock[] = (data.blocks ?? []).map((b) => ({
      id: b.block_id,
      title: b.title,
      instructions: null,
      exercises: (b.exercises ?? []).map((e) => ({
        id: e.id,
        exerciseId: e.exercise_id,
        title: e.title || 'Ejercicio',
        image: e.exercise_image,
        videoUrl: e.video_url,
        prescribed: e.sets || {},
        enabledMetrics: e.enabled_metrics || [],
        coachNotes: e.coach_notes,
        lastPerformance: e.last_performance,
        sequence: e.sequence,
      })),
    }));

    return {
      title: params.fallbackTitle || 'Entrenamiento',
      description: null,
      thumbnail: null,
      isRest: data.is_rest === 1,
      blocks,
      exerciseCount: blocks.reduce((sum, b) => sum + b.exercises.length, 0),
      programDayAssignmentId: params.programDayAssignmentId,
      workoutTemplateId: null,
    };
  }

  if (params.workoutTemplateId) {
    const res = await workoutTemplateApi.getClientDetail(params.workoutTemplateId);
    const data = res.data.data;
    const blocks: UnifiedBlock[] = (data.blocks ?? []).map((b) => ({
      id: b.id,
      title: b.title,
      instructions: b.instructions,
      exercises: (b.exercises ?? []).map((e) => ({
        id: e.id,
        exerciseId: e.exercise_id,
        title: e.title || e.exercise?.title || 'Ejercicio',
        image: e.exercise_image,
        videoUrl: e.video_url,
        prescribed: e.prescribed || {},
        enabledMetrics: e.enabled_metrics || [],
        coachNotes: e.notes,
        lastPerformance: null,
        sequence: e.sequence,
      })),
    }));

    return {
      title: data.title || params.fallbackTitle || 'Entrenamiento',
      description: data.description,
      thumbnail: data.thumbnail,
      isRest: false,
      blocks,
      exerciseCount: blocks.reduce((sum, b) => sum + b.exercises.length, 0),
      programDayAssignmentId: null,
      workoutTemplateId: params.workoutTemplateId,
    };
  }

  throw new Error('fetchUnifiedWorkout: falta programDayAssignmentId o workoutTemplateId');
}

/** Subtítulo "{sets} series de {reps} reps" — adaptativo según qué claves prescritas existan realmente. */
export function formatPrescribedSubtitle(prescribed: Record<string, any>): string {
  const series = prescribed?.series;
  const reps = prescribed?.reps;
  const tiempo = prescribed?.tiempo;

  const seriesText = series != null ? `${series} series` : null;

  if (reps != null) {
    return seriesText ? `${seriesText} de ${reps} reps` : `${reps} reps`;
  }
  if (tiempo != null) {
    return seriesText ? `${seriesText} de ${tiempo}s` : `${tiempo}s`;
  }
  return seriesText || '';
}

let metricsCatalogCache: MetricCatalogItem[] | null = null;
let metricsCatalogPromise: Promise<MetricCatalogItem[]> | null = null;

/** Catálogo de métricas (label/unit/input_type por key), cacheado en memoria durante la sesión. */
export async function getMetricsCatalog(): Promise<MetricCatalogItem[]> {
  if (metricsCatalogCache) return metricsCatalogCache;
  if (!metricsCatalogPromise) {
    metricsCatalogPromise = workoutTemplateApi
      .getMetricsCatalog()
      .then((res) => {
        metricsCatalogCache = res.data.data || [];
        return metricsCatalogCache;
      })
      .catch(() => {
        metricsCatalogPromise = null;
        return [];
      });
  }
  return metricsCatalogPromise;
}

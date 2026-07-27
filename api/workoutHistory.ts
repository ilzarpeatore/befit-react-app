import apiClient from './client';

export interface WorkoutSet {
  reps: string;
  weight: string;
  time?: string;
}

export interface StoreWorkoutExercisePayload {
  workout_id: number;
  exercise_id: number;
  sets: WorkoutSet[];
  date: string;
}

export interface WorkoutExerciseHistoryItem {
  id: number;
  workout_id: number;
  exercise_id: number;
  date: string;
  sets: WorkoutSet[];
}

export interface WorkoutExerciseHistoryResponse {
  data: WorkoutExerciseHistoryItem[];
  pagination: {
    total_items: number;
    per_page: number;
    current_page: number;
    total_pages: number;
  };
}

export interface CalendarMonthWorkout {
  assignment_id: number; // = program_day_assignment_id
  id: number; // = workout_template_id
  title: string | null;
}

export interface CalendarMonthDay {
  date: string;
  in_month: boolean;
  workouts: CalendarMonthWorkout[];
}

export interface CalendarDayExercise {
  id: number; // workout_template_exercise_id
  exercise_id: number;
  title: string | null;
  video_url: string | null;
  exercise_image: string | null;
  sets: Record<string, any>; // prescribed values merged with overrides/progression, e.g. { series: 3, reps: 10, carga: 50 }
  coach_notes: string | null;
  enabled_metrics: string[];
  last_performance: { sets: Record<string, any>[] } | null;
  sequence: number;
}

export interface CalendarDayBlock {
  block_id: number;
  title: string;
  order: number;
  exercises: CalendarDayExercise[];
}

export interface CalendarDayDetail {
  workout_day_id: number; // = program_day_assignment_id
  sequence: number;
  is_rest: number;
  blocks: CalendarDayBlock[];
}

/** @deprecated old placeholder shape, kept only so any stale references still typecheck */
export interface CalendarDayItem {
  id: number;
  date: string;
  workout_id: number;
  title: string;
  workout_image: string;
}

export const workoutHistoryApi = {
  storeWorkoutExercise: (payload: StoreWorkoutExercisePayload) =>
    apiClient.post('v1/store-user-workout-exercise', payload),

  getWorkoutExerciseHistory: (params: {
    workout_id?: number;
    exercise_id?: number;
    page?: number;
  }) =>
    apiClient.get<WorkoutExerciseHistoryResponse>('v1/get-user-workout-exercise', { params }),

  getWorkoutDayExercise: (params: { workout_day_id: number; exercise_id: number }) =>
    apiClient.get('v1/workoutday-exercise-list', { params }),

  getMyCalendar: (month: number, year: number) =>
    apiClient.get<{ data: { days: CalendarMonthDay[] } }>('v1/my-calendar', { params: { month, year } }),

  getMyCalendarDayDetail: (programDayAssignmentId: number) =>
    apiClient.get<{ data: CalendarDayDetail }>('v1/my-calendar-day-detail', { params: { program_day_assignment_id: programDayAssignmentId } }),

  logCalendarSets: (payload: {
    workout_template_exercise_id: number;
    logged_sets: Record<string, any>[];
    program_day_assignment_id?: number | null;
  }) => apiClient.post('v1/my-calendar-log-sets', payload),
};

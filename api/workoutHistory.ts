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

export interface CalendarDayItem {
  id: number;
  date: string;
  workout_id: number;
  title: string;
  workout_image: string;
}

export interface CalendarDayDetail {
  id: number;
  date: string;
  workout_id: number;
  title: string;
  exercises: {
    id: number;
    exercise_id: number;
    title: string;
    sets: { reps: string; weight: string }[];
  }[];
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
    apiClient.get<{ data: CalendarDayItem[] }>('v1/my-calendar', { params: { month, year } }),

  getMyCalendarDayDetail: (programDayAssignmentId: number) =>
    apiClient.get<{ data: CalendarDayDetail }>('v1/my-calendar-day-detail', { params: { program_day_assignment_id: programDayAssignmentId } }),

  logCalendarSets: (calendar_id: number, sets: WorkoutSet[]) =>
    apiClient.post('v1/my-calendar-log-sets', { calendar_id, sets }),
};

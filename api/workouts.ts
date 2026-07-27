import apiClient from './client';

export interface WorkoutListItem {
  id: number;
  title: string;
  status: string;
  is_premium: number;
  level_id: number;
  level_title: string;
  level_rate: number;
  workout_image: string;
  workout_type_id: number;
  workout_type_title: string;
  is_favourite: number;
  description: string;
}

export interface WorkoutListResponse {
  data: WorkoutListItem[];
  pagination: {
    total_items: number;
    per_page: number;
    current_page: number;
    total_pages: number;
  };
}

export interface WorkoutDayExercise {
  id: number;
  exercise_id: number;
  workout_day_id: number;
  sequence: number;
  sets: string;
  reps: string;
  rest: string;
  time: string;
  exercise: {
    id: number;
    title: string;
    exercise_image: string;
    video_url: string;
    bodypart_name: { id: number; title: string }[];
    sets: { reps: string; rest: string; time: string; weight: string }[];
  };
}

export interface WorkoutDetailResponse {
  data: {
    id: number;
    title: string;
    status: string;
    is_premium: number;
    level_id: number;
    level_title: string;
    workout_image: string;
    workout_type_id: number;
    workout_type_title: string;
    description: string;
    is_favourite: number;
    workout_day: {
      id: number;
      workout_id: number;
      sequence: number;
      is_rest: number;
      day_title: string;
    }[];
  };
}

export const workoutsApi = {
  getList: (page: number = 1) =>
    apiClient.get<WorkoutListResponse>(`workout-list?page=${page}`),

  getFilteredList: (params: { workout_type_id?: number; level_ids?: number; page?: number }) =>
    apiClient.get<WorkoutListResponse>('workout-list', { params }),

  getDetail: (id: number) =>
    apiClient.get<WorkoutDetailResponse>(`workout-detail?id=${id}`),

  getDayExercises: (workoutDayId: number) =>
    apiClient.get<{ data: WorkoutDayExercise[] }>(`workoutday-exercise-list?workout_day_id=${workoutDayId}`),

  setFavourite: (workoutId: number) =>
    apiClient.post('set-favourite-workout', { workout_id: workoutId }),

  getFavourite: (page: number = 1) =>
    apiClient.get<WorkoutListResponse>(`get-favourite-workout?page=${page}`),

  getAssigned: (page: number = 1) =>
    apiClient.get<WorkoutListResponse>(`v1/assign-workout-list?page=${page}`),

  getTypes: (page: number = 1) =>
    apiClient.get(`workouttype-list?page=${page}`),

  getLevels: (page: number = 1) =>
    apiClient.get<{ data: { id: number; title: string }[] }>(`level-list?page=${page}`),
};

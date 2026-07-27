import apiClient from './client';

export interface ExerciseItem {
  id: number;
  title: string;
  status: string;
  is_premium: number;
  exercise_image: string;
  video_type: string;
  video_url: string;
  bodypart_name: { id: number; title: string; bodypart_image: string }[];
  duration: string;
  sets: { reps: string; rest: string; time: string; weight: string }[];
  equipment_id: number;
  equipment_title: string;
  level_id: number;
  level_title: string;
  instruction: string;
  tips: string;
  type: string;
  based: string;
}

export interface Pagination {
  total_items: number;
  per_page: number;
  currentPage: number;
  totalPages: number;
}

export interface ExerciseListResponse {
  data: ExerciseItem[];
  pagination: Pagination;
}

export interface BodyPartItem {
  id: number;
  title: string;
  bodypart_image: string;
}

export interface EquipmentItem {
  id: number;
  title: string;
  equipment_image: string;
}

export interface LevelItem {
  id: number;
  title: string;
}

export const exercisesApi = {
  getList: (page: number = 1) =>
    apiClient.get<ExerciseListResponse>(`exercise-list?page=${page}`),

  getByBodyPart: (bodyPartId: number, page: number = 1) =>
    apiClient.get<ExerciseListResponse>(`exercise-list?bodypart_id=${bodyPartId}&page=${page}`),

  getByEquipment: (equipmentId: number, page: number = 1) =>
    apiClient.get<ExerciseListResponse>(`exercise-list?equipment_id=${equipmentId}&page=${page}`),

  getByLevel: (levelId: number, page: number = 1) =>
    apiClient.get<ExerciseListResponse>(`exercise-list?level_ids=${levelId}&page=${page}`),

  search: (title: string, page: number = 1) =>
    apiClient.get<ExerciseListResponse>(`exercise-list?title=${encodeURIComponent(title)}&page=${page}`),

  getDetail: (id: number) =>
    apiClient.get<{ data: ExerciseItem & { equipment_image: string; seconds_per_rep: number } }>(`exercise-detail?id=${id}`),

  getUserExercises: (page: number = 1) =>
    apiClient.get<ExerciseListResponse>(`get-user-exercise?page=${page}`),

  getBodyParts: (page: number = 1) =>
    apiClient.get<{ data: BodyPartItem[]; pagination: Pagination }>(`bodypart-list?page=${page}`),

  getEquipment: (page: number = 1) =>
    apiClient.get<{ data: EquipmentItem[]; pagination: Pagination }>(`equipment-list?page=${page}`),

  getLevels: (page: number = 1) =>
    apiClient.get<{ data: LevelItem[]; pagination: Pagination }>(`level-list?page=${page}`),
};

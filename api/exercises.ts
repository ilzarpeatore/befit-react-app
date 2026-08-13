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
  exercise_type: string | null;
  exercise_type_label: string | null;
  based: string;
}

/** Categoría de entrenamiento (filtro nuevo) — lista fija, no viene de un endpoint. */
export const EXERCISE_TYPES: { id: string; title: string }[] = [
  { id: 'fuerza', title: 'Fuerza' },
  { id: 'movilidad', title: 'Movilidad' },
  { id: 'pliometria', title: 'Pliometría' },
  { id: 'metabolico', title: 'Metabólico' },
  { id: 'cardio', title: 'Cardio' },
];

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

  getByExerciseType: (exerciseType: string, page: number = 1) =>
    apiClient.get<ExerciseListResponse>(`exercise-list?exercise_type=${encodeURIComponent(exerciseType)}&page=${page}`),

  search: (title: string, page: number = 1) =>
    apiClient.get<ExerciseListResponse>(`exercise-list?title=${encodeURIComponent(title)}&page=${page}`),

  // Version flexible (titulo + grupo muscular + pagina, cualquier
  // combinacion) para el buscador de "Anadir ejercicio" de la sesion, que
  // antes solo pedia la pagina 1 con per_page por defecto (10) sin scroll
  // infinito ni filtro de grupo muscular.
  getFilteredList: (params: { title?: string; bodypart_id?: number; exercise_type?: string; page?: number; per_page?: number }) =>
    apiClient.get<ExerciseListResponse>('exercise-list', { params }),

  getDetail: (id: number) =>
    apiClient.get<{ data: ExerciseItem & { equipment_image: string; seconds_per_rep: number } }>(`exercise-detail?id=${id}`),

  getUserExercises: (page: number = 1) =>
    apiClient.get<ExerciseListResponse>(`get-user-exercise?page=${page}`),

  getBodyParts: (page: number = 1, per_page: number = 50) =>
    apiClient.get<{ data: BodyPartItem[]; pagination: Pagination }>(`bodypart-list?page=${page}&per_page=${per_page}`),

  getEquipment: (page: number = 1) =>
    apiClient.get<{ data: EquipmentItem[]; pagination: Pagination }>(`equipment-list?page=${page}`),

  getLevels: (page: number = 1) =>
    apiClient.get<{ data: LevelItem[]; pagination: Pagination }>(`level-list?page=${page}`),
};

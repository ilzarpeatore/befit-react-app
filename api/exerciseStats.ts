import apiClient from './client';

export interface TopExerciseItem {
  exercise_id: number;
  title: string;
  image: string | null;
  sessions: number;
  sets: number;
}

export interface PersonalRecordItem {
  exercise_id: number;
  title: string;
  image: string | null;
  max_weight: number;
  /** Repeticiones logradas en la serie que marcó el récord de max_weight (null si no se pudo determinar). */
  max_reps: number | null;
  max_1rm: number;
  achieved_at: string | null;
}

export const exerciseStatsApi = {
  // Ranking de ejercicios por frecuencia en una ventana de dias — pantalla
  // "Ejercicios principales". Con body_part_id, el backend no recorta al
  // `limit` — devuelve todos los que coincidan con ese musculo.
  getMyTopExercises: (days: number = 30, endDate?: string, limit: number = 20, bodyPartId?: number) =>
    apiClient.get<{ data: TopExerciseItem[] }>('v1/my-top-exercises', {
      params: { days, end_date: endDate, limit, body_part_id: bodyPartId },
    }),

  // Ranking de marcas personales (peso maximo + 1RM estimado Epley) de
  // todos los ejercicios del cliente — pantalla "Marcas personales".
  // Ordenado por fecha de logro mas reciente. Con body_part_id, el backend
  // filtra por el body_part primario del ejercicio.
  getMyPersonalRecords: (bodyPartId?: number) =>
    apiClient.get<{ data: PersonalRecordItem[] }>('my-personal-records', {
      params: bodyPartId ? { body_part_id: bodyPartId } : undefined,
    }),
};

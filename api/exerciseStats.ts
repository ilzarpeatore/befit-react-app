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
  max_1rm: number;
  achieved_at: string | null;
}

export const exerciseStatsApi = {
  // Ranking de ejercicios por frecuencia en una ventana de dias — pantalla
  // "Ejercicios principales".
  getMyTopExercises: (days: number = 30, endDate?: string, limit: number = 20) =>
    apiClient.get<{ data: TopExerciseItem[] }>('v1/my-top-exercises', {
      params: { days, end_date: endDate, limit },
    }),

  // Ranking de marcas personales (peso maximo + 1RM estimado Epley) de
  // todos los ejercicios del cliente — pantalla "Marcas personales".
  getMyPersonalRecords: () => apiClient.get<{ data: PersonalRecordItem[] }>('my-personal-records'),
};

import apiClient from './client';
import { ApiMessageResponse } from './types';

// Pantalla de Detalle de Ejercicio (4 pestañas). Ver docs/pantalla ejercicio.md
// Backend: app/Http/Controllers/API/ExerciseInfoController.php + ExerciseFeedbackController.php

export interface ExerciseMuscle {
  name: string;
  icon_url: string | null;
}

export interface ExerciseDetailData {
  id: number;
  title: string;
  media_url: string | null;
  media_type: 'video' | 'image' | null;
  /** Siempre una imagen renderizable (miniatura de YouTube si el media es vídeo) — no hay reproductor de vídeo en la app todavía. */
  thumbnail_url: string | null;
  is_popular: boolean;
  muscle: {
    primary: ExerciseMuscle | null;
    secondary: ExerciseMuscle[];
  };
  instructions: {
    steps: string[];
    tips: string[];
  };
  equipment: { name: string; image_url: string | null } | null;
  user_feedback: 'like' | 'dislike' | null;
}

export interface ExerciseAnalysisSet {
  set_number?: number;
  [metricKey: string]: any;
}

export interface ExerciseAnalysisSession {
  date: string;
  workout_title: string | null;
  sets: ExerciseAnalysisSet[];
  prs_this_session: string[];
}

export interface ExerciseAnalysisData {
  exercise_id: number;
  total_sessions: number;
  sessions: ExerciseAnalysisSession[];
}

export const exerciseInfoApi = {
  getDetail: (id: number) =>
    apiClient.get<{ data: ExerciseDetailData }>('v1/exercise-detail', { params: { id } }),

  getAnalysis: (exerciseId: number) =>
    apiClient.get<{ data: ExerciseAnalysisData }>('v1/exercise-analysis', { params: { exercise_id: exerciseId } }),

  sendFeedback: (exerciseId: number, feedback: 'like' | 'dislike' | null) =>
    apiClient.post<ApiMessageResponse>('v1/exercise-feedback', { exercise_id: exerciseId, feedback }),
};

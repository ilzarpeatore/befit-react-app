import apiClient from './client';

export interface PeriodStats {
  sessionsCount: number;
  durationSeconds: number;
  volumeKg: number;
}

export interface MonthlySessionItem {
  date: string;
  duration_seconds: number;
  volume_kg: number;
  title: string;
}

export interface MonthlyPrEvent {
  exercise_id: number;
  title: string;
  record_type: 'max_weight' | 'max_1rm' | 'max_volume';
  value: number;
  achieved_at: string | null;
}

export interface MonthlyExtras {
  sessions: MonthlySessionItem[];
  prEvents: MonthlyPrEvent[];
}

export interface AdherenceDay {
  date: string;
  completed: boolean;
}

// 'program': el cliente tiene un TrainingProgram real asignado — hay ratio
// de cumplimiento real (programado vs completado), igual que un hábito con
// objetivo. 'freeform': sin programa asignado (mayoría de clientes free) —
// no hay nada "programado" con qué comparar, solo racha + conteo de
// sesiones reales.
export interface AdherenceProgram {
  mode: 'program';
  scheduledCount: number;
  completedCount: number;
  ratio: number | null;
  currentStreak: number;
  periodDays: number;
  days: AdherenceDay[];
}

export interface AdherenceFreeform {
  mode: 'freeform';
  sessionsCount: number;
  daysActive: number;
  currentStreak: number;
  periodDays: number;
}

export type Adherence = AdherenceProgram | AdherenceFreeform;

export const statisticsApi = {
  // KPIs de sesion (entrenamientos/duracion/volumen) en una ventana de `days`
  // terminando en `endDate` (hoy si se omite) — usado por el grid 2x2 de la
  // sub-pantalla "Distribución de los músculos" para comparar periodo actual
  // vs anterior.
  getMyPeriodStats: (days: number, endDate?: string) =>
    apiClient.get<{ data: PeriodStats }>('v1/my-period-stats', { params: { days, end_date: endDate } }),

  // Sesiones completadas + PRs conseguidos en un mes de calendario concreto
  // (year/month, 1-12) — pantalla "Informe mensual".
  getMyMonthlyExtras: (year: number, month: number) =>
    apiClient.get<{ data: MonthlyExtras }>('v1/my-monthly-extras', { params: { year, month } }),

  // Adherencia de entrenamiento (racha + % cumplimiento) — pantalla Report.
  getMyAdherence: (days: number = 30) =>
    apiClient.get<{ data: Adherence }>('my-workout-adherence', { params: { days } }),
};

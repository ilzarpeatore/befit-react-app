import apiClient from './client';

// Motor de Auto-Regulación de Carga — Fase 4, readiness score (2026-08-12).
// El endpoint POST /api/health-data-points/sync ya existía en el backend
// (HealthDataPointController::sync) pero nada en la app lo llamaba todavía
// — este es el primer wrapper. Payload real verificado contra el
// controlador: { readings: [{ source, metric_type, value, recorded_date }] }.

export type HealthDataSource = 'apple_health' | 'google_health' | 'manual';
export type HealthMetricType = 'hrv' | 'sleep_hours' | 'resting_hr' | 'steps';

export interface HealthReading {
  source: HealthDataSource;
  metric_type: HealthMetricType;
  value: number;
  recorded_date: string; // YYYY-MM-DD
}

export const healthApi = {
  // Idempotente en el backend (unique client_id+source+metric_type+recorded_date,
  // updateOrCreate) — llamar varias veces el mismo día actualiza, no duplica.
  sync: (readings: HealthReading[]) => apiClient.post('health-data-points/sync', { readings }),
};

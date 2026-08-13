import apiClient from './client';

// Espejo exacto del schema real de `pain_reports` (ver
// docs/Motor_Auto_Regulacion_Carga_Instalacion.md §pain_reports). El backend
// ya existe y funciona (POST /api/sessions/{id}/pain-report) — este archivo
// es la primera vez que la app lo llama.
export type PainReportTipo = 'molestia_leve' | 'dolor_agudo' | 'dolor_que_empeora_durante_sesion';

export type PainReportMomento = 'al_iniciar' | 'durante_ejecucion' | 'al_finalizar' | 'al_dia_siguiente';

export interface PainReportPayload {
  exercise_id: number;
  set_number?: number;
  tipo: PainReportTipo;
  localizacion: string;
  intensidad: number; // 1-5
  momento: PainReportMomento;
}

export interface PainReport {
  id: number;
  client_id: number;
  exercise_id: number;
  tipo: PainReportTipo;
  intensidad: number;
  localizacion: string;
  momento: PainReportMomento;
  [key: string]: any;
}

// Misma condición ya implementada en el backend (SessionInterpretationService
// / evento PainAlertRaised, ver docs/Plan_Implementacion_Fases.md §1.3): si
// se cumple, el backend YA notifica al coach y genera la excepción interna
// por su cuenta — esto solo replica la condición para decidir qué mensaje
// mostrarle al cliente tras enviar, no dispara nada por sí misma.
export function blocksProgression(tipo: PainReportTipo, intensidad: number): boolean {
  return tipo !== 'molestia_leve' || intensidad >= 4;
}

export const painReportsApi = {
  // {id} identifica la sesión exactamente como ya hacen finishSession()/
  // logSets() en el backend: program_day_assignment_id por defecto, o
  // workout_template_id cuando isWorkoutTemplate=true (workout suelto sin
  // programa) — misma fuente de verdad que ya usa la pantalla de sesión.
  report: (sessionId: number, payload: PainReportPayload, isWorkoutTemplate?: boolean) =>
    apiClient.post<{ data: PainReport }>(`sessions/${sessionId}/pain-report`, {
      ...payload,
      is_workout_template: isWorkoutTemplate || undefined,
    }),
};

import apiClient from './client';

// Motor de Auto-Regulación de Carga — modo vida real, trigger del cliente
// (2026-08-12). El backend ya existía para el flujo coach (generate/approve,
// ver docs/Motor_Auto_Regulacion_Carga_Instalacion.md §8) — este es el
// primer wrapper del lado cliente, para POST adaptive-week-plans/request-unavailable.
// Sigue naciendo `propuesto`: requiere aprobación del coach antes de
// reflejarse en el calendario real (mismo criterio "siempre sugerido" que
// el resto del motor).

export interface AdaptiveWeekPlan {
  id: number;
  client_id: number;
  original_week_start: string;
  sessions_available: number;
  priorizacion: string;
  status: 'propuesto' | 'aprobado';
  details: {
    reduction_needed: boolean;
    sessions_total: number;
    sessions_kept: number[];
    sessions_dropped: number[];
  };
  [key: string]: any;
}

export const adaptiveWeekPlansApi = {
  // week_start: lunes de la semana ISO a la que pertenecen los assignmentIds.
  // Todos los ids deben caer dentro de esa misma semana calendario — si el
  // cliente marca días de varias semanas, la pantalla debe llamar a esto
  // una vez por semana (ver my_program_calendar_screen.tsx).
  requestUnavailable: (weekStart: string, unavailableAssignmentIds: number[]) =>
    apiClient.post<{ data: AdaptiveWeekPlan }>('adaptive-week-plans/request-unavailable', {
      week_start: weekStart,
      unavailable_assignment_ids: unavailableAssignmentIds,
    }),

  // Reorganizar entrenamientos de la semana en curso (mover de día). Mismo
  // criterio "siempre propuesto" que requestUnavailable -- construye la
  // solicitud del lado cliente, el coach la aprueba antes de que se refleje
  // en el calendario real. moves: un par {assignment_id, to_date} por cada
  // entrenamiento que el cliente quiere mover dentro de esa misma semana.
  requestReorder: (weekStart: string, moves: { assignmentId: number; toDate: string }[]) =>
    apiClient.post<{ data: AdaptiveWeekPlan }>('adaptive-week-plans/request-reorder', {
      week_start: weekStart,
      moves: moves.map((m) => ({ assignment_id: m.assignmentId, to_date: m.toDate })),
    }),
};

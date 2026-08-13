import apiClient from './client';

// Motor de Auto-Regulación de Carga (Fase 2) — consumo de solo lectura,
// lado cliente, de las sugerencias de carga ya calculadas por el motor
// (SessionProgressionRuleEngine, backend). Reutiliza el mismo endpoint que
// ya usa progressionHistory() del panel de coach/admin
// (GET /exercises/{id}/progression-history?client_id=), que YA permite
// acceso "self" (el propio cliente consultando sus datos, ver
// SessionProgressionRuleController::progressionHistory -- $isSelf).
// No existe (todavia) un endpoint dedicado solo-sugerencia-pendiente para
// cliente: /clients/{id}/pending-suggestions es exclusivo de coach
// (requireCoach), así que se reusa este y se filtra en el cliente.

export interface NextSessionTargetItem {
  id: number;
  client_id: number;
  exercise_id: number;
  rule_id: number | null;
  proposed_weight: number | null;
  proposed_reps: number | null;
  status: 'aplicado' | 'pendiente' | 'rechazado';
  generated_at: string;
  resolved_at: string | null;
}

export interface ProgressionHistoryResponse {
  metrics: any[];
  targets: NextSessionTargetItem[];
}

export interface LoadSuggestion {
  weight: number | null;
  reps: number | null;
}

export const loadSuggestionApi = {
  getProgressionHistory: (exerciseId: number, clientId: number) =>
    apiClient.get<{ data: ProgressionHistoryResponse }>(`exercises/${exerciseId}/progression-history`, {
      params: { client_id: clientId },
    }),
};

/**
 * De la lista de targets (orden ascendente por generated_at, tal como los
 * devuelve el backend), la sugerencia PENDIENTE mas reciente para este
 * ejercicio -- todavia no aprobada por el coach, por eso no esta ya
 * reflejada en `prescribed` (eso solo pasa cuando el motor la aplica
 * automaticamente o el coach la aprueba, via ClientExerciseOverride).
 * null si no hay ninguna pendiente (caso normal: sin regla en modo
 * sugerido, o ya resuelta).
 */
export function pickPendingSuggestion(targets: NextSessionTargetItem[] | undefined | null): LoadSuggestion | null {
  if (!targets || targets.length === 0) return null;
  for (let i = targets.length - 1; i >= 0; i--) {
    const t = targets[i];
    if (t.status === 'pendiente' && (t.proposed_weight != null || t.proposed_reps != null)) {
      return { weight: t.proposed_weight ?? null, reps: t.proposed_reps ?? null };
    }
  }
  return null;
}

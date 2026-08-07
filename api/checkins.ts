import apiClient from './client';
import { ApiMessageResponse } from './types';

export type CheckInQuestionType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'scale'
  | 'yes_no'
  | 'date'
  | 'multiple_choice'
  | 'media'
  | 'progress_photos'
  | 'star_rating'
  | 'metric'
  | 'signature';

// media/progress_photos/signature no tienen renderer en la app todavía (ver
// checkin_fill_screen.tsx) - ninguna pregunta real hoy los marca obligatorios,
// se muestran como "completar desde otro medio" en vez de bloquear el envío.
export const UNSUPPORTED_QUESTION_TYPES: CheckInQuestionType[] = ['media', 'progress_photos', 'signature'];

export interface CheckInQuestion {
  id: number;
  form_id: number;
  question_text: string;
  type: CheckInQuestionType;
  order: number;
  is_required: boolean;
  options: string[] | null;
  max_files: number | null;
  metric_id: number | null;
  metric?: { id: number; key: string; label: string; unit: string | null } | null;
  sync_type: string | null;
  allow_multiple: boolean;
  placeholder: string | null;
  scale_max: number;
  star_max: number;
}

export interface CheckInForm {
  id: number;
  title: string;
  description: string | null;
  recurrence: 'daily' | 'weekly' | 'monthly' | null;
  questions?: CheckInQuestion[];
}

export interface CheckInAssignment {
  id: number;
  form_id: number;
  client_id: number;
  active: boolean;
  form: CheckInForm;
  submitted: boolean;
  submitted_at: string | null;
  latest_submission_id: number | null;
  is_due: boolean;
}

export interface CheckInAnswerInput {
  form_question_id: number;
  answer_value: string | string[] | null;
}

const RECURRENCE_LABEL: Record<string, string> = {
  daily: 'Check-in diario',
  weekly: 'Check-in semanal',
  monthly: 'Check-in mensual',
};

export function checkinTypeLabel(a: CheckInAssignment): string {
  return a.form.recurrence ? RECURRENCE_LABEL[a.form.recurrence] ?? 'Check-in' : 'Cuestionario';
}

export const checkinsApi = {
  // ?kind=questionnaire | checkin filtra por tipo; sin filtro trae ambos.
  getAssignedList: (kind?: 'questionnaire' | 'checkin') =>
    apiClient.get<{ data: CheckInAssignment[] }>('form-assigned-list', { params: kind ? { kind } : undefined }),

  getFormDetail: (id: number) => apiClient.get<{ data: CheckInForm }>('form-detail', { params: { id } }),

  submit: (formAssignmentId: number, answers: CheckInAnswerInput[]) =>
    apiClient.post<ApiMessageResponse>('form-submit', { form_assignment_id: formAssignmentId, answers }),
};

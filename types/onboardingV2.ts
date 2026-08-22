// Tipos del nuevo onboarding (4 etapas: datos personales, PAR-Q, cuestionario
// de entrenamiento, cuestionario de nutrición). Ver docs/ONBOARDING_V2.md
// para el contrato completo de preguntas + endpoints.

export type OnboardingStageId = 'personal_data' | 'par_q' | 'training_questionnaire' | 'nutrition_questionnaire';

export interface OnboardingStageMeta {
  id: OnboardingStageId;
  label: string;
}

export const ONBOARDING_STAGES: OnboardingStageMeta[] = [
  { id: 'personal_data', label: 'Datos personales' },
  { id: 'par_q', label: 'PAR-Q' },
  { id: 'training_questionnaire', label: 'Entrenamiento' },
  { id: 'nutrition_questionnaire', label: 'Nutrición' },
];

export interface OnboardingOption {
  value: string;
  label: string;
  subtitle?: string;
  icon?: string; // nombre de icono Ionicons, o un emoji si `emoji` es true
  emoji?: boolean;
}

export type OnboardingQuestionType =
  | 'name'
  | 'single_choice'
  | 'ruler'
  | 'number_wheel'
  | 'scale'
  | 'text'
  | 'textarea';

interface OnboardingQuestionBase {
  id: string;
  stage: OnboardingStageId;
  type: OnboardingQuestionType;
  title: string;
  subtitle?: string;
  required?: boolean; // por defecto true
}

export interface NameQuestion extends OnboardingQuestionBase {
  type: 'name';
}

export interface SingleChoiceQuestion extends OnboardingQuestionBase {
  type: 'single_choice';
  options: OnboardingOption[];
}

export interface RulerQuestion extends OnboardingQuestionBase {
  type: 'ruler';
  min: number;
  max: number;
  decimals: 0 | 1;
  defaultValue: number;
  units: { value: string; label: string; toBase: (v: number) => number; fromBase: (v: number) => number }[];
}

export interface NumberWheelQuestion extends OnboardingQuestionBase {
  type: 'number_wheel';
  min: number;
  max: number;
  step?: number;
  defaultValue: number;
  suffix?: string; // ej. "días", "meses"
}

export interface ScaleQuestion extends OnboardingQuestionBase {
  type: 'scale';
  min: number;
  max: number;
}

export interface TextQuestion extends OnboardingQuestionBase {
  type: 'text';
  placeholder?: string;
}

export interface TextAreaQuestion extends OnboardingQuestionBase {
  type: 'textarea';
  placeholder?: string;
}

export type OnboardingQuestion =
  | NameQuestion
  | SingleChoiceQuestion
  | RulerQuestion
  | NumberWheelQuestion
  | ScaleQuestion
  | TextQuestion
  | TextAreaQuestion;

export type OnboardingAnswerValue =
  | string
  | number
  | boolean
  | { first_name: string; last_name: string }
  | { value: number; unit: string }
  | undefined;

export type OnboardingAnswers = Record<string, OnboardingAnswerValue>;

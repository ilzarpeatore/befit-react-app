// Catálogo de los retos "esenciales" del tutorial guiado — ver docs/TAREAS.md
// para el resto de la lista ("descubre más", no implementada todavía).
//
// Cada reto tiene un único paso activo: apunta a un elemento real de la app
// (targetId, registrado por <TutorialTarget id=.../> en la pantalla donde
// vive) y se completa cuando ocurre la acción real correspondiente
// (completion), nunca por un botón "Siguiente" -- el usuario tiene que
// usar la app de verdad. Un paso sin targetId muestra un aviso flotante
// en vez de un spotlight (para acciones que no tienen un único elemento
// fijo que señalar, ej. elegir cualquier hábito de una lista dinámica).

export type TutorialCompletion =
  | { type: 'navigate'; screen: string }
  | { type: 'action'; actionId: string };

export interface TutorialStep {
  targetId?: string;
  title: string;
  text: string;
  completion: TutorialCompletion;
}

export interface TutorialChallenge {
  id: string;
  label: string;
  steps: TutorialStep[];
}

export const TUTORIAL_CHALLENGES: TutorialChallenge[] = [
  {
    id: 'access-workout',
    label: 'Accede a tu entrenamiento de hoy',
    steps: [
      {
        targetId: 'home-today-workout-card',
        title: 'Tu entrenamiento de hoy',
        text: 'Toca esta tarjeta para abrir el entrenamiento que te toca hoy.',
        completion: { type: 'navigate', screen: 'MigratedWorkoutPreview' },
      },
    ],
  },
  {
    id: 'log-first-set',
    label: 'Registra tu primera serie',
    steps: [
      {
        targetId: 'workout-session-first-set-toggle',
        title: 'Marca una serie como hecha',
        text: 'Cuando termines una serie, toca este círculo para registrarla.',
        completion: { type: 'action', actionId: 'workout_set_logged' },
      },
    ],
  },
  {
    id: 'add-habit',
    label: 'Añade un nuevo hábito',
    steps: [
      {
        targetId: 'habits-add-button',
        title: 'Añade un hábito',
        text: 'Toca aquí para elegir un hábito de la biblioteca o crear uno propio.',
        completion: { type: 'navigate', screen: 'MigratedHabitAdd' },
      },
      {
        title: 'Elige o crea tu hábito',
        text: 'Elige uno de la biblioteca, o crea el tuyo desde la pestaña "Crear".',
        completion: { type: 'action', actionId: 'habit_added' },
      },
    ],
  },
  {
    id: 'mark-habit-done',
    label: 'Marca un hábito como hecho',
    steps: [
      {
        targetId: 'habit-toggle-first',
        title: 'Marca tu hábito de hoy',
        text: 'Toca el círculo para marcar este hábito como hecho hoy.',
        completion: { type: 'action', actionId: 'habit_marked_done' },
      },
    ],
  },
  {
    id: 'access-nutrition-plan',
    label: 'Accede a tu plan de nutrición',
    steps: [
      {
        targetId: 'home-nutrition-link',
        title: 'Tu plan de nutrición',
        text: 'Toca aquí para ver las comidas de hoy.',
        completion: { type: 'navigate', screen: 'MigratedPlan' },
      },
    ],
  },
  {
    id: 'mark-meal-done',
    label: 'Marca una comida como realizada',
    steps: [
      {
        targetId: 'plan-meal-toggle-first',
        title: 'Marca tu comida',
        text: 'Toca el círculo cuando termines una comida de tu plan.',
        completion: { type: 'action', actionId: 'meal_marked_done' },
      },
    ],
  },
  {
    id: 'complete-checkin',
    label: 'Rellena tu check-in de preparación',
    steps: [
      {
        targetId: 'home-checkin-card',
        title: 'Check-in de preparación',
        text: 'Rellena este formulario para que tu coach sepa cómo llegas al entrenamiento.',
        completion: { type: 'action', actionId: 'checkin_submitted' },
      },
    ],
  },
];

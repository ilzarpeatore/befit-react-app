import apiClient from './client';

export interface DashboardResponse {
  data: DashboardData;
}

export interface DashboardData {
  workout: WorkoutSummary;
  diet: DietSummary;
  steps: StepsSummary;
  water: WaterSummary;
  weekly_activity: WeeklyActivity[];
  // Ya lo devolvia el backend (DashboardController::dashboard) sin que el
  // frontend lo leyera -- ver banner condicional de la cabecera Home v2
  // (docs/Nueva_Cabecera_Home_Helix.md, seccion 2, Estado B).
  banner_slider?: BannerSliderItem[];
}

export interface BannerSliderItem {
  id: number;
  title: string;
  slug: string;
  type: 'url' | 'workout';
  workout_id: number | null;
  url: string | null;
  bannerslider_image: string | null;
  created_at: string;
  updated_at: string;
}

export interface WorkoutSummary {
  total_workout: number;
  totalExercise: number;
  totalDuration: number;
  totalCalories: number;
  weeklyWorkout: number[];
}

export interface DietSummary {
  daily_kcal: number;
  eaten: number;
  left: number;
  protein: number;
  carbs: number;
  fats: number;
}

export interface StepsSummary {
  total: number;
  goal: number;
}

export interface WaterSummary {
  total: number;
  goal: number;
}

export interface WeeklyActivity {
  day: string;
  value: number;
}

export const dashboardApi = {
  getDashboard: () =>
    apiClient.get<DashboardResponse>('dashboard-detail'),
};

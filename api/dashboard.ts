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

import apiClient from './client';

export interface StepsGoalItem {
  id: number;
  goal_steps: number;
  date: string;
  created_at: string;
}

export interface StepsGraphItem {
  id: number;
  value: string;
  date: string;
}

export const stepsApi = {
  saveGoal: (goal_steps: number) =>
    apiClient.post('user-daily-steps-goal-save', { goal_steps }),

  getGoalList: () =>
    apiClient.get<{ data: StepsGoalItem[] }>('user-daily-steps-goal-list'),

  getGoalListV1: () =>
    apiClient.get<{ data: StepsGraphItem[] }>('v1/user-daily-steps-goal-list'),
};

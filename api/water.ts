import apiClient from './client';
import { ApiMessageResponse } from './types';

export interface WaterGoalItem {
  id: number;
  goal_ml: number;
  date: string;
  created_at: string;
}

export interface WaterGraphItem {
  id: number;
  value: string;
  date: string;
}

export const waterApi = {
  saveGoal: (goal_ml: number) =>
    apiClient.post<ApiMessageResponse>('user-daily-water-goal-save', { goal_ml }),

  getGoalList: () =>
    apiClient.get<{ data: WaterGoalItem[] }>('user-daily-water-goal-list'),

  getGoalListV1: () =>
    apiClient.get<{ data: WaterGraphItem[] }>('v1/user-daily-water-goal-list'),
};

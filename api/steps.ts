import apiClient from './client';
import { ApiMessageResponse } from './types';

export interface StepsGoalItem {
  id: number;
  value: number;
  date: string;
  time: string | null;
  created_at: string;
  updated_at: string;
}

export interface StepsGraphItem {
  id: number;
  value: string;
  date: string;
}

export const stepsApi = {
  saveGoal: (value: number, date: string) =>
    apiClient.post<ApiMessageResponse>('user-daily-steps-goal-save', { value, date }),

  getGoalList: () =>
    apiClient.get<{ data: StepsGoalItem[] }>('user-daily-steps-goal-list'),

  getGoalListV1: () =>
    apiClient.get<{ data: StepsGraphItem[] }>('v1/user-daily-steps-goal-list'),
};

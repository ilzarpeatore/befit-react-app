import apiClient from './client';
import { ApiMessageResponse } from './types';

export interface ReadinessValues {
  sleep_quality: number; // 1-5
  soreness_level: number; // 1-10
  energy_level: number; // 1-5
  stress_level: number; // 1-5
}

export interface ReadinessTodayResponse {
  data: {
    required: boolean;
    submitted_today: boolean;
    today: ReadinessValues | null;
  };
}

export const readinessApi = {
  getToday: () => apiClient.get<ReadinessTodayResponse>('v1/readiness-today'),

  submit: (values: ReadinessValues) => apiClient.post<ApiMessageResponse>('v1/readiness-store', values),
};

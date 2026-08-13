import apiClient from './client';
import { ApiMessageResponse } from './types';

export interface ScheduleItem {
  id: number;
  title: string;
  description: string;
  image: string;
  day: string;
  time: string;
}

export interface ScheduleListResponse {
  data: ScheduleItem[];
  pagination: {
    total_items: number;
    per_page: number;
    current_page: number;
    total_pages: number;
  };
}

export const scheduleApi = {
  getList: (page: number = 1) =>
    apiClient.post<ScheduleListResponse>('class-schedule-list', { page }),

  savePlan: (schedule_id: number, date: string, time: string) =>
    apiClient.post<ApiMessageResponse>('class-schedule-plan-save', { schedule_id, date, time }),
};

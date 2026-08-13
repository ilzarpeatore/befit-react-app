import apiClient from './client';
import { ApiMessageResponse } from './types';

export interface ChatMessage {
  id: number;
  question: string;
  answer: string;
  created_at: string;
  updated_at: string;
}

export const chatApi = {
  getList: () =>
    apiClient.get<{ data: ChatMessage[] }>('chatgpt-fit-bot-list'),

  save: (question: string, answer: string) =>
    apiClient.post<ApiMessageResponse>('chatgpt-fit-bot-save', { question, answer }),

  deleteAll: () =>
    apiClient.post<ApiMessageResponse>('chatgpt-fit-bot-delete'),
};

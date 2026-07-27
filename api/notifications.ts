import apiClient from './client';

export interface NotificationItem {
  id: number;
  read_at: string | null;
  created_at: string;
  data: Record<string, any>;
  image: string | null;
}

export interface NotificationListResponse {
  notification_data: NotificationItem[];
  all_unread_count: number;
}

export const notificationsApi = {
  getList: (page: number = 1) =>
    apiClient.post<NotificationListResponse>('notification-list', { page }),

  markAllRead: () =>
    apiClient.post<NotificationListResponse>('notification-list', { page: 1, type: 'markas_read' }),

  getDetail: (id: number) =>
    apiClient.get<{ data: NotificationItem; all_unread_count: number }>('notification-detail', { params: { id } }),
};

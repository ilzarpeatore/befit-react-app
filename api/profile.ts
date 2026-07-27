import apiClient from './client';

export interface UserProfile {
  id: number;
  age: string;
  weight: string;
  weight_unit: string;
  height: string;
  height_unit: string;
  address: string;
  user_id: number;
  activity: string;
  goal: string;
  macro_type: string;
  carbs_pct: number;
  protein_pct: number;
  fat_pct: number;
}

export interface UserData {
  id: number;
  first_name: string;
  last_name: string;
  display_name: string;
  email: string;
  username: string;
  gender: string;
  status: string;
  user_type: string;
  phone_number: string;
  profile_image: string;
  login_type: string;
  created_at: string;
  updated_at: string;
  user_profile: UserProfile;
  is_subscribe: number;
}

export interface UserResponse {
  data: UserData;
}

export interface GraphItem {
  id: number;
  value: string;
  type: string;
  date: string;
  unit: string;
  created_at: string;
  updated_at: string;
}

export interface GraphListResponse {
  data: GraphItem[];
  pagination: {
    total_items: number;
    per_page: number;
    current_page: number;
    total_pages: number;
  };
}

export const profileApi = {
  getUserDetail: (id: number) =>
    apiClient.get<UserResponse>(`user-detail?id=${id}`),

  updateProfile: (payload: Record<string, any>) =>
    apiClient.post('update-profile', payload),

  saveGraph: (payload: { type: string; value: string; date: string }) =>
    apiClient.post('usergraph-save', payload),

  deleteGraph: (id: number) =>
    apiClient.post('usergraph-delete', { id }),

  getGraphList: (type: string, page: number = 1, duration?: string) =>
    apiClient.get<GraphListResponse>(`usergraph-list?type=${type}&page=${page}${duration ? `&duration=${duration}` : ''}`),

  getGraphDetail: (type: string) =>
    apiClient.get<{ data: GraphItem }>(`usergraph-detail?type=${type}`),
};

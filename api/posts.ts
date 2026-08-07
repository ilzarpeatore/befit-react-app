import apiClient from './client';
import { ApiMessageResponse } from './types';

export interface PostData {
  id: number;
  description: string;
  status: string;
  user_id: number;
  posting_media_array: {
    id: number;
    posting_id: number;
    media_url: string;
    media_type: string;
  }[];
  users: {
    id: number;
    first_name: string;
    last_name: string;
    display_name: string;
    email: string;
    profile_image: string;
  };
  posting_like_count: number;
  posting_comment_count: number;
  can_edit: boolean;
  is_liked: boolean;
  is_bookmark: boolean;
  created_at: string;
}

export interface PostListResponse {
  data: PostData[];
  pagination: {
    total_items: number;
    per_page: number;
    current_page: number;
    total_pages: number;
  };
}

export interface PostComment {
  id: number;
  comment: string;
  user_id: number;
  posting_id: number;
  users: {
    id: number;
    first_name: string;
    last_name: string;
    display_name: string;
    profile_image: string;
  };
  created_at: string;
}

export const postsApi = {
  getList: (page: number = 1, userId?: number) =>
    apiClient.get<PostListResponse>(`userpost-list?page=${page}${userId ? `&user_id=${userId}` : ''}`),

  getDetail: (postId: number) =>
    apiClient.get<{ data: PostData }>(`userpost-detail?id=${postId}`),

  like: (postId: number) =>
    apiClient.post<ApiMessageResponse>('like-userpost', { posting_id: postId }),

  bookmark: (postId: number) =>
    apiClient.post<ApiMessageResponse>('bookmark-userpost', { posting_id: postId }),

  saveComment: (postId: number, comment: string) =>
    apiClient.post<ApiMessageResponse>('save-comment', { posting_id: postId, comment }),

  getComments: (postId: number, page: number = 1) =>
    apiClient.get<{ data: PostComment[] }>(`comment-list?posting_id=${postId}&page=${page}`),

  deletePost: (postId: number) =>
    apiClient.post<ApiMessageResponse>('delete-userpost', { id: postId }),

  report: (postId: number, reason: string) =>
    apiClient.post<ApiMessageResponse>('report-on-posting', { posting_id: postId, reason }),

  getBookmarks: (page: number = 1) =>
    apiClient.get<PostListResponse>(`my-bookmark-post-list?page=${page}`),
};

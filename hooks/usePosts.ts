import { useState, useCallback } from 'react';
import { postsApi } from '../api/posts';

export function usePosts() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getList = useCallback(async (page: number = 1, userId?: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await postsApi.getList(page, userId);
      setData(response.data);
      return response.data;
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Request failed';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getDetail = useCallback(async (postId: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await postsApi.getDetail(postId);
      setData(response.data);
      return response.data;
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Request failed';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const like = useCallback(async (postId: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await postsApi.like(postId);
      setData(response.data);
      return response.data;
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Request failed';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const bookmark = useCallback(async (postId: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await postsApi.bookmark(postId);
      setData(response.data);
      return response.data;
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Request failed';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const saveComment = useCallback(async (postId: number, comment: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await postsApi.saveComment(postId, comment);
      setData(response.data);
      return response.data;
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Request failed';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getComments = useCallback(async (postId: number, page: number = 1) => {
    setLoading(true);
    setError(null);
    try {
      const response = await postsApi.getComments(postId, page);
      setData(response.data);
      return response.data;
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Request failed';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deletePost = useCallback(async (postId: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await postsApi.deletePost(postId);
      setData(response.data);
      return response.data;
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Request failed';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const report = useCallback(async (postId: number, reason: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await postsApi.report(postId, reason);
      setData(response.data);
      return response.data;
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Request failed';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getBookmarks = useCallback(async (page: number = 1) => {
    setLoading(true);
    setError(null);
    try {
      const response = await postsApi.getBookmarks(page);
      setData(response.data);
      return response.data;
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Request failed';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
  }, []);

  return {
    data,
    loading,
    error,
    getList,
    getDetail,
    like,
    bookmark,
    saveComment,
    getComments,
    deletePost,
    report,
    getBookmarks,
    reset,
  };
}

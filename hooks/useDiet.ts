import { useState, useCallback } from 'react';
import { dietApi } from '../api/diet';

export function useDiet() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await dietApi.getDashboard();
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

  const getList = useCallback(async (params: { is_featured?: boolean; categorydiet_id?: number; page?: number }) => {
    setLoading(true);
    setError(null);
    try {
      const response = await dietApi.getList(params);
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

  const search = useCallback(async (title: string, page: number = 1) => {
    setLoading(true);
    setError(null);
    try {
      const response = await dietApi.search(title, page);
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

  const getCategories = useCallback(async (page: number = 1) => {
    setLoading(true);
    setError(null);
    try {
      const response = await dietApi.getCategories(page);
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

  const setFavourite = useCallback(async (dietId: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await dietApi.setFavourite(dietId);
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

  const getFavourite = useCallback(async (page: number = 1) => {
    setLoading(true);
    setError(null);
    try {
      const response = await dietApi.getFavourite(page);
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

  const getDailyPlan = useCallback(async (date: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await dietApi.getDailyPlan(date);
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

  const getRecipeDetail = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await dietApi.getRecipeDetail(id);
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
    getDashboard,
    getList,
    search,
    getCategories,
    setFavourite,
    getFavourite,
    getDailyPlan,
    getRecipeDetail,
    reset,
  };
}

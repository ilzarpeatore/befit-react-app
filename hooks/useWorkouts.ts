import { useState, useCallback } from 'react';
import { workoutsApi } from '../api/workouts';

export function useWorkouts() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getList = useCallback(async (page: number = 1) => {
    setLoading(true);
    setError(null);
    try {
      const response = await workoutsApi.getList(page);
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

  const getFilteredList = useCallback(async (params: { workout_type_id?: number; level_ids?: number; page?: number }) => {
    setLoading(true);
    setError(null);
    try {
      const response = await workoutsApi.getFilteredList(params);
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

  const getDetail = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await workoutsApi.getDetail(id);
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

  const getDayExercises = useCallback(async (workoutDayId: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await workoutsApi.getDayExercises(workoutDayId);
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

  const getTypes = useCallback(async (page: number = 1) => {
    setLoading(true);
    setError(null);
    try {
      const response = await workoutsApi.getTypes(page);
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

  const setFavourite = useCallback(async (workoutId: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await workoutsApi.setFavourite(workoutId);
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
      const response = await workoutsApi.getFavourite(page);
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
    getFilteredList,
    getDetail,
    getDayExercises,
    getTypes,
    setFavourite,
    getFavourite,
    reset,
  };
}

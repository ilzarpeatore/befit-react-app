import { useState, useCallback } from 'react';
import { exercisesApi } from '../api/exercises';

export function useExercises() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getList = useCallback(async (page: number = 1) => {
    setLoading(true);
    setError(null);
    try {
      const response = await exercisesApi.getList(page);
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
      const response = await exercisesApi.getDetail(id);
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

  const getByBodyPart = useCallback(async (bodyPartId: number, page: number = 1) => {
    setLoading(true);
    setError(null);
    try {
      const response = await exercisesApi.getByBodyPart(bodyPartId, page);
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

  const getByEquipment = useCallback(async (equipmentId: number, page: number = 1) => {
    setLoading(true);
    setError(null);
    try {
      const response = await exercisesApi.getByEquipment(equipmentId, page);
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

  const getByLevel = useCallback(async (levelId: number, page: number = 1) => {
    setLoading(true);
    setError(null);
    try {
      const response = await exercisesApi.getByLevel(levelId, page);
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

  const search = useCallback(async (title: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await exercisesApi.search(title);
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

  const getUserExercises = useCallback(async (page: number = 1) => {
    setLoading(true);
    setError(null);
    try {
      const response = await exercisesApi.getUserExercises(page);
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

  const getBodyParts = useCallback(async (page: number = 1) => {
    setLoading(true);
    setError(null);
    try {
      const response = await exercisesApi.getBodyParts(page);
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

  const getEquipment = useCallback(async (page: number = 1) => {
    setLoading(true);
    setError(null);
    try {
      const response = await exercisesApi.getEquipment(page);
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

  const getLevels = useCallback(async (page: number = 1) => {
    setLoading(true);
    setError(null);
    try {
      const response = await exercisesApi.getLevels(page);
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
    getByBodyPart,
    getByEquipment,
    getByLevel,
    search,
    getUserExercises,
    getBodyParts,
    getEquipment,
    getLevels,
    reset,
  };
}

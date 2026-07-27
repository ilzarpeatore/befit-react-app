import { useState, useCallback } from 'react';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export function useApi<T>(apiFn: (...args: any[]) => Promise<{ data: T }>) {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(
    async (...args: any[]) => {
      setState({ data: null, loading: true, error: null });
      try {
        const response = await apiFn(...args);
        setState({ data: response.data, loading: false, error: null });
        return response.data;
      } catch (err: any) {
        const message = err.response?.data?.message || err.message || 'Error desconocido';
        setState({ data: null, loading: false, error: message });
        throw err;
      }
    },
    [apiFn]
  );

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return { ...state, execute, reset };
}

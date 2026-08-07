import apiClient from './client';

export type BodyMetricSource = 'client' | 'coach';

// Catálogo dinámico — ya no hardcodeado aquí. Se define desde el admin panel
// (sección Métricas del perfil de cliente) y se sirve vía my-body-metric-types,
// así un tipo nuevo (o uno custom que el coach cree solo para un cliente) es
// usable de inmediato en la app, sin publicar una nueva versión.
export interface BodyMetricTypeDef {
  value: string;
  label: string;
  unit: string | null;
}

export interface BodyMetricEntry {
  id: number;
  client_id: number;
  source: BodyMetricSource;
  recorded_by_user_id: number;
  metric_type: string;
  value: string;
  unit: string | null;
  recorded_at: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface BodyMetricChartPoint {
  id: number;
  value: number;
  date: string;
  source: BodyMetricSource;
  notes: string | null;
}

export type BodyMetricChartData = Record<string, { unit: string | null; data: BodyMetricChartPoint[] }>;

export interface BodyMetricListResponse {
  data: {
    data: BodyMetricEntry[];
    current_page: number;
    last_page: number;
  };
}

export const bodyMetricsApi = {
  getTypes: () => apiClient.get<{ data: BodyMetricTypeDef[] }>('my-body-metric-types'),

  getList: (metricType?: string, perPage: number = 100) =>
    apiClient.get<BodyMetricListResponse>('my-body-metrics', {
      params: { metric_type: metricType, per_page: perPage },
    }),

  getChart: (types?: string[], days: number = 365) =>
    apiClient.get<{ data: BodyMetricChartData }>('my-body-metrics-chart', {
      params: { types: types?.join(','), days },
    }),

  store: (payload: { metric_type: string; value: number; unit?: string; recorded_at: string; notes?: string }) =>
    apiClient.post<{ data: BodyMetricEntry }>('my-body-metrics-store', payload),

  destroy: (id: number) => apiClient.post('my-body-metrics-delete', { id }),
};

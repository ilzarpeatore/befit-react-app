import apiClient from './client';

export interface MuscleVolumeGroup {
  group: string;
  volume: number;
}

export interface MuscleVolumeByDate {
  date: string;
  volume: number;
}

export interface MuscleVolumeSeriesGroup {
  group: string;
  series: number;
}

export interface MuscleVolumeData {
  volumeByMuscle: MuscleVolumeGroup[];
  seriesByMuscle: MuscleVolumeSeriesGroup[];
  volumeByDate: MuscleVolumeByDate[];
  volumeByDateAndMuscle: Record<string, number | string>[];
  totalVolume: number;
  sessionsCount: number;
  totalSeries: number;
}

export interface MuscleVolumeSet {
  exercise_id: number;
  weight?: number | null;
  reps?: number | null;
}

export const muscleVolumeApi = {
  // Volumen por grupo muscular del cliente autenticado en una ventana de
  // dias (0 = todo el historial) — para la seccion progreso semanal/mensual.
  // endDate (YYYY-MM-DD) fija el final de la ventana en vez de "hasta hoy" —
  // usado por el selector de dia / navegador de semana de Estadisticas.
  // Ruta real registrada bajo el prefijo v1 (routes/api.php) — sin el
  // prefijo el backend devuelve 404 (la pagina 404 del admin, no JSON), asi
  // que el fetch caia siempre en el catch() y el mapa/tabla se veian vacios.
  getMy: (days: number = 30, endDate?: string) =>
    apiClient.get<{ data: MuscleVolumeData }>('v1/my-muscle-volume', { params: { days, end_date: endDate } }),

  // Calculo puntual (sin leer BD) a partir de los sets que la app ya tiene
  // en memoria justo al terminar una sesion — para el heatmap post-entreno.
  compute: (sets: MuscleVolumeSet[]) =>
    apiClient.post<{ data: MuscleVolumeData }>('v1/muscle-volume-compute', { sets }),
};

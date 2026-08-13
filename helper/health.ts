import { Platform } from 'react-native';

/**
 * Capa única de integración de salud: expone una API idéntica sin importar la
 * plataforma, eligiendo HealthKit (iOS) o Health Connect (Android) por dentro.
 * Nada fuera de este archivo debe importar '@kingstinct/react-native-healthkit'
 * ni 'react-native-health-connect' directamente.
 */

export type HealthPermissionResult = { granted: boolean; reason?: string };

export interface HealthSnapshot {
  steps: number | null;
  heartRateBpm: number | null;
  sleepMinutes: number | null;
  hydrationLiters: number | null;
  // AÑADIDO 2026-08-12: readiness score real (ver api/health.ts::sync) —
  // getHRV()/getRestingHeartRate() ya existían sueltas desde Fase 4, pero
  // getHealthSnapshot() nunca las agregaba.
  hrv: number | null;
  restingHeartRateBpm: number | null;
}

function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export async function isHealthAvailable(): Promise<boolean> {
  if (Platform.OS === 'ios') {
    const HealthKit = await import('@kingstinct/react-native-healthkit');
    return HealthKit.isHealthDataAvailableAsync();
  }
  if (Platform.OS === 'android') {
    const HealthConnect = await import('react-native-health-connect');
    // SdkAvailabilityStatus.SDK_AVAILABLE === 3, evitamos importar la constante
    // para no acoplarnos a su forma exacta; solo nos interesa "disponible o no".
    const status = await HealthConnect.getSdkStatus();
    return status === 3;
  }
  return false;
}

export async function requestHealthPermissions(): Promise<HealthPermissionResult> {
  try {
    if (Platform.OS === 'ios') {
      const HealthKit = await import('@kingstinct/react-native-healthkit');
      const granted = await HealthKit.requestAuthorization({
        toRead: [
          'HKQuantityTypeIdentifierStepCount',
          'HKQuantityTypeIdentifierHeartRate',
          'HKCategoryTypeIdentifierSleepAnalysis',
          'HKQuantityTypeIdentifierDietaryWater',
          // AÑADIDO (Fase 4, readiness score): HRV (SDNN) y frecuencia
          // cardiaca en reposo, fuentes objetivas de health_data_points.
          'HKQuantityTypeIdentifierHeartRateVariabilitySDNN',
          'HKQuantityTypeIdentifierRestingHeartRate',
        ],
      });
      return { granted };
    }
    if (Platform.OS === 'android') {
      const HealthConnect = await import('react-native-health-connect');
      const initialized = await HealthConnect.initialize();
      if (!initialized) {
        return { granted: false, reason: 'health_connect_not_installed' };
      }
      const granted = await HealthConnect.requestPermission([
        { accessType: 'read', recordType: 'Steps' },
        { accessType: 'read', recordType: 'HeartRate' },
        { accessType: 'read', recordType: 'SleepSession' },
        { accessType: 'read', recordType: 'Hydration' },
        // AÑADIDO (Fase 4, readiness score): Health Connect solo expone
        // HRV como RMSSD (no SDNN, a diferencia de HealthKit en iOS) —
        // ver getHRV() más abajo para la nota de comparabilidad entre
        // plataformas.
        { accessType: 'read', recordType: 'HeartRateVariabilityRmssd' },
        { accessType: 'read', recordType: 'RestingHeartRate' },
      ]);
      return { granted: granted.length > 0 };
    }
    return { granted: false, reason: 'unsupported_platform' };
  } catch (e: any) {
    return { granted: false, reason: e?.message ?? 'unknown_error' };
  }
}

async function getStepsTodayIOS(): Promise<number | null> {
  const HealthKit = await import('@kingstinct/react-native-healthkit');
  const samples = await HealthKit.queryQuantitySamples('HKQuantityTypeIdentifierStepCount', {
    limit: 0,
    filter: { date: { startDate: startOfToday(), endDate: new Date() } },
  });
  if (samples.length === 0) return null;
  return samples.reduce((sum, s) => sum + s.quantity, 0);
}

async function getStepsTodayAndroid(): Promise<number | null> {
  const HealthConnect = await import('react-native-health-connect');
  const { records } = await HealthConnect.readRecords('Steps', {
    timeRangeFilter: {
      operator: 'between',
      startTime: startOfToday().toISOString(),
      endTime: new Date().toISOString(),
    },
  });
  if (records.length === 0) return null;
  return records.reduce((sum, r) => sum + r.count, 0);
}

export async function getStepsToday(): Promise<number | null> {
  if (Platform.OS === 'ios') return getStepsTodayIOS();
  if (Platform.OS === 'android') return getStepsTodayAndroid();
  return null;
}

async function getLatestHeartRateIOS(): Promise<number | null> {
  const HealthKit = await import('@kingstinct/react-native-healthkit');
  const samples = await HealthKit.queryQuantitySamples('HKQuantityTypeIdentifierHeartRate', {
    limit: 1,
    ascending: false,
    unit: 'count/min',
  });
  return samples[0]?.quantity ?? null;
}

async function getLatestHeartRateAndroid(): Promise<number | null> {
  const HealthConnect = await import('react-native-health-connect');
  const { records } = await HealthConnect.readRecords('HeartRate', {
    timeRangeFilter: {
      operator: 'between',
      startTime: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      endTime: new Date().toISOString(),
    },
    ascendingOrder: false,
    pageSize: 1,
  });
  const lastRecord = records[0];
  const lastSample = lastRecord?.samples?.[lastRecord.samples.length - 1];
  return lastSample?.beatsPerMinute ?? null;
}

export async function getLatestHeartRate(): Promise<number | null> {
  if (Platform.OS === 'ios') return getLatestHeartRateIOS();
  if (Platform.OS === 'android') return getLatestHeartRateAndroid();
  return null;
}

/**
 * Motor de Auto-Regulación de Carga — Fase 4 (readiness score, documento
 * §4.1). Lectura más reciente de HRV.
 *
 * NOTA DE COMPARABILIDAD ENTRE PLATAFORMAS: HealthKit (iOS) expone HRV como
 * SDNN (desviación estándar de intervalos NN, en ms); Health Connect
 * (Android) solo expone `HeartRateVariabilityRmssdRecord` (RMSSD, no SDNN)
 * — son algoritmos distintos sobre la misma señal, con valores numéricos no
 * directamente comparables entre sí. `ReadinessCalculationService` (backend)
 * calcula z-scores por cliente contra su propio histórico (nunca compara el
 * valor crudo entre clientes/plataformas), así que la diferencia de
 * algoritmo no invalida el z-score individual, pero es una limitación real
 * a tener en cuenta si en el futuro se comparan valores absolutos entre
 * plataformas.
 */
async function getHRVIOS(): Promise<number | null> {
  const HealthKit = await import('@kingstinct/react-native-healthkit');
  const samples = await HealthKit.queryQuantitySamples('HKQuantityTypeIdentifierHeartRateVariabilitySDNN', {
    limit: 1,
    ascending: false,
    unit: 'ms',
  });
  return samples[0]?.quantity ?? null;
}

async function getHRVAndroid(): Promise<number | null> {
  const HealthConnect = await import('react-native-health-connect');
  const { records } = await HealthConnect.readRecords('HeartRateVariabilityRmssd', {
    timeRangeFilter: {
      operator: 'between',
      startTime: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      endTime: new Date().toISOString(),
    },
    ascendingOrder: false,
    pageSize: 1,
  });
  return records[0]?.heartRateVariabilityMillis ?? null;
}

export async function getHRV(): Promise<number | null> {
  if (Platform.OS === 'ios') return getHRVIOS();
  if (Platform.OS === 'android') return getHRVAndroid();
  return null;
}

async function getRestingHeartRateIOS(): Promise<number | null> {
  const HealthKit = await import('@kingstinct/react-native-healthkit');
  const samples = await HealthKit.queryQuantitySamples('HKQuantityTypeIdentifierRestingHeartRate', {
    limit: 1,
    ascending: false,
    unit: 'count/min',
  });
  return samples[0]?.quantity ?? null;
}

async function getRestingHeartRateAndroid(): Promise<number | null> {
  const HealthConnect = await import('react-native-health-connect');
  const { records } = await HealthConnect.readRecords('RestingHeartRate', {
    timeRangeFilter: {
      operator: 'between',
      startTime: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      endTime: new Date().toISOString(),
    },
    ascendingOrder: false,
    pageSize: 1,
  });
  return records[0]?.beatsPerMinute ?? null;
}

export async function getRestingHeartRate(): Promise<number | null> {
  if (Platform.OS === 'ios') return getRestingHeartRateIOS();
  if (Platform.OS === 'android') return getRestingHeartRateAndroid();
  return null;
}

// Solo estos valores de CategoryValueSleepAnalysis representan sueño real
// (excluye inBed=0 y awake=2 — "en la cama" o "despierto" no es dormir).
const IOS_ASLEEP_VALUES = new Set([1, 3, 4, 5]); // asleepUnspecified/asleepCore/asleepDeep/asleepREM

async function getSleepMinutesIOS(): Promise<number | null> {
  const HealthKit = await import('@kingstinct/react-native-healthkit');
  const samples = await HealthKit.queryCategorySamples('HKCategoryTypeIdentifierSleepAnalysis', {
    limit: 0,
    filter: { date: { startDate: new Date(Date.now() - 24 * 60 * 60 * 1000), endDate: new Date() } },
  });
  if (samples.length === 0) return null;

  const asleepMs = samples
    .filter((s) => IOS_ASLEEP_VALUES.has(s.value as unknown as number))
    .reduce((sum, s) => sum + (s.endDate.getTime() - s.startDate.getTime()), 0);

  return Math.round(asleepMs / 60000);
}

async function getSleepMinutesAndroid(): Promise<number | null> {
  const HealthConnect = await import('react-native-health-connect');
  const { records } = await HealthConnect.readRecords('SleepSession', {
    timeRangeFilter: {
      operator: 'between',
      startTime: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      endTime: new Date().toISOString(),
    },
  });
  if (records.length === 0) return null;

  // Fuentes de sueño no siempre exponen `stages` (etapas granulares) — si
  // están presentes, sumamos solo las etapas de sueño real (excluye AWAKE y
  // OUT_OF_BED); si no, usamos la duración total de la sesión como fallback
  // razonable (misma decisión que muchas apps de fitness toman por defecto).
  const ASLEEP_STAGES = new Set<number>([
    HealthConnect.SleepStageType.SLEEPING,
    HealthConnect.SleepStageType.LIGHT,
    HealthConnect.SleepStageType.DEEP,
    HealthConnect.SleepStageType.REM,
  ]);

  const totalMs = records.reduce((sum, session) => {
    if (session.stages && session.stages.length > 0) {
      const stagesMs = session.stages
        .filter((st) => ASLEEP_STAGES.has(st.stage))
        .reduce((s, st) => s + (new Date(st.endTime).getTime() - new Date(st.startTime).getTime()), 0);
      return sum + stagesMs;
    }
    return sum + (new Date(session.endTime).getTime() - new Date(session.startTime).getTime());
  }, 0);

  return Math.round(totalMs / 60000);
}

export async function getSleepMinutes(): Promise<number | null> {
  if (Platform.OS === 'ios') return getSleepMinutesIOS();
  if (Platform.OS === 'android') return getSleepMinutesAndroid();
  return null;
}

export async function getHealthSnapshot(): Promise<HealthSnapshot> {
  const [steps, heartRateBpm, sleepMinutes, hrv, restingHeartRateBpm] = await Promise.all([
    getStepsToday().catch(() => null),
    getLatestHeartRate().catch(() => null),
    getSleepMinutes().catch(() => null),
    getHRV().catch(() => null),
    getRestingHeartRate().catch(() => null),
  ]);
  // Hidratación se deja fuera — no tiene consumidor real todavía (a
  // diferencia de sleepMinutes/hrv/restingHeartRateBpm, que alimentan el
  // readiness score real vía POST /api/health-data-points/sync).
  return { steps, heartRateBpm, sleepMinutes, hydrationLiters: null, hrv, restingHeartRateBpm };
}

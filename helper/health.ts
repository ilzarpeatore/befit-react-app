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

export async function getHealthSnapshot(): Promise<HealthSnapshot> {
  const [steps, heartRateBpm] = await Promise.all([
    getStepsToday().catch(() => null),
    getLatestHeartRate().catch(() => null),
  ]);
  // Sueño/hidratación se añaden cuando una pantalla real los necesite —
  // de momento se dejan fuera para no exponer datos sin consumidor real.
  return { steps, heartRateBpm, sleepMinutes: null, hydrationLiters: null };
}

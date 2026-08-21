import { useCallback, useEffect, useState } from 'react';
import { AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { C, C_DARK, isNightHour } from '../pages/migrated/theme';

export type ThemePreference = 'auto' | 'light' | 'dark';

const STORAGE_KEY = '@befit_theme_preference';

// Modo oscuro automático por hora del dispositivo (Home v2, 2026-08-21) --
// 'auto' sigue isNightHour (mismo criterio que la foto de noche del hero),
// pero el usuario puede fijar 'light'/'dark' manualmente y eso manda sobre
// la hora hasta que vuelva a elegir 'auto'. Solo Home v2 consume esto por
// ahora -- el resto de pantallas sigue importando C directamente de theme.ts
// sin cambios, cero riesgo de regresión ahí.
export function useAppColorMode() {
  const [preference, setPreferenceState] = useState<ThemePreference>('auto');
  const [autoIsDark, setAutoIsDark] = useState(() => isNightHour(new Date().getHours()));

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((saved) => {
      if (saved === 'auto' || saved === 'light' || saved === 'dark') setPreferenceState(saved);
    });
  }, []);

  const recomputeAuto = useCallback(() => {
    setAutoIsDark(isNightHour(new Date().getHours()));
  }, []);

  useEffect(() => {
    if (preference !== 'auto') return;
    recomputeAuto();
    // Sin timer corriendo todo el rato -- basta con recalcular al volver a
    // primer plano (cubre dejar la app abierta de un lado a otro del
    // amanecer/atardecer mientras estaba en segundo plano).
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') recomputeAuto();
    });
    return () => sub.remove();
  }, [preference, recomputeAuto]);

  const setPreference = useCallback((next: ThemePreference) => {
    setPreferenceState(next);
    AsyncStorage.setItem(STORAGE_KEY, next).catch(() => {});
  }, []);

  const mode: 'light' | 'dark' = preference === 'auto' ? (autoIsDark ? 'dark' : 'light') : preference;
  const colors = mode === 'dark' ? C_DARK : C;

  return { preference, setPreference, mode, colors };
}

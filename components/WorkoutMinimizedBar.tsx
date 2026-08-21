import React, { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Box } from '@components/ui/box';
import { HStack } from '@components/ui/hstack';
import { Text } from '@components/ui/text';
import { Pressable } from '@components/ui/pressable';
import { Icon } from '@components/ui/icon';
import { GlassView, isGlassEffectAPIAvailable } from '@components/ui/glass-view';
import { subscribeWorkoutSession, ActiveWorkoutSession } from '../helper/workoutSessionBus';

interface Props {
  navigationRef: any;
}

function formatTimer(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
  const s = Math.floor(totalSeconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

// Barra flotante global (fuera del stack de navegacion, montada una vez
// junto a <NavigationContainer> en App.tsx) que muestra el entrenamiento en
// curso cuando el cliente sale de workout_session_screen sin finalizarlo
// (punto 5 del encargo, item #11). Se alimenta del bus en
// helper/workoutSessionBus.ts -- no depende de props de navegacion para
// enterarse del progreso.
export default function WorkoutMinimizedBar({ navigationRef }: Props) {
  const insets = useSafeAreaInsets();
  const [session, setSession] = useState<ActiveWorkoutSession | null>(null);
  const [minimized, setMinimized] = useState(false);
  const [nowTick, setNowTick] = useState(() => Date.now());

  useEffect(() => subscribeWorkoutSession((s, m) => {
    setSession(s);
    setMinimized(m);
  }), []);

  useEffect(() => {
    if (!session || !minimized) return;
    const id = setInterval(() => setNowTick(Date.now()), 1000);
    return () => clearInterval(id);
  }, [session, minimized]);

  if (!session || !minimized) return null;

  const elapsedSeconds = Math.max(0, Math.floor((nowTick - session.startedAt) / 1000));
  const progress = session.totalSets > 0 ? session.completedSets / session.totalSets : 0;
  const hasGlass = isGlassEffectAPIAvailable();

  const restore = () => {
    if (!navigationRef?.current?.isReady?.()) return;
    navigationRef.current.navigate('MigratedWorkoutSession', {
      programDayAssignmentId: session.programDayAssignmentId,
      workoutTemplateId: session.workoutTemplateId,
      mTitle: session.mTitle,
    });
  };

  return (
    <Box
      pointerEvents="box-none"
      style={{
        position: 'absolute',
        left: 12,
        right: 12,
        bottom: Math.max(insets.bottom, 12) + (Platform.OS === 'ios' ? 6 : 10),
        zIndex: 50,
        borderRadius: 20,
        boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.3)',
      }}
    >
      <Pressable onPress={restore}>
        <GlassView
          glassEffectStyle="regular"
          style={{
            borderRadius: 20,
            overflow: 'hidden',
            paddingHorizontal: 16,
            paddingVertical: 12,
            ...(hasGlass ? null : { backgroundColor: '#1C1C1E' }),
          }}
        >
          <HStack className="items-center justify-between">
            <HStack space="sm" className="items-center flex-1" style={{ marginRight: 10 }}>
              <Box className="items-center justify-center rounded-pill" style={{ width: 34, height: 34, backgroundColor: 'rgba(255,255,255,0.14)' }}>
                <Icon name="barbell-outline" size={17} className="text-background" />
              </Box>
              <Box className="flex-1">
                <Text weight="bold" className="text-background" numberOfLines={1} style={{ fontSize: 14 }}>
                  {session.mTitle || 'Entrenamiento'}
                </Text>
                <Text className="text-background" style={{ fontSize: 12, opacity: 0.75, marginTop: 2 }}>
                  {formatTimer(elapsedSeconds)} · {session.completedSets}/{session.totalSets} series
                </Text>
              </Box>
            </HStack>
            <Icon name="chevron-up-circle" size={26} className="text-background" />
          </HStack>
          <Box style={{ height: 3, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.18)', marginTop: 10, overflow: 'hidden' }}>
            <Box style={{ height: 3, borderRadius: 2, width: `${Math.round(progress * 100)}%`, backgroundColor: '#34C759' }} />
          </Box>
        </GlassView>
      </Pressable>
    </Box>
  );
}

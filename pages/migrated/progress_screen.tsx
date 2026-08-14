import React, { useState, useEffect, useMemo } from 'react';
import { ScrollView } from 'react-native';
import { Box } from '@components/ui/box';
import { Text } from '@components/ui/text';
import { Heading } from '@components/ui/heading';
import { Button, ButtonText } from '@components/ui/button';
import { Pressable } from '@components/ui/pressable';
import { Icon } from '@components/ui/icon';
import { Spinner } from '@components/ui/spinner';
import { C, SHADOW } from './theme';
import MuscleBodyMap from '@components/MuscleBodyMap';
import { ViewSide } from '../../constants/bodyMusclesPaths';
import { bodyMetricsApi, BodyMetricChartData } from '../../api/bodyMetrics';
import { statisticsApi, PeriodStats, Adherence } from '../../api/statistics';
import { muscleVolumeApi, MuscleVolumeData } from '../../api/muscleVolume';
import { habitCellColor } from '@constants/habitColor';
import logger from '@helper/logger';

// Los 4 componentes de "Composición corporal" que pidió el usuario, por sus
// value fijos del catálogo global sembrado (ver body_metric_types) — el resto
// de tipos (cuello, pecho, cintura, cadera, bíceps, muslo, pantorrilla, y
// cualquier tipo custom que añada el coach) viven en la pantalla de
// Antropometría completa, no aquí.
const COMPOSITION_METRICS: { key: string; label: string }[] = [
  { key: 'weight', label: 'Peso' },
  { key: 'body_fat', label: 'Grasa corporal' },
  { key: 'muscle_mass', label: 'Masa muscular' },
  { key: 'visceral_fat', label: 'Grasa visceral' },
];

const EMPTY_VOLUME: MuscleVolumeData = { volumeByMuscle: [], seriesByMuscle: [], volumeByDate: [], volumeByDateAndMuscle: [], totalVolume: 0, sessionsCount: 0, totalSeries: 0 };

function CompositionTile({
  label,
  entry,
  delta,
  onPress,
}: {
  label: string;
  entry: { value: number; unit: string | null } | null;
  delta: number | null;
  onPress: () => void;
}) {
  return (
    <Pressable
      className="rounded-md bg-card"
      style={{ width: '47%', padding: 14, ...SHADOW.card }}
      onPress={onPress}
    >
      <Text size="xs" weight="medium" muted>{label}</Text>
      {entry ? (
        <>
          <Text weight="bold" size="xl" style={{ marginTop: 6 }}>
            {entry.value}
            <Text size="xs" weight="medium" muted> {entry.unit}</Text>
          </Text>
          {delta !== null ? (
            <Box
              className="flex-row items-center self-start rounded-sm"
              style={{
                gap: 3,
                paddingHorizontal: 7,
                paddingVertical: 3,
                marginTop: 6,
                backgroundColor: delta < 0 ? C.success10 : delta > 0 ? C.warning10 : C.gray5,
              }}
            >
              <Icon
                name={delta < 0 ? 'arrow-down' : delta > 0 ? 'arrow-up' : 'remove'}
                size={10}
                color={delta < 0 ? C.statusSuccess : delta > 0 ? C.statusWarning : C.gray40}
              />
              <Text weight="bold" size="xs" style={{ color: delta < 0 ? C.statusSuccess : delta > 0 ? C.statusWarning : C.gray40 }}>
                {Math.abs(delta).toFixed(1)}
              </Text>
            </Box>
          ) : (
            <Text size="xs" muted style={{ marginTop: 6 }}>Primera medida</Text>
          )}
        </>
      ) : (
        <Text size="xs" muted style={{ marginTop: 8 }}>Sin datos</Text>
      )}
    </Pressable>
  );
}

export default function ProgressScreen(props: any) {
  const [loading, setLoading] = useState(true);
  const [bodyMetrics, setBodyMetrics] = useState<BodyMetricChartData>({});
  const [periodStats, setPeriodStats] = useState<PeriodStats | null>(null);
  const [adherence, setAdherence] = useState<Adherence | null>(null);
  const [muscleVolume, setMuscleVolume] = useState<MuscleVolumeData>(EMPTY_VOLUME);

  const load = async () => {
    setLoading(true);
    try {
      const [bodyMetricsRes, periodRes, adherenceRes, volumeRes] = await Promise.allSettled([
        bodyMetricsApi.getChart(),
        statisticsApi.getMyPeriodStats(30),
        statisticsApi.getMyAdherence(30),
        muscleVolumeApi.getMy(7),
      ]);

      if (bodyMetricsRes.status === 'fulfilled') setBodyMetrics(bodyMetricsRes.value.data?.data ?? {});
      if (periodRes.status === 'fulfilled') setPeriodStats(periodRes.value.data?.data ?? null);
      if (adherenceRes.status === 'fulfilled') setAdherence(adherenceRes.value.data?.data ?? null);
      if (volumeRes.status === 'fulfilled') setMuscleVolume(volumeRes.value.data?.data ?? EMPTY_VOLUME);
    } catch (e) {
      logger.error('Progress init error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const composition = useMemo(() => {
    return COMPOSITION_METRICS.map((m) => {
      const points = [...(bodyMetrics[m.key]?.data ?? [])].sort((a, b) => a.date.localeCompare(b.date));
      const latest = points[points.length - 1] ?? null;
      const previous = points[points.length - 2] ?? null;
      return {
        ...m,
        entry: latest ? { value: latest.value, unit: bodyMetrics[m.key]?.unit ?? null } : null,
        delta: latest && previous ? latest.value - previous.value : null,
      };
    });
  }, [bodyMetrics]);

  const goToMetric = (metricType: string) => props.navigation?.navigate('MigratedBodyMetrics', { metricType });

  return (
    <Box className="flex-1 bg-background">
      <Box style={{ paddingTop: 48, paddingBottom: 12 }} className="px-4 flex-row items-center justify-between bg-card">
        <Button variant="ghost" size="icon" onPress={() => props.navigation?.goBack()}>
          <Icon name="chevron-back" size={24} className="text-foreground" />
        </Button>
        <Heading size="sm">Informe</Heading>
        <Box className="w-8" />
      </Box>

      {loading ? (
        <Box className="flex-1 items-center justify-center">
          <Spinner size="large" color={C.orange} />
        </Box>
      ) : (
        <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
          {/* Composición corporal */}
          <Text size="sm" weight="bold" style={{ marginTop: 20, marginBottom: 10 }}>Composición corporal</Text>
          <Box className="flex-row flex-wrap gap-3">
            {composition.map((m) => (
              <CompositionTile key={m.key} label={m.label} entry={m.entry} delta={m.delta} onPress={() => goToMetric(m.key)} />
            ))}
          </Box>
          <Pressable
            className="flex-row items-center justify-center gap-1.5 rounded-sm py-3 px-4"
            style={{ marginTop: 2, backgroundColor: 'rgba(255,107,53,0.12)' }}
            onPress={() => props.navigation?.navigate('MigratedBodyMetrics')}
          >
            <Text size="sm" weight="bold" style={{ color: C.orange }}>Ver todas las medidas (cintura, cadera, pecho...)</Text>
            <Icon name="chevron-forward" size={16} color={C.orange} />
          </Pressable>

          {/* Constancia */}
          <Text size="sm" weight="bold" style={{ marginTop: 20, marginBottom: 10 }}>Constancia</Text>
          <Box className="rounded-md bg-card" style={{ padding: 16, ...SHADOW.card }}>
            {adherence?.mode === 'program' ? (
              <>
                <Box className="flex-row items-center justify-between">
                  <Box>
                    <Text weight="bold" size="2xl">
                      {adherence.ratio !== null ? Math.round(adherence.ratio * 100) : '--'}
                      <Text size="sm" weight="medium" muted>%</Text>
                    </Text>
                    <Text size="xs" muted style={{ marginTop: 3 }}>
                      {adherence.completedCount}/{adherence.scheduledCount} entrenamientos programados (últimos {adherence.periodDays} días)
                    </Text>
                  </Box>
                  <Box className="flex-row items-center gap-1 rounded-sm px-2.5 py-1.5" style={{ backgroundColor: 'rgba(255,107,53,0.12)' }}>
                    <Icon name="flame" size={16} color={C.orange} />
                    <Text weight="bold" size="sm" style={{ color: C.orange }}>{adherence.currentStreak}</Text>
                  </Box>
                </Box>
                {adherence.days.length > 0 && (
                  <Box className="flex-row flex-wrap gap-1" style={{ marginTop: 14 }}>
                    {adherence.days.slice(-21).map((d) => (
                      <Box key={d.date} style={{ width: 12, height: 12, borderRadius: 3, backgroundColor: habitCellColor(d.completed ? 1 : 0, d.completed, C.gray10) }} />
                    ))}
                  </Box>
                )}
              </>
            ) : adherence?.mode === 'freeform' ? (
              <Box className="flex-row items-center justify-between">
                <Box>
                  <Text weight="bold" size="2xl">{adherence.sessionsCount}</Text>
                  <Text size="xs" muted style={{ marginTop: 3 }}>
                    entrenamientos en los últimos {adherence.periodDays} días · {adherence.daysActive} días activos
                  </Text>
                </Box>
                <Box className="flex-row items-center gap-1 rounded-sm px-2.5 py-1.5" style={{ backgroundColor: 'rgba(255,107,53,0.12)' }}>
                  <Icon name="flame" size={16} color={C.orange} />
                  <Text weight="bold" size="sm" style={{ color: C.orange }}>{adherence.currentStreak}</Text>
                </Box>
              </Box>
            ) : (
              <Text size="xs" muted>Sin datos todavía</Text>
            )}
          </Box>

          {/* Entrenamiento */}
          <Text size="sm" weight="bold" style={{ marginTop: 20, marginBottom: 10 }}>Entrenamiento</Text>
          <Box className="rounded-md bg-card" style={{ padding: 16, ...SHADOW.card }}>
            <Box className="flex-row">
              <Box className="flex-1 items-center">
                <MuscleBodyMap data={muscleVolume.volumeByMuscle} height={150} showToggle={false} forcedView={ViewSide.FRONT} />
              </Box>
              <Box className="flex-1 items-center">
                <MuscleBodyMap data={muscleVolume.volumeByMuscle} height={150} showToggle={false} forcedView={ViewSide.BACK} />
              </Box>
            </Box>
            <Text size="xs" muted className="text-center" style={{ marginTop: 4 }}>Volumen muscular de los últimos 7 días</Text>
            {periodStats && (
              <Text size="xs" muted className="text-center" style={{ marginTop: 4 }}>
                {periodStats.sessionsCount} sesiones · {Math.round(periodStats.volumeKg).toLocaleString('es-ES')} kg en los últimos 30 días
              </Text>
            )}
            <Box className="flex-row gap-2.5" style={{ marginTop: 14 }}>
              <Button className="flex-1" onPress={() => props.navigation?.navigate('MigratedStatistics')}>
                <Icon name="stats-chart-outline" size={18} className="text-primary-foreground" />
                <ButtonText>Estadísticas</ButtonText>
              </Button>
              <Button className="flex-1" onPress={() => props.navigation?.navigate('MigratedMuscleProgress')}>
                <Icon name="body-outline" size={18} className="text-primary-foreground" />
                <ButtonText>Progreso muscular</ButtonText>
              </Button>
            </Box>
          </Box>
        </ScrollView>
      )}
    </Box>
  );
}

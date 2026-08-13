import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C, FONT, SHADOW } from './theme';
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
    <TouchableOpacity style={s.compTile} onPress={onPress} activeOpacity={0.75}>
      <Text style={s.compLabel}>{label}</Text>
      {entry ? (
        <>
          <Text style={s.compValue}>
            {entry.value}
            <Text style={s.compUnit}> {entry.unit}</Text>
          </Text>
          {delta !== null ? (
            <View style={[s.compDeltaBadge, delta < 0 ? s.deltaDown : delta > 0 ? s.deltaUp : s.deltaFlat]}>
              <Ionicons name={delta < 0 ? 'arrow-down' : delta > 0 ? 'arrow-up' : 'remove'} size={10} color={delta < 0 ? C.statusSuccess : delta > 0 ? C.statusWarning : C.gray40} />
              <Text style={[s.compDeltaText, { color: delta < 0 ? C.statusSuccess : delta > 0 ? C.statusWarning : C.gray40 }]}>
                {Math.abs(delta).toFixed(1)}
              </Text>
            </View>
          ) : (
            <Text style={s.compNoDelta}>Primera medida</Text>
          )}
        </>
      ) : (
        <Text style={s.compEmpty}>Sin datos</Text>
      )}
    </TouchableOpacity>
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
    <View style={s.container}>
      <View style={s.appBar}>
        <TouchableOpacity onPress={() => props.navigation?.goBack()} style={s.backBtn}>
          <Ionicons name="chevron-back" size={24} color={C.textPrimary} />
        </TouchableOpacity>
        <Text style={s.appBarTitle}>Informe</Text>
        <View style={{ width: 32 }} />
      </View>

      {loading ? (
        <View style={s.loadingWrap}>
          <ActivityIndicator size="large" color={C.orange} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Composición corporal */}
          <Text style={s.sectionTitle}>Composición corporal</Text>
          <View style={s.compGrid}>
            {composition.map((m) => (
              <CompositionTile key={m.key} label={m.label} entry={m.entry} delta={m.delta} onPress={() => goToMetric(m.key)} />
            ))}
          </View>
          <TouchableOpacity style={s.moreMetricsLink} onPress={() => props.navigation?.navigate('MigratedBodyMetrics')} activeOpacity={0.8}>
            <Text style={s.moreMetricsText}>Ver todas las medidas (cintura, cadera, pecho...)</Text>
            <Ionicons name="chevron-forward" size={16} color={C.orange} />
          </TouchableOpacity>

          {/* Constancia */}
          <Text style={s.sectionTitle}>Constancia</Text>
          <View style={s.card}>
            {adherence?.mode === 'program' ? (
              <>
                <View style={s.cardHeaderRow}>
                  <View>
                    <Text style={s.cardBigValue}>
                      {adherence.ratio !== null ? Math.round(adherence.ratio * 100) : '--'}
                      <Text style={s.cardBigUnit}>%</Text>
                    </Text>
                    <Text style={s.cardMeta}>
                      {adherence.completedCount}/{adherence.scheduledCount} entrenamientos programados (últimos {adherence.periodDays} días)
                    </Text>
                  </View>
                  <View style={s.streakBadge}>
                    <Ionicons name="flame" size={16} color={C.orange} />
                    <Text style={s.streakText}>{adherence.currentStreak}</Text>
                  </View>
                </View>
                {adherence.days.length > 0 && (
                  <View style={s.dotsRow}>
                    {adherence.days.slice(-21).map((d) => (
                      <View key={d.date} style={[s.dot, { backgroundColor: habitCellColor(d.completed ? 1 : 0, d.completed, C.gray10) }]} />
                    ))}
                  </View>
                )}
              </>
            ) : adherence?.mode === 'freeform' ? (
              <View style={s.cardHeaderRow}>
                <View>
                  <Text style={s.cardBigValue}>{adherence.sessionsCount}</Text>
                  <Text style={s.cardMeta}>
                    entrenamientos en los últimos {adherence.periodDays} días · {adherence.daysActive} días activos
                  </Text>
                </View>
                <View style={s.streakBadge}>
                  <Ionicons name="flame" size={16} color={C.orange} />
                  <Text style={s.streakText}>{adherence.currentStreak}</Text>
                </View>
              </View>
            ) : (
              <Text style={s.cardMeta}>Sin datos todavía</Text>
            )}
          </View>

          {/* Entrenamiento */}
          <Text style={s.sectionTitle}>Entrenamiento</Text>
          <View style={s.card}>
            <View style={s.heatmapRow}>
              <View style={s.heatmapCol}>
                <MuscleBodyMap data={muscleVolume.volumeByMuscle} height={150} showToggle={false} forcedView={ViewSide.FRONT} />
              </View>
              <View style={s.heatmapCol}>
                <MuscleBodyMap data={muscleVolume.volumeByMuscle} height={150} showToggle={false} forcedView={ViewSide.BACK} />
              </View>
            </View>
            <Text style={s.heatmapCaption}>Volumen muscular de los últimos 7 días</Text>
            {periodStats && (
              <Text style={s.heatmapCaption}>
                {periodStats.sessionsCount} sesiones · {Math.round(periodStats.volumeKg).toLocaleString('es-ES')} kg en los últimos 30 días
              </Text>
            )}
            <View style={s.trainingBtnRow}>
              <TouchableOpacity style={s.trainingBtn} onPress={() => props.navigation?.navigate('MigratedStatistics')} activeOpacity={0.8}>
                <Ionicons name="stats-chart-outline" size={18} color="#FFFFFF" />
                <Text style={s.trainingBtnText}>Estadísticas</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.trainingBtn} onPress={() => props.navigation?.navigate('MigratedMuscleProgress')} activeOpacity={0.8}>
                <Ionicons name="body-outline" size={18} color="#FFFFFF" />
                <Text style={s.trainingBtnText}>Progreso muscular</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  appBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 48, paddingBottom: 12, backgroundColor: C.surface },
  backBtn: { padding: 4 },
  appBarTitle: { fontSize: 18, fontFamily: FONT.bold, color: C.textPrimary },
  settingsBtn: { padding: 4 },
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 32 },
  sectionTitle: { fontSize: 15, fontFamily: FONT.bold, color: C.textPrimary, marginTop: 20, marginBottom: 10 },
  compGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  compTile: { width: '47%', backgroundColor: C.surface, borderRadius: 16, padding: 14, ...SHADOW.card },
  compLabel: { fontSize: 11.5, color: C.gray40, fontFamily: FONT.medium },
  compValue: { fontSize: 20, fontFamily: FONT.bold, color: C.textPrimary, marginTop: 6 },
  compUnit: { fontSize: 12, fontFamily: FONT.medium, color: C.textSecondary },
  compEmpty: { fontSize: 12, color: C.textSecondary, fontFamily: FONT.regular, marginTop: 8 },
  compNoDelta: { fontSize: 10.5, color: C.gray40, fontFamily: FONT.regular, marginTop: 6 },
  compDeltaBadge: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: 3, paddingHorizontal: 7, paddingVertical: 3, borderRadius: 8, marginTop: 6 },
  compDeltaText: { fontFamily: FONT.bold, fontSize: 10.5 },
  moreMetricsLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 2,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: 'rgba(255,107,53,0.12)',
  },
  moreMetricsText: { fontSize: 13, color: C.orange, fontFamily: FONT.bold },
  card: { backgroundColor: C.surface, borderRadius: 18, padding: 16, ...SHADOW.card },
  cardHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardBigValue: { fontSize: 26, fontFamily: FONT.bold, color: C.textPrimary },
  cardBigUnit: { fontSize: 14, fontFamily: FONT.medium, color: C.textSecondary },
  cardMeta: { fontSize: 12, color: C.textSecondary, marginTop: 3, fontFamily: FONT.regular },
  deltaDown: { backgroundColor: C.success10 },
  deltaUp: { backgroundColor: C.warning10 },
  deltaFlat: { backgroundColor: C.gray5 },
  streakBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(255,107,53,0.12)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12 },
  streakText: { fontFamily: FONT.bold, fontSize: 13, color: C.orange },
  dotsRow: { flexDirection: 'row', gap: 4, marginTop: 14, flexWrap: 'wrap' },
  dot: { width: 12, height: 12, borderRadius: 3 },
  heatmapRow: { flexDirection: 'row' },
  heatmapCol: { flex: 1, alignItems: 'center' },
  heatmapCaption: { fontSize: 11.5, color: C.gray40, fontFamily: FONT.regular, textAlign: 'center', marginTop: 4 },
  trainingBtnRow: { flexDirection: 'row', gap: 10, marginTop: 14 },
  trainingBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: C.accentBlack, borderRadius: 14, paddingVertical: 12 },
  trainingBtnText: { fontFamily: FONT.bold, fontSize: 12.5, color: '#FFFFFF' },
});

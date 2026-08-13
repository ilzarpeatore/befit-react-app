import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import { C, FONT, SHADOW } from './theme';
import RadarChart from '../../components/RadarChart';
import SimpleBottomSheet from '../../components/SimpleBottomSheet';
import { MACRO_MUSCLE_GROUPS, MacroMuscleGroup, macroGroupFor } from '../../constants/bodyMusclesMap';
import { muscleVolumeApi, MuscleVolumeGroup } from '../../api/muscleVolume';
import { statisticsApi, PeriodStats } from '../../api/statistics';
import { toLocalISODate } from '../../components/DaySelectorStrip';

interface Props {
  navigation?: any;
  route?: any;
}

interface RangeOption {
  key: string;
  label: string;
  days: number;
}

const RANGE_OPTIONS: RangeOption[] = [
  { key: '7', label: 'Últimos 7 días', days: 7 },
  { key: '30', label: 'Últimos 30 días', days: 30 },
  { key: '90', label: 'Últimos 90 días', days: 90 },
  { key: 'meso', label: 'Este mesociclo', days: 42 },
];

const ZERO_PERIOD: PeriodStats = { sessionsCount: 0, durationSeconds: 0, avgDurationSeconds: 0, volumeKg: 0 };

function subDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() - n);
  return r;
}
function formatDuration(totalSeconds: number): string {
  const m = Math.round(totalSeconds / 60);
  if (m < 60) return `${m}min`;
  const h = Math.floor(m / 60);
  const rem = m % 60;
  return rem > 0 ? `${h}h ${rem}min` : `${h}h`;
}
function formatVolume(kg: number): string {
  if (kg >= 1000) return `${(kg / 1000).toFixed(1)}k kg`;
  return `${Math.round(kg)} kg`;
}
function macroValues(data: MuscleVolumeGroup[]): Record<MacroMuscleGroup, number> {
  const out: Record<string, number> = {};
  MACRO_MUSCLE_GROUPS.forEach((g) => (out[g] = 0));
  data.forEach((m) => {
    const macro = macroGroupFor(m.group);
    if (macro) out[macro] += m.volume;
  });
  return out as Record<MacroMuscleGroup, number>;
}

function DeltaText({ current, previous, format }: { current: number; previous: number; format: (n: number) => string }) {
  const delta = current - previous;
  if (previous === 0 && current === 0) return <Text style={s.deltaNeutral}>—</Text>;
  const positive = delta >= 0;
  return (
    <Text style={positive ? s.deltaUp : s.deltaDown}>
      {positive ? '↑' : '↓'} {format(Math.abs(delta))}
    </Text>
  );
}

export default function StatisticsMuscleDistributionScreen(props: Props) {
  const { navigation } = props;
  const [range, setRange] = useState(RANGE_OPTIONS[1]);
  const [currentVolume, setCurrentVolume] = useState<MuscleVolumeGroup[]>([]);
  const [previousVolume, setPreviousVolume] = useState<MuscleVolumeGroup[]>([]);
  const [currentSeries, setCurrentSeries] = useState(0);
  const [previousSeries, setPreviousSeries] = useState(0);
  const [currentStats, setCurrentStats] = useState<PeriodStats>(ZERO_PERIOD);
  const [previousStats, setPreviousStats] = useState<PeriodStats>(ZERO_PERIOD);
  const [isLoading, setIsLoading] = useState(false);
  const [rangeSheetVisible, setRangeSheetVisible] = useState(false);
  const [helpSheetVisible, setHelpSheetVisible] = useState(false);

  useEffect(() => {
    const today = new Date();
    const currentEndISO = toLocalISODate(today);
    const currentStartMinus1 = subDays(today, range.days);
    const previousEndISO = toLocalISODate(currentStartMinus1);

    let active = true;
    setIsLoading(true);
    Promise.all([
      muscleVolumeApi.getMy(range.days, currentEndISO),
      muscleVolumeApi.getMy(range.days, previousEndISO),
      statisticsApi.getMyPeriodStats(range.days, currentEndISO),
      statisticsApi.getMyPeriodStats(range.days, previousEndISO),
    ])
      .then(([curVol, prevVol, curStats, prevStats]) => {
        if (!active) return;
        const curData = curVol.data?.data || curVol.data;
        const prevData = prevVol.data?.data || prevVol.data;
        setCurrentVolume(curData?.volumeByMuscle || []);
        setPreviousVolume(prevData?.volumeByMuscle || []);
        setCurrentSeries(curData?.totalSeries || 0);
        setPreviousSeries(prevData?.totalSeries || 0);
        setCurrentStats(curStats.data?.data || ZERO_PERIOD);
        setPreviousStats(prevStats.data?.data || ZERO_PERIOD);
      })
      .catch(() => {
        if (!active) return;
        setCurrentVolume([]);
        setPreviousVolume([]);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [range]);

  const { currentAxis, previousAxis } = useMemo(() => {
    const cur = macroValues(currentVolume);
    const prev = macroValues(previousVolume);
    const max = Math.max(1, ...MACRO_MUSCLE_GROUPS.map((g) => Math.max(cur[g], prev[g])));
    return {
      currentAxis: MACRO_MUSCLE_GROUPS.map((g) => cur[g] / max),
      previousAxis: MACRO_MUSCLE_GROUPS.map((g) => prev[g] / max),
    };
  }, [currentVolume, previousVolume]);

  const openRangePicker = useCallback(() => setRangeSheetVisible(true), []);
  const openHelp = useCallback(() => setHelpSheetVisible(true), []);
  const shareRef = useRef<View>(null);
  const [isSharing, setIsSharing] = useState(false);
  const onShare = async () => {
    if (!shareRef.current || isSharing) return;
    setIsSharing(true);
    try {
      const uri = await captureRef(shareRef, { format: 'png', quality: 0.92 });
      const available = await Sharing.isAvailableAsync();
      if (!available) {
        Alert.alert('No disponible', 'Compartir no está disponible en este dispositivo.');
        return;
      }
      await Sharing.shareAsync(uri, { mimeType: 'image/png', dialogTitle: 'Compartir distribución muscular' });
    } catch (e) {
      Alert.alert('Error', 'No se pudo generar la imagen para compartir.');
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <View style={s.appBar}>
        <TouchableOpacity onPress={() => navigation?.goBack()} style={s.iconBtn}>
          <Ionicons name="chevron-back" size={22} color={C.textPrimary} />
        </TouchableOpacity>
        <Text style={s.appBarTitle} numberOfLines={1}>
          Distribución de los músculos
        </Text>
        <View style={s.appBarRightIcons}>
          <TouchableOpacity style={s.smallIconBtn} onPress={openHelp}>
            <Text style={s.helpBtnText}>?</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.smallIconBtn} onPress={onShare} disabled={isSharing}>
            {isSharing ? (
              <ActivityIndicator size="small" color={C.textSecondary} />
            ) : (
              <Ionicons name="share-outline" size={16} color={C.textSecondary} />
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
        <TouchableOpacity style={s.rangePill} onPress={openRangePicker} activeOpacity={0.75}>
          <Text style={s.rangePillText}>{range.label}</Text>
          <Ionicons name="chevron-down" size={16} color={C.textPrimary} />
        </TouchableOpacity>

        <View ref={shareRef} collapsable={false}>
        <View style={s.radarCard}>
          {isLoading ? (
            <ActivityIndicator size="large" color={C.textSecondary} style={{ paddingVertical: 80 }} />
          ) : (
            <>
              <View style={{ alignItems: 'center' }}>
                <RadarChart
                  axisLabels={MACRO_MUSCLE_GROUPS as unknown as string[]}
                  size={260}
                  series={[
                    { values: currentAxis, fillColor: C.orange, fillOpacity: 0.3, strokeColor: C.orange, strokeWidth: 2 },
                    { values: previousAxis, fillColor: C.textSecondary, fillOpacity: 0.1, strokeColor: C.textSecondary, strokeWidth: 2, dashed: true },
                  ]}
                />
              </View>
              <View style={s.legendRow}>
                <View style={s.legendItem}>
                  <View style={[s.legendDot, { backgroundColor: C.orange }]} />
                  <Text style={s.legendText}>Actual</Text>
                </View>
                <View style={s.legendItem}>
                  <View style={[s.legendDot, { backgroundColor: C.textSecondary }]} />
                  <Text style={s.legendText}>Anterior</Text>
                </View>
              </View>
            </>
          )}
        </View>

        <View style={s.grid2x2}>
          <View style={s.kpiCard}>
            <Text style={s.kpiLabel}>Entrenamientos</Text>
            <Text style={s.kpiValue}>{currentStats.sessionsCount}</Text>
            <DeltaText current={currentStats.sessionsCount} previous={previousStats.sessionsCount} format={(n) => String(Math.round(n))} />
          </View>
          <View style={s.kpiCard}>
            <Text style={s.kpiLabel}>Duración media</Text>
            <Text style={s.kpiValue}>{formatDuration(currentStats.avgDurationSeconds)}</Text>
            <DeltaText current={currentStats.avgDurationSeconds} previous={previousStats.avgDurationSeconds} format={formatDuration} />
          </View>
          <View style={s.kpiCard}>
            <Text style={s.kpiLabel}>Volumen</Text>
            <Text style={s.kpiValue}>{formatVolume(currentStats.volumeKg)}</Text>
            <DeltaText current={currentStats.volumeKg} previous={previousStats.volumeKg} format={formatVolume} />
          </View>
          <View style={s.kpiCard}>
            <Text style={s.kpiLabel}>Series</Text>
            <Text style={s.kpiValue}>{currentSeries}</Text>
            <DeltaText current={currentSeries} previous={previousSeries} format={(n) => String(Math.round(n))} />
          </View>
        </View>
        </View>
      </ScrollView>

      <SimpleBottomSheet visible={rangeSheetVisible} onClose={() => setRangeSheetVisible(false)}>
        <View style={s.sheetContent}>
          {RANGE_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.key}
              style={s.rangeOptionRow}
              onPress={() => {
                setRange(opt);
                setRangeSheetVisible(false);
              }}
            >
              <Text style={[s.rangeOptionText, opt.key === range.key && s.rangeOptionTextActive]}>{opt.label}</Text>
              {opt.key === range.key ? <Ionicons name="checkmark" size={18} color={C.accentBlack} /> : null}
            </TouchableOpacity>
          ))}
        </View>
      </SimpleBottomSheet>

      <SimpleBottomSheet visible={helpSheetVisible} onClose={() => setHelpSheetVisible(false)}>
        <View style={s.sheetContent}>
          <Text style={s.sheetTitle}>¿Qué muestra este gráfico?</Text>
          <Text style={s.sheetText}>
            Compara el volumen entrenado en cada gran zona muscular durante el periodo seleccionado (Actual) frente
            al mismo número de días inmediatamente anterior (Anterior), para ver si tu reparto de entrenamiento se
            mantiene equilibrado.
          </Text>
        </View>
      </SimpleBottomSheet>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  appBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingVertical: 12 },
  iconBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  appBarTitle: { flex: 1, textAlign: 'center', fontSize: 16, fontFamily: FONT.bold, color: C.textPrimary, marginHorizontal: 4 },
  appBarRightIcons: { flexDirection: 'row', gap: 8 },
  smallIconBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: C.surface, alignItems: 'center', justifyContent: 'center', ...SHADOW.card },
  helpBtnText: { fontFamily: FONT.bold, fontSize: 13, color: C.textSecondary },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 32 },
  rangePill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: C.surface,
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 10,
    marginTop: 12,
    gap: 8,
    ...SHADOW.card,
  },
  rangePillText: { fontFamily: FONT.semiBold, fontSize: 14, color: C.textPrimary },
  radarCard: { backgroundColor: C.surface, borderRadius: 20, marginTop: 16, paddingVertical: 20, ...SHADOW.card },
  legendRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 16, marginTop: 12, paddingHorizontal: 20 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontFamily: FONT.medium, fontSize: 13, color: C.textSecondary },
  grid2x2: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 20 },
  kpiCard: { width: '47%', borderWidth: 1, borderColor: C.border, backgroundColor: C.gray5, borderRadius: 20, padding: 18 },
  kpiLabel: { fontFamily: FONT.medium, fontSize: 13.5, color: C.textSecondary },
  kpiValue: { fontFamily: FONT.extraBold, fontSize: 24, color: C.textPrimary, marginTop: 6 },
  deltaUp: { fontFamily: FONT.semiBold, fontSize: 12.5, color: C.success60, marginTop: 4 },
  deltaDown: { fontFamily: FONT.semiBold, fontSize: 12.5, color: C.destructive60, marginTop: 4 },
  deltaNeutral: { fontFamily: FONT.semiBold, fontSize: 12.5, color: C.textSecondary, marginTop: 4 },
  sheetContent: { padding: 24 },
  sheetTitle: { fontFamily: FONT.bold, fontSize: 17, color: C.textPrimary, marginBottom: 10 },
  sheetText: { fontFamily: FONT.regular, fontSize: 14, color: C.textSecondary, lineHeight: 20 },
  rangeOptionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14 },
  rangeOptionText: { fontFamily: FONT.medium, fontSize: 15, color: C.textPrimary },
  rangeOptionTextActive: { fontFamily: FONT.bold, color: C.accentBlack },
});

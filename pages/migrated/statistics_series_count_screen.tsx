import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { C, FONT, SHADOW } from './theme';
import SimpleBottomSheet from '../../components/SimpleBottomSheet';
import { muscleVolumeApi, MuscleVolumeSeriesGroup } from '../../api/muscleVolume';
import { toLocalISODate } from '../../components/DaySelectorStrip';
import { MACRO_MUSCLE_GROUPS, MacroMuscleGroup, macroGroupFor } from '../../constants/bodyMusclesMap';

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

function subDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() - n);
  return r;
}

function macroSeriesTotals(data: MuscleVolumeSeriesGroup[]): Record<MacroMuscleGroup, number> {
  const out: Record<string, number> = {};
  MACRO_MUSCLE_GROUPS.forEach((g) => (out[g] = 0));
  data.forEach((m) => {
    const macro = macroGroupFor(m.group);
    if (macro) out[macro] += m.series;
  });
  return out as Record<MacroMuscleGroup, number>;
}

function DeltaBadge({ current, previous }: { current: number; previous: number }) {
  const delta = current - previous;
  if (delta === 0) return <Text style={s.deltaNeutral}>=</Text>;
  const positive = delta > 0;
  return (
    <Text style={positive ? s.deltaUp : s.deltaDown}>
      {positive ? '↑' : '↓'} {Math.abs(delta)}
    </Text>
  );
}

function MacroBar({ group, current, previous, maxValue }: { group: string; current: number; previous: number; maxValue: number }) {
  const pct = maxValue > 0 ? Math.max(current > 0 ? 4 : 0, (current / maxValue) * 100) : 0;
  return (
    <View style={s.barRow}>
      <Text style={s.barLabel} numberOfLines={1}>
        {group}
      </Text>
      <View style={s.barTrack}>
        <View style={[s.barFill, { width: `${pct}%` }]} />
      </View>
      <Text style={s.barValue}>{current}</Text>
      <View style={s.deltaWrap}>
        <DeltaBadge current={current} previous={previous} />
      </View>
    </View>
  );
}

export default function StatisticsSeriesCountScreen(props: Props) {
  const { navigation } = props;
  const [range, setRange] = useState(RANGE_OPTIONS[1]);
  const [currentTotals, setCurrentTotals] = useState<Record<MacroMuscleGroup, number>>({} as any);
  const [previousTotals, setPreviousTotals] = useState<Record<MacroMuscleGroup, number>>({} as any);
  const [totalSeries, setTotalSeries] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [rangeSheetVisible, setRangeSheetVisible] = useState(false);

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    const today = new Date();
    const currentEndISO = toLocalISODate(today);
    const previousEndISO = toLocalISODate(subDays(today, range.days));

    Promise.all([
      muscleVolumeApi.getMy(range.days, currentEndISO),
      muscleVolumeApi.getMy(range.days, previousEndISO),
    ])
      .then(([curRes, prevRes]) => {
        if (!active) return;
        const curData = curRes.data?.data || curRes.data;
        const prevData = prevRes.data?.data || prevRes.data;
        setCurrentTotals(macroSeriesTotals(curData?.seriesByMuscle || []));
        setPreviousTotals(macroSeriesTotals(prevData?.seriesByMuscle || []));
        setTotalSeries(curData?.totalSeries || 0);
      })
      .catch(() => {
        if (!active) return;
        setCurrentTotals({} as any);
        setPreviousTotals({} as any);
        setTotalSeries(0);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [range]);

  const sortedGroups = useMemo(() => {
    return [...MACRO_MUSCLE_GROUPS].sort((a, b) => (currentTotals[b] ?? 0) - (currentTotals[a] ?? 0));
  }, [currentTotals]);
  const maxValue = Math.max(1, ...MACRO_MUSCLE_GROUPS.map((g) => currentTotals[g] ?? 0));

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <View style={s.appBar}>
        <TouchableOpacity onPress={() => navigation?.goBack()} style={s.iconBtn}>
          <Ionicons name="chevron-back" size={22} color={C.textPrimary} />
        </TouchableOpacity>
        <Text style={s.appBarTitle} numberOfLines={1}>
          Recuento de series
        </Text>
        <View style={s.iconBtn} />
      </View>

      <ScrollView contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
        <TouchableOpacity style={s.rangePill} onPress={() => setRangeSheetVisible(true)} activeOpacity={0.75}>
          <Text style={s.rangePillText}>{range.label}</Text>
          <Ionicons name="chevron-down" size={16} color={C.textPrimary} />
        </TouchableOpacity>

        <View style={s.summaryCard}>
          <Text style={s.summaryValue}>{totalSeries}</Text>
          <Text style={s.summaryLabel}>series totales registradas</Text>
        </View>

        <View style={s.listCard}>
          <View style={s.listHeaderRow}>
            <Text style={s.listHeaderLabel}>ZONA</Text>
            <Text style={s.listHeaderRight}>VS. PERIODO ANTERIOR</Text>
          </View>
          {isLoading ? (
            <ActivityIndicator size="large" color={C.textSecondary} style={{ paddingVertical: 60 }} />
          ) : (
            sortedGroups.map((group) => (
              <MacroBar
                key={group}
                group={group}
                current={currentTotals[group] ?? 0}
                previous={previousTotals[group] ?? 0}
                maxValue={maxValue}
              />
            ))
          )}
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
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  appBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingVertical: 12 },
  iconBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  appBarTitle: { flex: 1, textAlign: 'center', fontSize: 16, fontFamily: FONT.bold, color: C.textPrimary, marginHorizontal: 4 },
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
  summaryCard: { backgroundColor: C.surface, borderRadius: 20, marginTop: 16, padding: 22, alignItems: 'center', ...SHADOW.card },
  summaryValue: { fontFamily: FONT.black, fontSize: 34, color: C.textPrimary },
  summaryLabel: { fontFamily: FONT.regular, fontSize: 13, color: C.textSecondary, marginTop: 4 },
  listCard: { backgroundColor: C.surface, borderRadius: 20, marginTop: 16, padding: 20, ...SHADOW.card },
  listHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 },
  listHeaderLabel: { fontFamily: FONT.semiBold, fontSize: 11, color: C.textSecondary, letterSpacing: 0.4 },
  listHeaderRight: { fontFamily: FONT.semiBold, fontSize: 11, color: C.textSecondary, letterSpacing: 0.4 },
  barRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  barLabel: { width: 76, fontFamily: FONT.medium, fontSize: 12.5, color: C.textPrimary },
  barTrack: { flex: 1, height: 10, backgroundColor: C.border, borderRadius: 5, overflow: 'hidden', marginHorizontal: 10 },
  barFill: { height: 10, backgroundColor: C.orange, borderRadius: 5 },
  barValue: { width: 24, fontFamily: FONT.semiBold, fontSize: 12.5, color: C.textPrimary, textAlign: 'right' },
  deltaWrap: { width: 46, alignItems: 'flex-end' },
  deltaUp: { fontFamily: FONT.semiBold, fontSize: 11.5, color: C.success60 },
  deltaDown: { fontFamily: FONT.semiBold, fontSize: 11.5, color: C.destructive60 },
  deltaNeutral: { fontFamily: FONT.semiBold, fontSize: 11.5, color: C.textSecondary },
  sheetContent: { padding: 24 },
  rangeOptionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14 },
  rangeOptionText: { fontFamily: FONT.medium, fontSize: 15, color: C.textPrimary },
  rangeOptionTextActive: { fontFamily: FONT.bold, color: C.accentBlack },
});

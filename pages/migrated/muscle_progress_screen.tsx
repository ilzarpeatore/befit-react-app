import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { C, FONT, SHADOW } from './theme';
import MuscleBodyMap, { MuscleVolumeGroup } from '../../components/MuscleBodyMap';
import { muscleVolumeApi, MuscleVolumeData } from '../../api/muscleVolume';

interface Props {
  navigation?: any;
  route?: any;
}

type RangeKey = 'week' | 'month';
const RANGES: { key: RangeKey; label: string; days: number }[] = [
  { key: 'week', label: 'Semanal', days: 7 },
  { key: 'month', label: 'Mensual', days: 30 },
];

const EMPTY: MuscleVolumeData = { volumeByMuscle: [], seriesByMuscle: [], volumeByDate: [], volumeByDateAndMuscle: [], totalVolume: 0, sessionsCount: 0, totalSeries: 0 };

function MuscleVolumeBar({ item, maxVolume }: { item: MuscleVolumeGroup; maxVolume: number }) {
  const pct = maxVolume > 0 ? Math.max(4, (item.volume / maxVolume) * 100) : 0;
  return (
    <View style={s.barRow}>
      <Text style={s.barLabel} numberOfLines={1}>{item.group}</Text>
      <View style={s.barTrack}>
        <View style={[s.barFill, { width: `${pct}%` }]} />
      </View>
      <Text style={s.barValue}>{Math.round(item.volume)} kg</Text>
    </View>
  );
}

export default function MuscleProgressScreen(props: Props) {
  const { navigation } = props;
  const [range, setRange] = useState<RangeKey>('week');
  const [data, setData] = useState<MuscleVolumeData>(EMPTY);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const days = RANGES.find((r) => r.key === range)!.days;
    let active = true;
    setIsLoading(true);
    muscleVolumeApi
      .getMy(days)
      .then((res) => {
        if (!active) return;
        setData(res.data?.data || res.data || EMPTY);
      })
      .catch(() => {
        if (active) setData(EMPTY);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [range]);

  const sortedMuscles = useMemo(
    () => [...data.volumeByMuscle].filter((m) => m.volume > 0).sort((a, b) => b.volume - a.volume),
    [data.volumeByMuscle]
  );
  const maxVolume = sortedMuscles[0]?.volume ?? 0;
  const isEmpty = !isLoading && sortedMuscles.length === 0;

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <View style={s.appBar}>
        <TouchableOpacity onPress={() => navigation?.goBack()} style={s.backBtn}>
          <Ionicons name="chevron-back" size={24} color={C.textPrimary} />
        </TouchableOpacity>
        <Text style={s.appBarTitle}>Progreso muscular</Text>
        <View style={{ width: 32 }} />
      </View>

      <View style={s.rangeRow}>
        {RANGES.map((r) => (
          <TouchableOpacity
            key={r.key}
            style={[s.rangeBtn, range === r.key && s.rangeBtnActive]}
            onPress={() => setRange(r.key)}
            activeOpacity={0.75}
          >
            <Text style={[s.rangeText, range === r.key && s.rangeTextActive]}>{r.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={s.mapCard}>
          {isLoading ? (
            <ActivityIndicator size="large" color={C.textSecondary} style={{ paddingVertical: 60 }} />
          ) : isEmpty ? (
            <Text style={s.emptyText}>Todavía no hay entrenamientos registrados en este periodo.</Text>
          ) : (
            <MuscleBodyMap data={sortedMuscles} height={320} />
          )}
        </View>

        {!isLoading && sortedMuscles.length > 0 && (
          <View style={s.listCard}>
            <Text style={s.listTitle}>Distribución del volumen</Text>
            {sortedMuscles.map((m) => (
              <MuscleVolumeBar key={m.group} item={m} maxVolume={maxVolume} />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  appBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  backBtn: { padding: 4 },
  appBarTitle: { fontSize: 17, fontFamily: FONT.bold, color: C.textPrimary },
  rangeRow: {
    flexDirection: 'row',
    alignSelf: 'center',
    backgroundColor: C.surface,
    borderRadius: 12,
    padding: 4,
    gap: 4,
    marginBottom: 12,
    ...SHADOW.card,
  },
  rangeBtn: { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 8 },
  rangeBtnActive: { backgroundColor: C.accentBlack },
  rangeText: { fontFamily: FONT.semiBold, fontSize: 13, color: C.textSecondary },
  rangeTextActive: { color: '#FFFFFF' },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 32 },
  mapCard: {
    backgroundColor: C.surface,
    borderRadius: 20,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
    ...SHADOW.card,
  },
  emptyText: {
    fontFamily: FONT.regular,
    fontSize: 13,
    color: C.textSecondary,
    textAlign: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  listCard: {
    backgroundColor: C.surface,
    borderRadius: 20,
    padding: 18,
    marginTop: 16,
    ...SHADOW.card,
  },
  listTitle: {
    fontFamily: FONT.bold,
    fontSize: 13,
    color: C.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 14,
  },
  barRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  barLabel: { width: 90, fontFamily: FONT.medium, fontSize: 12, color: C.textPrimary },
  barTrack: { flex: 1, height: 10, backgroundColor: C.border, borderRadius: 5, overflow: 'hidden', marginHorizontal: 8 },
  barFill: { height: 10, backgroundColor: C.accentBlack, borderRadius: 5 },
  barValue: { width: 60, fontFamily: FONT.medium, fontSize: 11, color: C.textSecondary, textAlign: 'right' },
});

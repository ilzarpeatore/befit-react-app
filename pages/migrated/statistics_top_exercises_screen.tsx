import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { C, FONT, SHADOW } from './theme';
import SimpleBottomSheet from '../../components/SimpleBottomSheet';
import MuscleFilterSheet from '../../components/MuscleFilterSheet';
import { exerciseStatsApi, TopExerciseItem } from '../../api/exerciseStats';
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
  { key: '30', label: 'Últimos 30 días', days: 30 },
  { key: '90', label: 'Últimos 90 días', days: 90 },
  { key: '180', label: 'Últimos 6 meses', days: 180 },
  { key: 'all', label: 'Todo el historial', days: 0 },
];

function TopExerciseRow({ item, rank, onPress }: { item: TopExerciseItem; rank: number; onPress: () => void }) {
  return (
    <TouchableOpacity style={s.row} onPress={onPress} activeOpacity={0.7}>
      <Text style={s.rank}>{rank}</Text>
      {item.image ? (
        <Image source={{ uri: item.image }} style={s.thumb} />
      ) : (
        <View style={[s.thumb, s.thumbPlaceholder]}>
          <Ionicons name="barbell-outline" size={18} color={C.textSecondary} />
        </View>
      )}
      <View style={{ flex: 1 }}>
        <Text style={s.title} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={s.subtitle}>
          {item.sessions} {item.sessions === 1 ? 'sesión' : 'sesiones'} · {item.sets} series
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={C.gray40} />
    </TouchableOpacity>
  );
}

export default function StatisticsTopExercisesScreen(props: Props) {
  const { navigation } = props;
  const [range, setRange] = useState(RANGE_OPTIONS[0]);
  const [items, setItems] = useState<TopExerciseItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [rangeSheetVisible, setRangeSheetVisible] = useState(false);
  const [muscleId, setMuscleId] = useState<number | null>(null);
  const [muscleName, setMuscleName] = useState<string>('');
  const [muscleSheetVisible, setMuscleSheetVisible] = useState(false);

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    exerciseStatsApi
      .getMyTopExercises(range.days, toLocalISODate(new Date()), 30, muscleId ?? undefined)
      .then((res) => {
        if (!active) return;
        setItems(res.data?.data || []);
      })
      .catch(() => {
        if (active) setItems([]);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [range, muscleId]);

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <View style={s.appBar}>
        <TouchableOpacity onPress={() => navigation?.goBack()} style={s.iconBtn}>
          <Ionicons name="chevron-back" size={22} color={C.textPrimary} />
        </TouchableOpacity>
        <Text style={s.appBarTitle} numberOfLines={1}>
          Ejercicios principales
        </Text>
        <TouchableOpacity style={s.iconBtn} onPress={() => setMuscleSheetVisible(true)}>
          <Ionicons name="body-outline" size={22} color={muscleId ? C.orange : C.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={s.pillRow}>
          <TouchableOpacity style={s.rangePill} onPress={() => setRangeSheetVisible(true)} activeOpacity={0.75}>
            <Text style={s.rangePillText}>{range.label}</Text>
            <Ionicons name="chevron-down" size={16} color={C.textPrimary} />
          </TouchableOpacity>
          {muscleId ? (
            <TouchableOpacity
              style={s.muscleChip}
              onPress={() => { setMuscleId(null); setMuscleName(''); }}
              activeOpacity={0.75}
            >
              <Text style={s.muscleChipText}>{muscleName}</Text>
              <Ionicons name="close" size={14} color={C.white} />
            </TouchableOpacity>
          ) : null}
        </View>

        <View style={s.listCard}>
          {isLoading ? (
            <ActivityIndicator size="large" color={C.textSecondary} style={{ paddingVertical: 60 }} />
          ) : items.length === 0 ? (
            <Text style={s.emptyText}>Todavía no hay ejercicios registrados en este periodo.</Text>
          ) : (
            items.map((item, idx) => (
              <View key={item.exercise_id}>
                <TopExerciseRow
                  item={item}
                  rank={idx + 1}
                  onPress={() =>
                    navigation?.navigate('MigratedExerciseInfo', {
                      mExerciseId: item.exercise_id,
                      mExerciseName: item.title,
                      initialTab: 'analysis',
                    })
                  }
                />
                {idx < items.length - 1 && <View style={s.divider} />}
              </View>
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

      <MuscleFilterSheet
        visible={muscleSheetVisible}
        onClose={() => setMuscleSheetVisible(false)}
        selectedId={muscleId}
        onSelect={(id, name) => {
          if (id === 0) {
            setMuscleId(null);
            setMuscleName('');
          } else {
            setMuscleId(id);
            setMuscleName(name);
          }
          setMuscleSheetVisible(false);
        }}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  appBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingVertical: 12 },
  iconBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  appBarTitle: { flex: 1, textAlign: 'center', fontSize: 16, fontFamily: FONT.bold, color: C.textPrimary, marginHorizontal: 4 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 32 },
  pillRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  muscleChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: C.orange, borderRadius: 24, paddingHorizontal: 14, paddingVertical: 10,
  },
  muscleChipText: { fontFamily: FONT.semiBold, fontSize: 13, color: C.white },
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
  listCard: { backgroundColor: C.surface, borderRadius: 20, marginTop: 16, padding: 8, ...SHADOW.card },
  emptyText: { fontFamily: FONT.regular, fontSize: 13, color: C.textSecondary, textAlign: 'center', paddingVertical: 52 },
  row: { flexDirection: 'row', alignItems: 'center', padding: 12, gap: 12 },
  rank: { width: 20, fontFamily: FONT.bold, fontSize: 14, color: C.textSecondary, textAlign: 'center' },
  thumb: { width: 48, height: 48, borderRadius: 10, backgroundColor: C.gray5 },
  thumbPlaceholder: { alignItems: 'center', justifyContent: 'center' },
  title: { fontFamily: FONT.semiBold, fontSize: 14.5, color: C.textPrimary },
  subtitle: { fontFamily: FONT.regular, fontSize: 12, color: C.textSecondary, marginTop: 3 },
  divider: { height: 1, backgroundColor: C.border, marginLeft: 76 },
  sheetContent: { padding: 24 },
  rangeOptionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14 },
  rangeOptionText: { fontFamily: FONT.medium, fontSize: 15, color: C.textPrimary },
  rangeOptionTextActive: { fontFamily: FONT.bold, color: C.accentBlack },
});

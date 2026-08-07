import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { C, FONT, SHADOW } from './theme';
import { habitsApi, Habit, HabitSourceType } from '../../api/habits';
import { habitIoniconFor } from '../../constants/habitIcons';

const SOURCE_LABEL: Record<HabitSourceType, string> = {
  coach_assigned: 'De tu coach',
  library: 'Biblioteca',
  personal: 'Personal',
};
const SOURCE_COLOR: Record<HabitSourceType, string> = {
  coach_assigned: C.purple60,
  library: C.blue60,
  personal: C.warning60,
};
const SOURCE_BG: Record<HabitSourceType, string> = {
  coach_assigned: C.purple5,
  library: C.blue5,
  personal: C.warning5,
};

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function isDoneToday(habit: Habit): boolean {
  const today = todayIso();
  return habit.logs.some((l) => l.date.slice(0, 10) === today && l.is_completed);
}

interface Props {
  navigation?: any;
}

export default function HabitsListScreen(props: Props) {
  const { navigation } = props;
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [items, setItems] = useState<Habit[]>([]);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(false);
    try {
      const res = await habitsApi.getMyList(30);
      setItems(res.data?.data ?? []);
    } catch (e) {
      setError(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const openDetail = (habit: Habit) => {
    navigation?.navigate('MigratedHabitDetail', { habitId: habit.id });
  };

  const isGoalHabit = (habit: Habit) => habit.target_value != null && Number(habit.target_value) > 0;

  // Hábitos con objetivo numérico no se marcan "hecho" a ciegas desde aquí
  // (no hay dónde introducir el valor real) — se abre el detalle, que sí
  // pide la cantidad conseguida. Los binarios siguen con toggle instantáneo.
  const toggleToday = async (habit: Habit) => {
    if (togglingId) return;
    if (isGoalHabit(habit)) {
      openDetail(habit);
      return;
    }
    const done = isDoneToday(habit);
    setTogglingId(habit.id);
    try {
      await habitsApi.logHabit(habit.id, { is_completed: !done });
      await load();
    } catch (e) {
      // silencioso — el usuario puede reintentar el tap
    } finally {
      setTogglingId(null);
    }
  };

  const totalStreakDays = useMemo(() => items.reduce((sum, h) => sum + (h.current_streak || 0), 0), [items]);

  const renderCard = (habit: Habit) => {
    const done = isDoneToday(habit);
    return (
      <TouchableOpacity key={habit.id} style={styles.card} activeOpacity={0.8} onPress={() => openDetail(habit)}>
        <View style={styles.iconWrap}>
          <Ionicons name={habitIoniconFor(habit.icon)} size={20} color={C.textPrimary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle} numberOfLines={1}>{habit.title}</Text>
          <View style={styles.metaRow}>
            {!!habit.current_streak && (
              <View style={styles.streakChip}>
                <Ionicons name="flame" size={11} color={C.warning60} />
                <Text style={styles.streakChipText}>{habit.current_streak}</Text>
              </View>
            )}
            <View style={[styles.sourceChip, { backgroundColor: SOURCE_BG[habit.source_type] }]}>
              <Text style={[styles.sourceChipText, { color: SOURCE_COLOR[habit.source_type] }]}>{SOURCE_LABEL[habit.source_type]}</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity
          style={[styles.checkBtn, done && styles.checkBtnDone]}
          activeOpacity={0.75}
          onPress={() => toggleToday(habit)}
          disabled={togglingId === habit.id}
        >
          {togglingId === habit.id ? (
            <ActivityIndicator size="small" color={done ? '#FFFFFF' : C.textSecondary} />
          ) : (
            <Ionicons name="checkmark" size={20} color={done ? '#FFFFFF' : C.gray30} />
          )}
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation?.goBack()}>
          <Ionicons name="chevron-back" size={24} color={C.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mis hábitos</Text>
        <TouchableOpacity onPress={() => navigation?.navigate('MigratedHabitAdd')}>
          <Ionicons name="add-circle" size={26} color={C.textPrimary} />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={C.textPrimary} />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>No se pudieron cargar tus hábitos.</Text>
        </View>
      ) : items.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="flame-outline" size={40} color={C.textSecondary} />
          <Text style={[styles.emptyText, { marginTop: 12 }]}>Todavía no tienes ningún hábito.</Text>
          <TouchableOpacity style={styles.emptyCta} onPress={() => navigation?.navigate('MigratedHabitAdd')}>
            <Text style={styles.emptyCtaText}>Añadir mi primer hábito</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {totalStreakDays > 0 && (
            <View style={styles.summaryCard}>
              <Ionicons name="flame" size={22} color={C.warning60} />
              <Text style={styles.summaryText}>{totalStreakDays} días de racha combinada</Text>
            </View>
          )}
          {items.map(renderCard)}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
  },
  headerTitle: { fontFamily: FONT.bold, fontSize: 17, color: C.textPrimary },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 60, paddingHorizontal: 32 },
  emptyText: { fontFamily: FONT.regular, fontSize: 14, color: C.textSecondary, textAlign: 'center' },
  emptyCta: { marginTop: 18, backgroundColor: C.accentBlack, borderRadius: 24, paddingHorizontal: 22, paddingVertical: 12 },
  emptyCtaText: { fontFamily: FONT.bold, fontSize: 13.5, color: '#FFFFFF' },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 24 },
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: C.warning5,
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
  },
  summaryText: { fontFamily: FONT.bold, fontSize: 13.5, color: C.warning60 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: C.surface,
    borderRadius: 18,
    padding: 14,
    marginBottom: 10,
    ...SHADOW.card,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: C.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: { fontFamily: FONT.bold, fontSize: 14.5, color: C.textPrimary },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 5 },
  streakChip: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: C.warning5, borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2 },
  streakChipText: { fontFamily: FONT.bold, fontSize: 11, color: C.warning60 },
  sourceChip: { borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2 },
  sourceChipText: { fontFamily: FONT.medium, fontSize: 10.5 },
  checkBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: C.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkBtnDone: { backgroundColor: C.success50 },
});

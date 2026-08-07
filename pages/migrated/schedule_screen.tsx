import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, SafeAreaView, Alert, FlatList, Dimensions, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useResponsiveStyleSheet } from '@helper/responsiveStyleSheet';
import { C, FONT } from './theme';
import { workoutHistoryApi } from '../../api/workoutHistory';
import logger from '@helper/logger';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface CalendarWorkoutModel {
  assignmentId?: number;
  title?: string;
}

interface CalendarDayModel {
  date?: string;
  workouts?: CalendarWorkoutModel[];
}

interface ScheduleWorkoutItem {
  id: number;
  title: string;
  duration: string;
  category: string;
  image: string;
  isAssigned: boolean;
}

type IntensityLevel = 'intense' | 'normal' | 'extreme';

function getIntensity(title: string, category: string): { label: string; color: string } {
  const t = `${title.toLowerCase()} ${category.toLowerCase()}`;
  if (t.includes('extreme') || t.includes('rope')) return { label: 'Extreme', color: C.red };
  if (t.includes('normal') || t.includes('strength') || t.includes('power')) return { label: 'Normal', color: C.blue };
  return { label: 'Intense', color: C.orange };
}

function getWorkoutImage(title: string): string {
  const t = title.toLowerCase();
  if (t.includes('cardio') || t.includes('hiit')) return 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400';
  if (t.includes('strength') || t.includes('power') || t.includes('lift')) return 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400';
  if (t.includes('rope') || t.includes('aero')) return 'https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?w=400';
  return 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400';
}

export default function ScheduleScreen(props: any) {
  const [focusedDay, setFocusedDay] = useState(new Date());
  const [selectedDays, setSelectedDays] = useState<Date[]>([new Date()]);
  const [isLoading, setIsLoading] = useState(false);
  const [mProgramDays, setMProgramDays] = useState<CalendarDayModel[]>([]);
  const [mProgramCalendarYear, setMProgramCalendarYear] = useState<number | undefined>(undefined);
  const [mProgramCalendarMonth, setMProgramCalendarMonth] = useState<number | undefined>(undefined);
  const scrollRef = useRef<FlatList>(null);
  const styles = useStyle();

  const weekLetters = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  const getWeekDays = (): Date[] => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - (now.getDay() === 0 ? 6 : now.getDay() - 1));
    const days: Date[] = [];
    for (let i = 0; i < 8; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      days.push(d);
    }
    return days;
  };

  const weekDays = getWeekDays();

  const programWorkoutDates = mProgramDays
    .filter((d) => (d.workouts ?? []).length > 0)
    .map((d) => (d.date ? new Date(d.date) : null))
    .filter((d): d is Date => d !== null);

  const hasWorkout = (day: Date): boolean => {
    return programWorkoutDates.some(
      (d) => d.getFullYear() === day.getFullYear() && d.getMonth() === day.getMonth() && d.getDate() === day.getDate()
    );
  };

  const selectedDateWorkouts = selectedDays.flatMap((selected) => {
    const selectedDateStr = `${selected.getFullYear()}-${String(selected.getMonth() + 1).padStart(2, '0')}-${String(selected.getDate()).padStart(2, '0')}`;
    return mProgramDays
      .filter((d) => d.date === selectedDateStr)
      .flatMap((d) => d.workouts ?? []);
  });

  const workoutItems: ScheduleWorkoutItem[] = selectedDateWorkouts.map((w) => ({
    id: w.assignmentId ?? 0,
    title: w.title ?? '',
    duration: '30min',
    category: 'Cardio',
    image: getWorkoutImage(w.title ?? ''),
    isAssigned: true,
  }));

  const hasWorkouts = workoutItems.length > 0;

  useEffect(() => {
    const now = new Date();
    getProgramCalendarData(now.getFullYear(), now.getMonth() + 1);
  }, []);

  const getProgramCalendarData = async (year: number, month: number) => {
    setMProgramCalendarYear(year);
    setMProgramCalendarMonth(month);
    setIsLoading(true);
    try {
      const res = await workoutHistoryApi.getMyCalendar(month, year);
      const calData: any = res.data.data;
      const days = calData?.days ?? [];
      const mapped: CalendarDayModel[] = days.map((d: any) => ({
        date: d.date,
        workouts: (d.workouts ?? []).map((w: any) => ({
          title: w.title,
          assignmentId: w.assignment_id,
        })),
      }));
      setMProgramDays(mapped);
    } catch (e) {
      logger.error('getProgramCalendarData error:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const onDaySelected = (day: Date) => {
    setSelectedDays([new Date(day.getFullYear(), day.getMonth(), day.getDate())]);
    if (day.getFullYear() !== mProgramCalendarYear || day.getMonth() + 1 !== mProgramCalendarMonth) {
      getProgramCalendarData(day.getFullYear(), day.getMonth() + 1);
    }
  };

  const buildWeekStrip = () => (
    <View style={s.weekStrip}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.weekStripContent}>
        {weekDays.map((day, i) => {
          const isSelected = selectedDays.some(
            (d) => d.getFullYear() === day.getFullYear() && d.getMonth() === day.getMonth() && d.getDate() === day.getDate()
          );
          const dayHasWorkout = hasWorkout(day);
          return (
            <TouchableOpacity key={i} style={s.weekDayWrapper} onPress={() => onDaySelected(day)}>
              <View style={[s.weekDayBox, isSelected && s.weekDayBoxSelected]}>
                <Text style={[s.weekDayLetter, isSelected && s.weekDayLetterSelected]}>{weekLetters[day.getDay() === 0 ? 6 : day.getDay() - 1]}</Text>
                <Text style={[s.weekDayNumber, isSelected && s.weekDayNumberSelected]}>{day.getDate()}</Text>
                <View style={[s.weekDayDot, dayHasWorkout ? s.weekDayDotActive : s.weekDayDotInactive]} />
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );

  const buildEmptyState = () => (
    <View style={s.emptyContainer}>
      <View style={s.emptySpacer} />
      <Image
        source={{ uri: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800' }}
        style={s.emptyImage}
        resizeMode="contain"
      />
      <Text style={[s.emptyTitle, styles.fontBold]}>{"You don't have any active workout for today."}</Text>
      <Text style={[s.emptySubtitle, styles.fontRegular]}>{"Let's log your first meal today and get insights."}</Text>
      <View style={s.emptySpacer} />
      <TouchableOpacity
        style={s.exploreBtn}
        onPress={() => props.navigation.navigate('MigratedViewWorkouts')}
      >
        <Ionicons name="add" size={22} color={C.white} />
        <Text style={[s.exploreBtnText, styles.fontBold]}>Explore Workouts</Text>
      </TouchableOpacity>
      <View style={{ height: 24 }} />
    </View>
  );

  const renderWorkoutItem = ({ item, index }: { item: ScheduleWorkoutItem; index: number }) => {
    const intensity = getIntensity(item.title, item.category);
    return (
      <TouchableOpacity
        style={s.workoutCard}
        onPress={() => {
          props.navigation.navigate('MigratedWorkoutPreview', {
            programDayAssignmentId: item.id,
            mTitle: item.title,
          });
        }}
        activeOpacity={0.7}
      >
        <Image source={{ uri: item.image }} style={s.workoutImage} />
        <View style={s.workoutInfo}>
          <Text style={[s.workoutTitle, styles.fontBold]} numberOfLines={1}>{item.title}</Text>
          <View style={s.workoutMeta}>
            <Text style={[s.workoutMetaText, styles.fontRegular]}>{item.duration}</Text>
            <View style={s.metaDot} />
            <Text style={[s.workoutMetaText, styles.fontRegular]}>{item.category}</Text>
          </View>
          <View style={s.intensityRow}>
            <Ionicons name="flame" size={16} color={intensity.color} />
            <Text style={[s.intensityText, { color: intensity.color }]}>{intensity.label}</Text>
          </View>
        </View>
        <View style={s.workoutActions}>
          <Ionicons name="chevron-forward" size={24} color={C.gray40} />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => props.navigation.goBack()} style={s.backBtn}>
          <Ionicons name="chevron-back" size={20} color={C.textPrimary} />
        </TouchableOpacity>
        <Text style={[s.headerTitle, styles.fontBold]}>Workout Schedule (Daily)</Text>
        <TouchableOpacity style={s.backBtn}>
          <Ionicons name="calendar-outline" size={22} color={C.textPrimary} />
        </TouchableOpacity>
      </View>

      <View style={s.body}>
        {buildWeekStrip()}

        {isLoading && workoutItems.length === 0 ? (
          <View style={s.loadingOverlay}>
            <ActivityIndicator size="large" color={C.orange} />
          </View>
        ) : !hasWorkouts ? (
          buildEmptyState()
        ) : (
          <FlatList
            ref={scrollRef}
            data={workoutItems}
            keyExtractor={(item) => `${item.id}`}
            renderItem={renderWorkoutItem}
            contentContainerStyle={s.workoutListContent}
          />
        )}
      </View>

      {hasWorkouts && (
        <TouchableOpacity
          style={s.fab}
          onPress={() => props.navigation.navigate('MigratedViewWorkouts')}
        >
          <Ionicons name="add" size={28} color={C.white} />
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: C.bg,
  },
  backBtn: { width: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, color: C.textPrimary, flex: 1, textAlign: 'center' },
  body: { flex: 1 },
  loadingOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  weekStrip: { height: 86, paddingHorizontal: 12 },
  weekStripContent: { alignItems: 'center' },
  weekDayWrapper: { marginHorizontal: 4, marginVertical: 8 },
  weekDayBox: {
    width: 54,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: C.gray70,
    paddingVertical: 10,
  },
  // weekDayBoxSelected usaba C.white como fondo - ese token ahora es el color
  // de TEXTO principal (#000000), no una superficie blanca real; C.surface es
  // el token correcto para un fondo blanco.
  weekDayBoxSelected: { backgroundColor: C.surface, borderColor: C.orange, borderWidth: 1.5 },
  weekDayLetter: { fontSize: 13, fontWeight: '500', color: C.gray40 },
  weekDayLetterSelected: { color: C.textPrimary },
  weekDayNumber: { fontSize: 18, fontWeight: '700', color: C.textPrimary, marginTop: 4 },
  weekDayNumberSelected: { color: C.textPrimary },
  weekDayDot: { width: 5, height: 5, borderRadius: 2.5, marginTop: 6 },
  weekDayDotActive: { backgroundColor: C.orange },
  weekDayDotInactive: { backgroundColor: 'transparent' },
  emptyContainer: { flex: 1, paddingHorizontal: 24, alignItems: 'center' },
  emptySpacer: { flex: 1 },
  emptyImage: { width: SCREEN_WIDTH * 0.7, height: 280 },
  emptyTitle: { fontSize: 22, fontWeight: '800', color: C.textPrimary, textAlign: 'center', marginTop: 32, lineHeight: 30 },
  emptySubtitle: { fontSize: 15, color: C.gray40, textAlign: 'center', marginTop: 12, lineHeight: 24 },
  exploreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.orange,
    borderRadius: 16,
    paddingVertical: 14,
    width: '100%',
    height: 56,
    gap: 8,
  },
  exploreBtnText: { fontSize: 16, color: '#FFFFFF', fontWeight: '700' },
  workoutListContent: { padding: 20, paddingTop: 8 },
  workoutCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.surface,
    borderRadius: 20,
    padding: 12,
    marginBottom: 14,
    shadowColor: C.gray80,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  workoutImage: { width: 72, height: 72, borderRadius: 16 },
  workoutInfo: { flex: 1, marginLeft: 14 },
  workoutTitle: { fontSize: 15, fontWeight: '700', color: C.textPrimary },
  workoutMeta: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  workoutMetaText: { fontSize: 13, color: C.gray40 },
  metaDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: C.gray40, marginHorizontal: 8 },
  intensityRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  intensityText: { fontSize: 13, fontWeight: '600', marginLeft: 4 },
  workoutActions: { flexDirection: 'row', alignItems: 'center' },
  deleteCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: C.red,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: C.orange,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: C.gray80,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
});

function useStyle() {
  return useResponsiveStyleSheet({
    fontBold: { fontFamily: FONT.bold },
    fontMedium: { fontFamily: FONT.medium },
    fontRegular: { fontFamily: FONT.regular },
    fontSemiBold: { fontFamily: FONT.semiBold },
  });
}
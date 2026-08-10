import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useResponsiveStyleSheet } from '@helper/responsiveStyleSheet';
import { C, FONT } from './theme';
import { workoutHistoryApi, CompletedSessionItem } from '../../api/workoutHistory';

interface CalendarWorkout {
  title?: string;
  assignmentId?: number;
  workoutTemplateId?: number;
}

// Mismo fallback por palabra clave que usa MigratedSchedule (schedule_screen.tsx) —
// el backend de getMyCalendar no expone thumbnail real del WorkoutTemplate, así que
// se replica aquí el mismo criterio para que ambas pantallas se vean consistentes.
function getWorkoutImage(title: string): string {
  const t = (title || '').toLowerCase();
  if (t.includes('cardio') || t.includes('hiit')) return 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400';
  if (t.includes('strength') || t.includes('power') || t.includes('lift')) return 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400';
  if (t.includes('rope') || t.includes('aero')) return 'https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?w=400';
  return 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400';
}

interface CalendarDayModel {
  date: string;
  inMonth: boolean;
  workouts: CalendarWorkout[];
}

interface MyProgramCalendarScreenProps {
  navigation?: any;
  route?: any;
}

const WEEKDAY_LABELS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
const MONTH_NAMES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
const MONTH_NAMES_SHORT = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

function toDateOnly(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function toDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function addDays(d: Date, n: number): Date {
  const copy = new Date(d);
  copy.setDate(copy.getDate() + n);
  return copy;
}

function startOfWeekMonday(d: Date): Date {
  const copy = toDateOnly(d);
  const day = copy.getDay(); // 0=Sun..6=Sat
  const diff = day === 0 ? -6 : 1 - day;
  return addDays(copy, diff);
}

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function formatMonthYear(date: Date): string {
  return `${MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}`;
}

function formatWeekRange(weekStart: Date): string {
  const weekEnd = addDays(weekStart, 6);
  if (weekStart.getMonth() === weekEnd.getMonth()) {
    return `${weekStart.getDate()} - ${weekEnd.getDate()} ${MONTH_NAMES_SHORT[weekStart.getMonth()]} ${weekStart.getFullYear()}`;
  }
  return `${weekStart.getDate()} ${MONTH_NAMES_SHORT[weekStart.getMonth()]} - ${weekEnd.getDate()} ${MONTH_NAMES_SHORT[weekEnd.getMonth()]} ${weekEnd.getFullYear()}`;
}

function formatDayLabel(dateKey: string): string {
  const d = new Date(`${dateKey}T00:00:00`);
  const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  return `${days[d.getDay()]}, ${d.getDate()} ${MONTH_NAMES[d.getMonth()]}`;
}

function chunkIntoWeeks<T>(days: T[]): T[][] {
  const weeks: T[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }
  return weeks;
}

export default function MyProgramCalendarScreen(props: MyProgramCalendarScreenProps) {
  const { navigation } = props;
  const today = toDateOnly(new Date());
  const todayKey = toDateKey(today);

  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [mDays, setMDays] = useState<CalendarDayModel[]>([]);
  const [loadedYm, setLoadedYm] = useState<string | null>(null);
  const [completedSessions, setCompletedSessions] = useState<CompletedSessionItem[]>([]);

  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [periodMode, setPeriodMode] = useState<'week' | 'month'>('month');
  const [selectedMonth, setSelectedMonth] = useState(startOfMonth(today));
  const [weekAnchor, setWeekAnchor] = useState(startOfWeekMonday(today));
  const [selectedDayKey, setSelectedDayKey] = useState<string | null>(todayKey);

  const dominantAnchor = periodMode === 'week' ? addDays(weekAnchor, 3) : selectedMonth;
  const ym = `${dominantAnchor.getFullYear()}-${dominantAnchor.getMonth() + 1}`;

  const getData = useCallback(async (month: number, year: number, ymKey: string) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await workoutHistoryApi.getMyCalendar(month, year);
      const calData: any = res.data.data;
      const days = calData?.days ?? [];
      const mapped: CalendarDayModel[] = days.map((d: any) => ({
        date: d.date,
        inMonth: !!d.in_month,
        workouts: (d.workouts ?? []).map((w: any) => ({
          title: w.title,
          assignmentId: w.assignment_id,
          workoutTemplateId: w.id,
        })),
      }));
      setMDays(mapped);
      setLoadedYm(ymKey);
    } catch {
      setErrorMessage('No se pudo cargar el calendario.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (ym === loadedYm) return;
    getData(dominantAnchor.getMonth() + 1, dominantAnchor.getFullYear(), ym);
  }, [ym, loadedYm, getData]);

  // Mismo criterio que el panel admin (UserDetailView.tsx: completedAssignments /
  // completedByTemplate / completedByDate) para que "realizado en verde" signifique
  // exactamente lo mismo en la app y en el panel del coach.
  useEffect(() => {
    workoutHistoryApi
      .getMyCompletedSessions()
      .then((res) => setCompletedSessions(res.data?.data ?? []))
      .catch(() => setCompletedSessions([]));
  }, []);

  const completedAssignmentIds = useMemo(
    () => new Set(completedSessions.filter((s) => s.program_day_assignment_id != null).map((s) => s.program_day_assignment_id as number)),
    [completedSessions]
  );
  const completedByTemplate = useMemo(
    () => new Set(completedSessions.filter((s) => s.workout_template_id != null && s.date).map((s) => `${String(s.date).slice(0, 10)}|${s.workout_template_id}`)),
    [completedSessions]
  );
  const completedByDate = useMemo(
    () => new Set(completedSessions.filter((s) => s.date).map((s) => String(s.date).slice(0, 10))),
    [completedSessions]
  );

  const isWorkoutCompleted = useCallback(
    (w: CalendarWorkout, dateKey: string) =>
      (w.assignmentId != null && completedAssignmentIds.has(w.assignmentId)) ||
      (w.workoutTemplateId != null && completedByTemplate.has(`${dateKey}|${w.workoutTemplateId}`)) ||
      completedByDate.has(dateKey),
    [completedAssignmentIds, completedByTemplate, completedByDate]
  );

  const goPrev = () => {
    setSelectedDayKey(null);
    if (periodMode === 'month') {
      setSelectedMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    } else {
      setWeekAnchor((prev) => addDays(prev, -7));
    }
  };

  const goNext = () => {
    setSelectedDayKey(null);
    if (periodMode === 'month') {
      setSelectedMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    } else {
      setWeekAnchor((prev) => addDays(prev, 7));
    }
  };

  const weekDays: CalendarDayModel[] = (() => {
    const anchorKey = toDateKey(weekAnchor);
    const idx = mDays.findIndex((d) => d.date === anchorKey);
    if (idx === -1) return [];
    return mDays.slice(idx, idx + 7);
  })();

  const visibleDays = periodMode === 'week' ? weekDays : mDays;
  const monthWeeks = periodMode === 'month' ? chunkIntoWeeks(mDays) : [];
  const selectedDay = visibleDays.find((d) => d.date === selectedDayKey) || null;

  const daysWithWorkouts = visibleDays.filter((d) => d.workouts.length > 0 && (periodMode === 'week' || d.inMonth));

  const goToWorkout = (w: CalendarWorkout, dateKey: string) => {
    if (w.assignmentId == null) return;
    if (isWorkoutCompleted(w, dateKey)) {
      // Día ya realizado: vista de solo lectura de lo que se hizo de verdad
      // (mismo destino que Historial de entrenamientos), no el editor/preview
      // de la plantilla. IMPORTANTE: no mandar también workoutTemplateId aquí
      // — a diferencia de CompletedSessionItem (donde asignación y plantilla
      // suelta son mutuamente excluyentes), en el calendario ambos IDs
      // siempre vienen rellenos a la vez; si se manda workout_template_id el
      // backend (SessionDetailController::getSessionDetail) lo trata como
      // sesión "standalone" y busca el review por workout_template_id+fecha
      // en vez de por program_day_assignment_id, perdiendo las series reales
      // registradas (verificado con curl: total_sets pasa de 15 a 0).
      navigation?.navigate('MigratedSessionHistoryDetail', {
        programDayAssignmentId: w.assignmentId,
        title: w.title,
      });
      return;
    }
    navigation?.navigate('MigratedWorkoutPreview', {
      programDayAssignmentId: w.assignmentId,
      mTitle: w.title,
    });
  };

  const renderWorkoutCard = (w: CalendarWorkout, dateKey: string, key: string | number) => {
    const completed = isWorkoutCompleted(w, dateKey);
    return (
      <TouchableOpacity
        key={key}
        style={[styles.workoutCard, completed && styles.workoutCardCompleted]}
        activeOpacity={0.7}
        onPress={() => goToWorkout(w, dateKey)}
      >
        <Image source={{ uri: getWorkoutImage(w.title || '') }} style={styles.workoutImage} />
        <View style={{ flex: 1, marginLeft: 14 }}>
          <Text style={styles.workoutTitle} numberOfLines={1}>{w.title || ''}</Text>
          {completed && (
            <View style={styles.completedBadge}>
              <Ionicons name="checkmark-circle" size={13} color={C.success} />
              <Text style={styles.completedBadgeText}>Completado</Text>
            </View>
          )}
        </View>
        <Ionicons name="chevron-forward" size={20} color={C.textSecondary} />
      </TouchableOpacity>
    );
  };

  const renderDayCell = (day: CalendarDayModel, keyPrefix: string, big: boolean) => {
    const isToday = day.date === todayKey;
    const isSelected = day.date === selectedDayKey;
    const hasWorkout = day.workouts.length > 0;
    const hasCompletedWorkout = day.workouts.some((w) => isWorkoutCompleted(w, day.date));
    const dateObj = new Date(`${day.date}T00:00:00`);
    return (
      <TouchableOpacity
        key={`${keyPrefix}-${day.date}`}
        style={[
          styles.dayCell,
          big && styles.dayCellBig,
          isSelected && (big ? styles.dayCellBigSelected : styles.dayCellSelected),
          isToday && !isSelected && styles.dayCellToday,
        ]}
        activeOpacity={0.7}
        onPress={() => setSelectedDayKey(day.date)}
      >
        {big && (
          <Text style={styles.dayCellLetter}>
            {WEEKDAY_LABELS[dateObj.getDay() === 0 ? 6 : dateObj.getDay() - 1]}
          </Text>
        )}
        <Text
          style={[
            styles.dayCellText,
            !day.inMonth && periodMode === 'month' && styles.dayCellTextMuted,
            isSelected && !big && styles.dayCellTextSelected,
          ]}
        >
          {dateObj.getDate()}
        </Text>
        {hasWorkout && (
          <View
            style={[
              styles.dayDot,
              hasCompletedWorkout && styles.dayDotCompleted,
              isSelected && !big && styles.dayDotSelected,
            ]}
          />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.header}>Mi programa</Text>
        <View style={styles.viewToggle}>
          <TouchableOpacity
            style={[styles.viewToggleBtn, viewMode === 'calendar' && styles.viewToggleBtnActive]}
            onPress={() => setViewMode('calendar')}
          >
            <Ionicons name="calendar-outline" size={18} color={viewMode === 'calendar' ? '#FFFFFF' : C.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.viewToggleBtn, viewMode === 'list' && styles.viewToggleBtnActive]}
            onPress={() => setViewMode('list')}
          >
            <Ionicons name="list-outline" size={18} color={viewMode === 'list' ? '#FFFFFF' : C.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.periodToggleRow}>
        <TouchableOpacity
          style={[styles.periodChip, periodMode === 'week' && styles.periodChipActive]}
          onPress={() => {
            setPeriodMode('week');
            setWeekAnchor(startOfWeekMonday(today));
            setSelectedDayKey(todayKey);
          }}
        >
          <Text style={[styles.periodChipText, periodMode === 'week' && styles.periodChipTextActive]}>Semana</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.periodChip, periodMode === 'month' && styles.periodChipActive]}
          onPress={() => {
            setPeriodMode('month');
            setSelectedMonth(startOfMonth(today));
            setSelectedDayKey(todayKey);
          }}
        >
          <Text style={[styles.periodChipText, periodMode === 'month' && styles.periodChipTextActive]}>Mes</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.monthRow}>
        <TouchableOpacity style={styles.monthBtn} onPress={goPrev}>
          <Ionicons name="chevron-back" size={22} color={C.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.monthText}>
          {periodMode === 'month' ? formatMonthYear(selectedMonth) : formatWeekRange(weekAnchor)}
        </Text>
        <TouchableOpacity style={styles.monthBtn} onPress={goNext}>
          <Ionicons name="chevron-forward" size={22} color={C.textPrimary} />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={C.textPrimary} />
        </View>
      ) : errorMessage ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>{errorMessage}</Text>
        </View>
      ) : viewMode === 'calendar' ? (
        <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
          {periodMode === 'month' && (
            <View style={styles.weekdayHeaderRow}>
              {WEEKDAY_LABELS.map((l, i) => (
                <Text key={i} style={styles.weekdayHeaderText}>{l}</Text>
              ))}
            </View>
          )}

          {periodMode === 'month' ? (
            monthWeeks.map((week, wi) => (
              <View key={wi} style={styles.weekRow}>
                {week.map((day) => renderDayCell(day, `m${wi}`, false))}
              </View>
            ))
          ) : (
            <View style={styles.weekRow}>
              {weekDays.map((day) => renderDayCell(day, 'w', true))}
            </View>
          )}

          <View style={styles.selectedDaySection}>
            <Text style={styles.selectedDayTitle}>
              {selectedDayKey ? formatDayLabel(selectedDayKey) : 'Selecciona un día'}
            </Text>
            {selectedDay && selectedDay.workouts.length > 0 ? (
              selectedDay.workouts.map((w, wi) => renderWorkoutCard(w, selectedDay.date, wi))
            ) : selectedDayKey ? (
              <View style={styles.restDayCard}>
                <Ionicons name="moon-outline" size={18} color={C.textSecondary} />
                <Text style={styles.restDayText}>Día de descanso</Text>
              </View>
            ) : null}
          </View>
        </ScrollView>
      ) : daysWithWorkouts.length === 0 && periodMode === 'month' ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No tienes entrenamientos programados este mes.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ paddingVertical: 16 }}>
          {(periodMode === 'week' ? visibleDays : daysWithWorkouts).map((day, dayIdx) => (
            <View key={dayIdx} style={styles.daySection}>
              <Text style={styles.dayDate}>{formatDayLabel(day.date)}</Text>
              {day.workouts.length > 0 ? (
                day.workouts.map((w, wIdx) => renderWorkoutCard(w, day.date, wIdx))
              ) : (
                <View style={styles.restDayCard}>
                  <Ionicons name="moon-outline" size={16} color={C.textSecondary} />
                  <Text style={styles.restDayText}>Día de descanso</Text>
                </View>
              )}
            </View>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  header: { fontSize: 20, fontFamily: FONT.bold, color: C.textPrimary },
  viewToggle: {
    flexDirection: 'row',
    backgroundColor: C.surfaceLight,
    borderRadius: 10,
    padding: 3,
    gap: 2,
  },
  viewToggleBtn: {
    width: 34,
    height: 30,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewToggleBtnActive: { backgroundColor: '#1C1C1E' },
  periodToggleRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginTop: 12,
    gap: 8,
  },
  periodChip: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: C.surfaceLight,
  },
  periodChipActive: { backgroundColor: '#1C1C1E' },
  periodChipText: { fontFamily: FONT.semiBold, fontSize: 13, color: C.textSecondary },
  periodChipTextActive: { color: '#FFFFFF' },
  monthRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 12,
  },
  monthBtn: { padding: 8 },
  monthText: { fontSize: 16, fontFamily: FONT.bold, color: C.textPrimary },
  weekdayHeaderRow: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    marginBottom: 4,
  },
  weekdayHeaderText: {
    flex: 1,
    textAlign: 'center',
    fontFamily: FONT.semiBold,
    fontSize: 12,
    color: C.textSecondary,
  },
  weekRow: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    marginBottom: 4,
  },
  dayCell: {
    flex: 1,
    aspectRatio: 1,
    marginHorizontal: 2,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  dayCellBig: {
    aspectRatio: 0.85,
    borderWidth: 1,
    borderColor: C.gray70,
    paddingVertical: 10,
    gap: 4,
  },
  dayCellBigSelected: {
    backgroundColor: C.surface,
    borderColor: C.orange,
    borderWidth: 1.5,
  },
  dayCellSelected: {
    backgroundColor: '#1C1C1E',
  },
  dayCellToday: {
    borderWidth: 1.5,
    borderColor: C.textPrimary,
  },
  dayCellLetter: {
    fontFamily: FONT.medium,
    fontSize: 13,
    color: C.textSecondary,
  },
  dayCellText: {
    fontFamily: FONT.semiBold,
    fontSize: 14,
    color: C.textPrimary,
  },
  dayCellTextMuted: {
    color: C.textTertiary,
  },
  dayCellTextSelected: {
    color: '#FFFFFF',
  },
  dayDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: C.orange,
  },
  dayDotCompleted: {
    backgroundColor: C.success,
  },
  dayDotSelected: {
    backgroundColor: '#FFFFFF',
  },
  selectedDaySection: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  selectedDayTitle: {
    fontFamily: FONT.bold,
    fontSize: 15,
    color: C.textPrimary,
    marginBottom: 8,
  },
  daySection: { marginBottom: 16 },
  dayDate: { fontSize: 13, fontFamily: FONT.regular, color: C.textSecondary, paddingHorizontal: 16 },
  workoutCard: {
    backgroundColor: C.surface,
    borderRadius: 20,
    padding: 12,
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: C.gray80,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  workoutImage: { width: 72, height: 72, borderRadius: 16 },
  workoutCardCompleted: {
    backgroundColor: C.success10,
    borderWidth: 1,
    borderColor: C.success50,
  },
  workoutTitle: { flex: 1, fontSize: 15, fontFamily: FONT.bold, color: C.textPrimary },
  completedBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  completedBadgeText: { fontFamily: FONT.semiBold, fontSize: 11.5, color: C.success },
  restDayCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: C.surfaceLight,
    borderRadius: 12,
    padding: 14,
    marginTop: 8,
  },
  restDayText: { fontFamily: FONT.regular, fontSize: 13, color: C.textSecondary },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 60, paddingHorizontal: 32 },
  emptyText: { fontSize: 16, fontFamily: FONT.medium, color: C.textSecondary, textAlign: 'center' },
  loader: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});

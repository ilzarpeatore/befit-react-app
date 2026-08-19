import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Image } from 'expo-image';
import { useResponsiveStyleSheet } from '@helper/responsiveStyleSheet';
import { Box } from '@components/ui/box';
import { Text } from '@components/ui/text';
import { Pressable } from '@components/ui/pressable';
import { Icon } from '@components/ui/icon';
import { Spinner } from '@components/ui/spinner';
import { Card } from '@components/ui/card';
import { HStack } from '@components/ui/hstack';
import { VStack } from '@components/ui/vstack';
import { Button, ButtonText } from '@components/ui/button';
import { C, FONT } from './theme';
import { workoutHistoryApi, CompletedSessionItem } from '../../api/workoutHistory';
import { adaptiveWeekPlansApi } from '../../api/adaptiveWeekPlans';
import { checkinsApi, checkinTypeLabel, CheckInAssignment } from '../../api/checkins';

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
  const [pendingCheckins, setPendingCheckins] = useState<CheckInAssignment[]>([]);
  // Check-ins/formularios con fecha fija (scheduled_date) puesta por el
  // coach, agrupados por dateKey -- a diferencia de pendingCheckins (solo
  // recurrentes/cuestionarios, solo válidos para "hoy"), estos sí se
  // proyectan sobre cualquier día del calendario. Ver getAssignedCalendar.
  const [scheduledTasksByDate, setScheduledTasksByDate] = useState<Record<string, CheckInAssignment[]>>({});

  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [periodMode, setPeriodMode] = useState<'week' | 'month'>('month');
  const [selectedMonth, setSelectedMonth] = useState(startOfMonth(today));
  const [weekAnchor, setWeekAnchor] = useState(startOfWeekMonday(today));
  const [selectedDayKey, setSelectedDayKey] = useState<string | null>(todayKey);

  // Modo vida real (2026-08-12): el cliente marca desde su calendario qué
  // días no podrá entrenar. Sigue pasando por aprobación del coach — esto
  // solo crea la propuesta (POST request-unavailable), nunca aplica nada
  // directamente.
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedDates, setSelectedDates] = useState<Set<string>>(new Set());
  const [submittingSelection, setSubmittingSelection] = useState(false);

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

    // Best-effort, independiente del calendario de workouts -- si falla no
    // debe tumbar la carga del calendario en sí.
    checkinsApi
      .getAssignedCalendar(month, year)
      .then((res) => {
        const grouped: Record<string, CheckInAssignment[]> = {};
        (res.data?.data ?? []).forEach((a) => {
          const key = (a.scheduled_date || '').slice(0, 10);
          if (!key) return;
          (grouped[key] ||= []).push(a);
        });
        setScheduledTasksByDate(grouped);
      })
      .catch(() => setScheduledTasksByDate({}));
  }, []);

  useEffect(() => {
    if (ym === loadedYm) return;
    getData(dominantAnchor.getMonth() + 1, dominantAnchor.getFullYear(), ym);
  }, [ym, loadedYm, getData]);

  // BUG REAL (2026-08-13, reportado por cliente): antes había un tercer
  // criterio `completedByDate.has(dateKey)` que marcaba TODOS los workouts
  // de un día como "hechos" en cuanto había CUALQUIER sesión completada esa
  // fecha, sin comprobar a qué assignment/template pertenecía realmente esa
  // sesión. Con datos reales (cliente 8, 2026-08-07) ese día tenía 6
  // workouts programados (varios programas activos coincidiendo en la misma
  // fecha) y solo 3 estaban realmente completados — el fallback por fecha
  // pintaba los 6 en verde. Se elimina: solo cuentan como "hecho" los dos
  // matches específicos (por program_day_assignment_id o por
  // fecha+workout_template_id), igual que hace el backend para decidir el
  // detalle de sesión (SessionDetailController).
  useEffect(() => {
    workoutHistoryApi
      .getMyCompletedSessions()
      .then((res) => setCompletedSessions(res.data?.data ?? []))
      .catch(() => setCompletedSessions([]));
  }, []);

  // Sincroniza con "Mi plan de hoy" de Home (home_screen_modern.tsx): las
  // mismas tareas no-workout del coach (check-ins/formularios pendientes)
  // deben verse también aquí. A diferencia de los workouts (que sí tienen
  // fecha exacta vía ProgramDayAssignment), un CheckInAssignment solo tiene
  // recurrencia (daily/weekly/monthly) y un `is_due` que el backend calcula
  // para "ahora" — no hay una fecha de vencimiento concreta que se le pueda
  // asignar a un día pasado o futuro del calendario. Por eso solo se
  // muestran en el panel del día seleccionado cuando ese día es HOY (ver
  // uso más abajo), en vez de intentar proyectarlos sobre una celda
  // concreta del grid con datos que no existen.
  useEffect(() => {
    checkinsApi
      .getAssignedList()
      // Las de fecha fija (scheduled_date) se resuelven vía
      // scheduledTasksByDate/getAssignedCalendar más arriba, sea o no hoy su
      // fecha -- si se dejaran aquí también, un scheduled_date de hoy
      // aparecería duplicado (una vez por cada fuente).
      .then((res) => setPendingCheckins((res.data?.data ?? []).filter((a) => a.is_due && !a.scheduled_date)))
      .catch(() => setPendingCheckins([]));
  }, []);

  const completedAssignmentIds = useMemo(
    () => new Set(completedSessions.filter((s) => s.program_day_assignment_id != null).map((s) => s.program_day_assignment_id as number)),
    [completedSessions]
  );
  const completedByTemplate = useMemo(
    () => new Set(completedSessions.filter((s) => s.workout_template_id != null && s.date).map((s) => `${String(s.date).slice(0, 10)}|${s.workout_template_id}`)),
    [completedSessions]
  );

  const isWorkoutCompleted = useCallback(
    (w: CalendarWorkout, dateKey: string) =>
      (w.assignmentId != null && completedAssignmentIds.has(w.assignmentId)) ||
      (w.workoutTemplateId != null && completedByTemplate.has(`${dateKey}|${w.workoutTemplateId}`)),
    [completedAssignmentIds, completedByTemplate]
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

  // Cualquier día puede tener tareas de coach (check-ins recurrentes solo si
  // es HOY, o de fecha fija en cualquier día) sin tener ningún workout
  // programado — no debe tratarse como "día de descanso" ni desaparecer del
  // listado en ese caso.
  const checkinsForDay = useCallback(
    (dateKey: string): CheckInAssignment[] => [
      ...(dateKey === todayKey ? pendingCheckins : []),
      ...(scheduledTasksByDate[dateKey] ?? []),
    ],
    [pendingCheckins, scheduledTasksByDate, todayKey]
  );
  const daysWithWorkouts = visibleDays.filter(
    (d) => (d.workouts.length > 0 || checkinsForDay(d.date).length > 0) && (periodMode === 'week' || d.inMonth)
  );

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
      <Pressable key={key} onPress={() => goToWorkout(w, dateKey)}>
        <Card
          variant="elevated"
          className="flex-row items-center p-3"
          style={completed ? styles.workoutCardCompleted : { marginTop: 8 }}
        >
          <Image source={{ uri: getWorkoutImage(w.title || '') }} contentFit="cover" style={styles.workoutImage} />
          <VStack style={{ flex: 1, marginLeft: 14 }}>
            <Text style={styles.workoutTitle} numberOfLines={2}>{w.title || ''}</Text>
            {completed && (
              <HStack space="xs" style={{ marginTop: 4 }}>
                <Icon name="checkmark-circle" size={13} color={C.success} />
                <Text style={styles.completedBadgeText}>Completado</Text>
              </HStack>
            )}
          </VStack>
          <Icon name="chevron-forward" size={20} color={C.textSecondary} />
        </Card>
      </Pressable>
    );
  };

  const renderCheckinCard = (a: CheckInAssignment) => (
    <Pressable
      key={`checkin-${a.id}`}
      onPress={() => navigation?.navigate('MigratedCheckInFill', { formAssignmentId: a.id, formId: a.form_id, title: a.form.title })}
    >
      <Card variant="elevated" className="flex-row items-center p-3" style={{ marginTop: 8 }}>
        <Box style={styles.checkinIconWrap}>
          <Icon name="clipboard-outline" size={26} color={C.warning60} />
        </Box>
        <VStack style={{ flex: 1, marginLeft: 14 }}>
          <Text style={styles.workoutTitle} numberOfLines={2}>{a.form.title}</Text>
          <Text style={styles.checkinSubtitle}>{checkinTypeLabel(a)}</Text>
        </VStack>
        <Icon name="chevron-forward" size={20} color={C.textSecondary} />
      </Card>
    </Pressable>
  );

  const toggleDaySelection = (day: CalendarDayModel) => {
    if (day.workouts.length === 0) return; // nada que marcar en un día de descanso real
    setSelectedDates((prev) => {
      const next = new Set(prev);
      if (next.has(day.date)) next.delete(day.date);
      else next.add(day.date);
      return next;
    });
  };

  const cancelSelectionMode = () => {
    setSelectionMode(false);
    setSelectedDates(new Set());
  };

  const submitUnavailableSelection = async () => {
    if (selectedDates.size === 0) return;

    // Agrupar por semana (lunes) -- una solicitud = una semana calendario,
    // igual que el flujo del coach (AdaptiveWeekPlanner::persist()).
    const byWeek = new Map<string, number[]>();
    for (const dateKey of selectedDates) {
      const dateObj = new Date(`${dateKey}T00:00:00`);
      const weekStartKey = toDateKey(startOfWeekMonday(dateObj));
      const day = mDays.find((d) => d.date === dateKey);
      const ids = (day?.workouts ?? []).map((w) => w.assignmentId).filter((id): id is number => id != null);
      if (!ids.length) continue;
      byWeek.set(weekStartKey, [...(byWeek.get(weekStartKey) ?? []), ...ids]);
    }

    if (byWeek.size === 0) return;

    setSubmittingSelection(true);
    let okCount = 0;
    let errCount = 0;
    for (const [weekStart, ids] of byWeek) {
      try {
        await adaptiveWeekPlansApi.requestUnavailable(weekStart, ids);
        okCount++;
      } catch {
        errCount++;
      }
    }
    setSubmittingSelection(false);
    cancelSelectionMode();

    if (errCount === 0) {
      Alert.alert(
        'Solicitud enviada',
        okCount > 1
          ? `Se enviaron ${okCount} solicitudes (una por semana). Tu entrenador las revisará antes de que se apliquen.`
          : 'Tu entrenador la revisará antes de que se aplique a tu calendario.'
      );
    } else {
      Alert.alert('Solicitud parcial', `${okCount} semana(s) enviada(s) correctamente, ${errCount} fallaron. Inténtalo de nuevo.`);
    }
  };

  const renderDayCell = (day: CalendarDayModel, keyPrefix: string, big: boolean) => {
    const isToday = day.date === todayKey;
    const isSelected = day.date === selectedDayKey;
    const hasWorkout = day.workouts.length > 0;
    const hasCompletedWorkout = day.workouts.some((w) => isWorkoutCompleted(w, day.date));
    // Hoy puede tener check-ins/formularios pendientes sin ningún workout —
    // igual que en el panel del día seleccionado, se refleja con un punto
    // propio (color warning) para que la celda no se vea como día libre.
    const hasCheckinTasks = checkinsForDay(day.date).length > 0;
    const isMarkedUnavailable = selectionMode && selectedDates.has(day.date);
    const dateObj = new Date(`${day.date}T00:00:00`);
    return (
      <Pressable
        key={`${keyPrefix}-${day.date}`}
        style={[
          styles.dayCell,
          big && styles.dayCellBig,
          isSelected && !selectionMode && (big ? styles.dayCellBigSelected : styles.dayCellSelected),
          isToday && !isSelected && styles.dayCellToday,
          isMarkedUnavailable && styles.dayCellUnavailable,
        ]}
        disabled={selectionMode && !hasWorkout}
        onPress={() => (selectionMode ? toggleDaySelection(day) : setSelectedDayKey(day.date))}
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
            isSelected && !big && !selectionMode && styles.dayCellTextSelected,
          ]}
        >
          {dateObj.getDate()}
        </Text>
        {isMarkedUnavailable ? (
          <Icon name="close-circle" size={12} color={C.destructive} />
        ) : (
          (hasWorkout || hasCheckinTasks) && (
            <Box
              style={[
                styles.dayDot,
                hasCompletedWorkout && styles.dayDotCompleted,
                !hasWorkout && hasCheckinTasks && styles.dayDotCheckin,
                isSelected && !big && styles.dayDotSelected,
              ]}
            />
          )
        )}
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <HStack style={styles.headerRow}>
        <Text style={styles.header}>{selectionMode ? 'Marca los días' : 'Mi programa'}</Text>
        {selectionMode ? (
          <Pressable onPress={cancelSelectionMode}>
            <Text style={styles.unavailableCancelText}>Cancelar</Text>
          </Pressable>
        ) : (
          <HStack style={styles.viewToggle}>
            <Pressable
              style={styles.viewToggleBtn}
              onPress={() => setSelectionMode(true)}
            >
              <Icon name="close-circle-outline" size={18} color={C.textSecondary} />
            </Pressable>
            <Pressable
              style={[styles.viewToggleBtn, viewMode === 'calendar' && styles.viewToggleBtnActive]}
              onPress={() => setViewMode('calendar')}
            >
              <Icon name="calendar-outline" size={18} color={viewMode === 'calendar' ? '#FFFFFF' : C.textSecondary} />
            </Pressable>
            <Pressable
              style={[styles.viewToggleBtn, viewMode === 'list' && styles.viewToggleBtnActive]}
              onPress={() => setViewMode('list')}
            >
              <Icon name="list-outline" size={18} color={viewMode === 'list' ? '#FFFFFF' : C.textSecondary} />
            </Pressable>
          </HStack>
        )}
      </HStack>
      {selectionMode && (
        <Text style={styles.unavailableHint}>
          Toca los días con entrenamiento que no vas a poder hacer. Tu entrenador revisará la solicitud antes de aplicarla.
        </Text>
      )}

      <HStack space="sm" style={styles.periodToggleRow}>
        <Pressable
          style={[styles.periodChip, periodMode === 'week' && styles.periodChipActive]}
          onPress={() => {
            setPeriodMode('week');
            setWeekAnchor(startOfWeekMonday(today));
            setSelectedDayKey(todayKey);
          }}
        >
          <Text style={[styles.periodChipText, periodMode === 'week' && styles.periodChipTextActive]}>Semana</Text>
        </Pressable>
        <Pressable
          style={[styles.periodChip, periodMode === 'month' && styles.periodChipActive]}
          onPress={() => {
            setPeriodMode('month');
            setSelectedMonth(startOfMonth(today));
            setSelectedDayKey(todayKey);
          }}
        >
          <Text style={[styles.periodChipText, periodMode === 'month' && styles.periodChipTextActive]}>Mes</Text>
        </Pressable>
      </HStack>

      <HStack style={styles.monthRow}>
        <Pressable style={styles.monthBtn} onPress={goPrev}>
          <Icon name="chevron-back" size={22} color={C.textPrimary} />
        </Pressable>
        <Text style={styles.monthText}>
          {periodMode === 'month' ? formatMonthYear(selectedMonth) : formatWeekRange(weekAnchor)}
        </Text>
        <Pressable style={styles.monthBtn} onPress={goNext}>
          <Icon name="chevron-forward" size={22} color={C.textPrimary} />
        </Pressable>
      </HStack>

      {isLoading ? (
        <Box style={styles.loader}>
          <Spinner size="large" color={C.textPrimary} />
        </Box>
      ) : errorMessage ? (
        <Box style={styles.emptyContainer}>
          <Text style={styles.emptyText}>{errorMessage}</Text>
        </Box>
      ) : viewMode === 'calendar' ? (
        <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
          {periodMode === 'month' && (
            <HStack style={styles.weekdayHeaderRow}>
              {WEEKDAY_LABELS.map((l, i) => (
                <Text key={i} style={styles.weekdayHeaderText}>{l}</Text>
              ))}
            </HStack>
          )}

          {periodMode === 'month' ? (
            monthWeeks.map((week, wi) => (
              <HStack key={wi} style={styles.weekRow}>
                {week.map((day) => renderDayCell(day, `m${wi}`, false))}
              </HStack>
            ))
          ) : (
            <HStack style={styles.weekRow}>
              {weekDays.map((day) => renderDayCell(day, 'w', true))}
            </HStack>
          )}

          <Box style={styles.selectedDaySection}>
            <Text style={styles.selectedDayTitle}>
              {selectedDayKey ? formatDayLabel(selectedDayKey) : 'Selecciona un día'}
            </Text>
            {selectedDayKey && checkinsForDay(selectedDayKey).map(renderCheckinCard)}
            {selectedDay && selectedDay.workouts.length > 0 ? (
              selectedDay.workouts.map((w, wi) => renderWorkoutCard(w, selectedDay.date, wi))
            ) : selectedDayKey && checkinsForDay(selectedDayKey).length === 0 ? (
              <Card variant="ghost" className="flex-row items-center gap-2 p-3.5 rounded-sm" style={{ marginTop: 8 }}>
                <Icon name="moon-outline" size={18} color={C.textSecondary} />
                <Text style={styles.restDayText}>Día de descanso</Text>
              </Card>
            ) : null}
          </Box>
        </ScrollView>
      ) : daysWithWorkouts.length === 0 && periodMode === 'month' ? (
        <Box style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No tienes entrenamientos programados este mes.</Text>
        </Box>
      ) : (
        <ScrollView contentContainerStyle={{ paddingVertical: 16 }}>
          {(periodMode === 'week' ? visibleDays : daysWithWorkouts).map((day, dayIdx) => (
            <Box key={dayIdx} style={styles.daySection}>
              <Text style={styles.dayDate}>{formatDayLabel(day.date)}</Text>
              {checkinsForDay(day.date).map(renderCheckinCard)}
              {day.workouts.length > 0 ? (
                day.workouts.map((w, wIdx) => renderWorkoutCard(w, day.date, wIdx))
              ) : checkinsForDay(day.date).length === 0 ? (
                <Card variant="ghost" className="flex-row items-center gap-2 p-3.5 rounded-sm" style={{ marginTop: 8 }}>
                  <Icon name="moon-outline" size={16} color={C.textSecondary} />
                  <Text style={styles.restDayText}>Día de descanso</Text>
                </Card>
              ) : null}
            </Box>
          ))}
        </ScrollView>
      )}

      {selectionMode && selectedDates.size > 0 && (
        <HStack style={styles.unavailableBar}>
          <Text style={styles.unavailableBarText}>
            {selectedDates.size} día{selectedDates.size !== 1 ? 's' : ''} seleccionado{selectedDates.size !== 1 ? 's' : ''}
          </Text>
          <Button
            style={[styles.unavailableSubmitBtn, submittingSelection && { opacity: 0.6 }] as any}
            onPress={submitUnavailableSelection}
            disabled={submittingSelection}
          >
            {submittingSelection ? (
              <Spinner size="small" color="#FFFFFF" />
            ) : (
              <ButtonText style={styles.unavailableSubmitText}>Enviar solicitud</ButtonText>
            )}
          </Button>
        </HStack>
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
  dayCellUnavailable: {
    backgroundColor: C.destructive5,
    borderWidth: 1.5,
    borderColor: C.destructive,
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
  dayDotCheckin: {
    backgroundColor: C.warning60,
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
  workoutImage: { width: 72, height: 72, borderRadius: 16 },
  checkinIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 16,
    backgroundColor: C.warning10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkinSubtitle: { fontFamily: FONT.regular, fontSize: 12, color: C.textSecondary, marginTop: 2 },
  workoutCardCompleted: {
    marginTop: 8,
    backgroundColor: C.success10,
    borderWidth: 1,
    borderColor: C.success50,
  },
  workoutTitle: { flex: 1, fontSize: 15, fontFamily: FONT.bold, color: C.textPrimary },
  completedBadgeText: { fontFamily: FONT.semiBold, fontSize: 11.5, color: C.success },
  restDayText: { fontFamily: FONT.regular, fontSize: 13, color: C.textSecondary },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 60, paddingHorizontal: 32 },
  emptyText: { fontSize: 16, fontFamily: FONT.medium, color: C.textSecondary, textAlign: 'center' },
  loader: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  unavailableCancelText: { fontFamily: FONT.medium, fontSize: 14, color: C.destructive },
  unavailableHint: {
    fontFamily: FONT.regular,
    fontSize: 12,
    color: C.textSecondary,
    paddingHorizontal: 20,
    marginTop: -8,
    marginBottom: 8,
  },
  unavailableBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: C.gray70,
    backgroundColor: C.bg,
  },
  unavailableBarText: { fontFamily: FONT.medium, fontSize: 14, color: C.textPrimary },
  unavailableSubmitBtn: {
    backgroundColor: C.orange,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
  },
  unavailableSubmitText: { fontFamily: FONT.semiBold, fontSize: 14, color: '#FFFFFF' },
});

import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { C, FONT, SHADOW } from './theme';
import { statisticsApi, PeriodStats, MonthlySessionItem, MonthlyPrEvent } from '../../api/statistics';
import { muscleVolumeApi, MuscleVolumeGroup, MuscleVolumeByDate } from '../../api/muscleVolume';
import { toLocalISODate } from '../../components/DaySelectorStrip';

interface Props {
  navigation?: any;
  route?: any;
}

const MONTHS_ES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];
const RECORD_TYPE_LABEL: Record<string, string> = {
  max_weight: 'Peso máximo',
  max_1rm: '1RM estimado',
  max_volume: 'Volumen en una serie',
};

const ZERO_PERIOD: PeriodStats = { sessionsCount: 0, durationSeconds: 0, volumeKg: 0 };

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
function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
}
function daysInMonth(year: number, month0: number): number {
  return new Date(year, month0 + 1, 0).getDate();
}

function DeltaText({ current, previous, format }: { current: number; previous: number; format: (n: number) => string }) {
  const delta = current - previous;
  if (previous === 0 && current === 0) return <Text style={s.deltaNeutral}>—</Text>;
  const positive = delta >= 0;
  return (
    <Text style={positive ? s.deltaUp : s.deltaDown}>
      {positive ? '↑' : '↓'} {format(Math.abs(delta))} vs mes anterior
    </Text>
  );
}

export default function StatisticsMonthlyReportScreen(props: Props) {
  const { navigation } = props;
  const today = useMemo(() => new Date(), []);
  const [monthAnchor, setMonthAnchor] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [stats, setStats] = useState<PeriodStats>(ZERO_PERIOD);
  const [prevStats, setPrevStats] = useState<PeriodStats>(ZERO_PERIOD);
  const [totalSeries, setTotalSeries] = useState(0);
  const [prevTotalSeries, setPrevTotalSeries] = useState(0);
  const [muscles, setMuscles] = useState<MuscleVolumeGroup[]>([]);
  const [prevMuscles, setPrevMuscles] = useState<MuscleVolumeGroup[]>([]);
  const [volumeByDate, setVolumeByDate] = useState<MuscleVolumeByDate[]>([]);
  const [sessions, setSessions] = useState<MonthlySessionItem[]>([]);
  const [prEvents, setPrEvents] = useState<MonthlyPrEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionsExpanded, setSessionsExpanded] = useState(false);
  const [prsExpanded, setPrsExpanded] = useState(false);

  const isCurrentMonth = monthAnchor.getFullYear() === today.getFullYear() && monthAnchor.getMonth() === today.getMonth();
  const isFutureMonth = monthAnchor > today;

  useEffect(() => {
    if (isFutureMonth) return;
    let active = true;
    setIsLoading(true);

    const year = monthAnchor.getFullYear();
    const month0 = monthAnchor.getMonth();
    const firstDay = new Date(year, month0, 1);
    const lastDay = new Date(year, month0 + 1, 0);
    const end = isCurrentMonth ? today : lastDay;
    const days = Math.round((end.getTime() - firstDay.getTime()) / 86400000) + 1;
    const endISO = toLocalISODate(end);

    const prevMonthDate = new Date(year, month0 - 1, 1);
    const prevYear = prevMonthDate.getFullYear();
    const prevMonth0 = prevMonthDate.getMonth();
    const prevDays = daysInMonth(prevYear, prevMonth0);
    const prevEnd = new Date(prevYear, prevMonth0 + 1, 0);
    const prevEndISO = toLocalISODate(prevEnd);

    Promise.all([
      statisticsApi.getMyPeriodStats(days, endISO),
      statisticsApi.getMyPeriodStats(prevDays, prevEndISO),
      muscleVolumeApi.getMy(days, endISO),
      muscleVolumeApi.getMy(prevDays, prevEndISO),
      statisticsApi.getMyMonthlyExtras(year, month0 + 1),
    ])
      .then(([statsRes, prevStatsRes, volRes, prevVolRes, extrasRes]) => {
        if (!active) return;
        setStats(statsRes.data?.data || ZERO_PERIOD);
        setPrevStats(prevStatsRes.data?.data || ZERO_PERIOD);
        const volData = volRes.data?.data || volRes.data;
        const prevVolData = prevVolRes.data?.data || prevVolRes.data;
        setTotalSeries(volData?.totalSeries || 0);
        setPrevTotalSeries(prevVolData?.totalSeries || 0);
        setMuscles(volData?.volumeByMuscle || []);
        setPrevMuscles(prevVolData?.volumeByMuscle || []);
        setVolumeByDate(volData?.volumeByDate || []);
        const extras = extrasRes.data?.data;
        setSessions(extras?.sessions || []);
        setPrEvents(extras?.prEvents || []);
      })
      .catch(() => {
        if (!active) return;
        setStats(ZERO_PERIOD);
        setPrevStats(ZERO_PERIOD);
        setTotalSeries(0);
        setPrevTotalSeries(0);
        setMuscles([]);
        setPrevMuscles([]);
        setVolumeByDate([]);
        setSessions([]);
        setPrEvents([]);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [monthAnchor]);

  const weeklyBreakdown = useMemo(() => {
    const buckets = [0, 0, 0, 0, 0];
    volumeByDate.forEach((d) => {
      const day = Number(d.date.slice(8, 10));
      const idx = Math.min(4, Math.floor((day - 1) / 7));
      buckets[idx] += d.volume;
    });
    const lastWeek = Math.min(4, Math.floor((daysInMonth(monthAnchor.getFullYear(), monthAnchor.getMonth()) - 1) / 7));
    return buckets.slice(0, lastWeek + 1).map((volume, i) => ({ label: `Sem ${i + 1}`, volume }));
  }, [volumeByDate, monthAnchor]);
  const maxWeekVolume = Math.max(1, ...weeklyBreakdown.map((w) => w.volume));

  const { musclesUp, musclesDown } = useMemo(() => {
    const prevByGroup = new Map(prevMuscles.map((m) => [m.group, m.volume]));
    const allGroups = new Set([...muscles.map((m) => m.group), ...prevMuscles.map((m) => m.group)]);
    const deltas = Array.from(allGroups).map((group) => {
      const current = muscles.find((m) => m.group === group)?.volume ?? 0;
      const previous = prevByGroup.get(group) ?? 0;
      return { group, current, previous, delta: current - previous };
    });
    const up = deltas.filter((d) => d.delta > 0).sort((a, b) => b.delta - a.delta).slice(0, 3);
    const down = deltas.filter((d) => d.delta < 0).sort((a, b) => a.delta - b.delta).slice(0, 3);
    return { musclesUp: up, musclesDown: down };
  }, [muscles, prevMuscles]);

  const exercisesWithProgress = useMemo(() => new Set(prEvents.map((e) => e.exercise_id)).size, [prEvents]);
  const sortedSessions = useMemo(() => [...sessions].sort((a, b) => (a.date < b.date ? 1 : -1)), [sessions]);
  const visibleSessions = sessionsExpanded ? sortedSessions : sortedSessions.slice(0, 4);
  const visiblePrs = prsExpanded ? prEvents : prEvents.slice(0, 4);

  const goPrevMonth = () => setMonthAnchor((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  const goNextMonth = () => setMonthAnchor((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <View style={s.appBar}>
        <TouchableOpacity onPress={() => navigation?.goBack()} style={s.iconBtn}>
          <Ionicons name="chevron-back" size={22} color={C.textPrimary} />
        </TouchableOpacity>
        <Text style={s.appBarTitle} numberOfLines={1}>
          Informe mensual
        </Text>
        <View style={s.iconBtn} />
      </View>

      <ScrollView contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={s.monthNav}>
          <TouchableOpacity onPress={goPrevMonth} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="chevron-back" size={18} color={C.textSecondary} />
          </TouchableOpacity>
          <Text style={s.monthNavLabel}>
            {MONTHS_ES[monthAnchor.getMonth()]} {monthAnchor.getFullYear()}
          </Text>
          <TouchableOpacity onPress={goNextMonth} disabled={isCurrentMonth} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="chevron-forward" size={18} color={isCurrentMonth ? C.border : C.textSecondary} />
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <ActivityIndicator size="large" color={C.textSecondary} style={{ paddingVertical: 60 }} />
        ) : (
          <>
            {/* KPIs con comparativa vs mes anterior */}
            <View style={s.grid2x2}>
              <View style={s.kpiCard}>
                <Text style={s.kpiLabel}>Entrenamientos</Text>
                <Text style={s.kpiValue}>{stats.sessionsCount}</Text>
                <DeltaText current={stats.sessionsCount} previous={prevStats.sessionsCount} format={(n) => String(Math.round(n))} />
              </View>
              <View style={s.kpiCard}>
                <Text style={s.kpiLabel}>Duración</Text>
                <Text style={s.kpiValue}>{formatDuration(stats.durationSeconds)}</Text>
                <DeltaText current={stats.durationSeconds} previous={prevStats.durationSeconds} format={formatDuration} />
              </View>
              <View style={s.kpiCard}>
                <Text style={s.kpiLabel}>Volumen</Text>
                <Text style={s.kpiValue}>{formatVolume(stats.volumeKg)}</Text>
                <DeltaText current={stats.volumeKg} previous={prevStats.volumeKg} format={formatVolume} />
              </View>
              <View style={s.kpiCard}>
                <Text style={s.kpiLabel}>Series</Text>
                <Text style={s.kpiValue}>{totalSeries}</Text>
                <DeltaText current={totalSeries} previous={prevTotalSeries} format={(n) => String(Math.round(n))} />
              </View>
            </View>

            {/* Desglose semanal */}
            {weeklyBreakdown.length > 0 && (
              <View style={s.card}>
                <Text style={s.cardTitle}>Desglose semanal</Text>
                <View style={s.weekRow}>
                  {weeklyBreakdown.map((w) => {
                    const heightPct = maxWeekVolume > 0 ? Math.max(w.volume > 0 ? 6 : 2, (w.volume / maxWeekVolume) * 100) : 2;
                    return (
                      <View key={w.label} style={s.weekCol}>
                        <View style={s.weekBarTrack}>
                          <View style={[s.weekBarFill, { height: `${heightPct}%` }]} />
                        </View>
                        <Text style={s.weekLabel}>{w.label}</Text>
                      </View>
                    );
                  })}
                </View>
              </View>
            )}

            {/* PRs y progreso */}
            <View style={s.card}>
              <Text style={s.cardTitle}>Progreso y marcas</Text>
              <View style={s.progressStatsRow}>
                <View style={s.progressStat}>
                  <Text style={s.progressStatValue}>{exercisesWithProgress}</Text>
                  <Text style={s.progressStatLabel}>ejercicios con progreso</Text>
                </View>
                <View style={s.progressStat}>
                  <Text style={s.progressStatValue}>{prEvents.length}</Text>
                  <Text style={s.progressStatLabel}>marcas personales batidas</Text>
                </View>
              </View>
              {prEvents.length > 0 && (
                <>
                  {visiblePrs.map((p, idx) => (
                    <View key={idx} style={s.prRow}>
                      <Ionicons name="trophy" size={14} color={C.orange} style={{ marginRight: 8 }} />
                      <View style={{ flex: 1 }}>
                        <Text style={s.prTitle} numberOfLines={1}>
                          {p.title}
                        </Text>
                        <Text style={s.prSubtitle}>
                          {RECORD_TYPE_LABEL[p.record_type] || p.record_type}: {p.value} kg
                          {p.achieved_at ? ` · ${formatDate(p.achieved_at)}` : ''}
                        </Text>
                      </View>
                    </View>
                  ))}
                  {prEvents.length > 4 && (
                    <TouchableOpacity onPress={() => setPrsExpanded((v) => !v)} style={s.expandBtn}>
                      <Text style={s.expandBtnText}>{prsExpanded ? 'Ver menos' : `Ver las ${prEvents.length}`}</Text>
                    </TouchableOpacity>
                  )}
                </>
              )}
            </View>

            {/* Músculos que suben / bajan */}
            {(musclesUp.length > 0 || musclesDown.length > 0) && (
              <View style={s.card}>
                <Text style={s.cardTitle}>Cambios de volumen por músculo</Text>
                {musclesUp.length > 0 && (
                  <View style={s.muscleDeltaGroup}>
                    <Text style={s.muscleDeltaGroupLabel}>Suben</Text>
                    {musclesUp.map((m) => (
                      <View key={m.group} style={s.muscleDeltaRow}>
                        <Text style={s.muscleDeltaName} numberOfLines={1}>
                          {m.group}
                        </Text>
                        <Text style={s.deltaUp}>↑ {formatVolume(m.delta)}</Text>
                      </View>
                    ))}
                  </View>
                )}
                {musclesDown.length > 0 && (
                  <View style={s.muscleDeltaGroup}>
                    <Text style={s.muscleDeltaGroupLabel}>Bajan</Text>
                    {musclesDown.map((m) => (
                      <View key={m.group} style={s.muscleDeltaRow}>
                        <Text style={s.muscleDeltaName} numberOfLines={1}>
                          {m.group}
                        </Text>
                        <Text style={s.deltaDown}>↓ {formatVolume(Math.abs(m.delta))}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            )}

            {/* Lista de entrenamientos */}
            <View style={s.card}>
              <Text style={s.cardTitle}>Entrenamientos del mes</Text>
              {sortedSessions.length === 0 ? (
                <Text style={s.emptyText}>Sin entrenamientos registrados este mes.</Text>
              ) : (
                <>
                  {visibleSessions.map((sess, idx) => (
                    <View key={idx} style={s.sessionRow}>
                      <View style={s.sessionDateWrap}>
                        <Text style={s.sessionDate}>{formatDate(sess.date)}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={s.sessionTitle} numberOfLines={1}>
                          {sess.title}
                        </Text>
                        <Text style={s.sessionSubtitle}>
                          {formatDuration(sess.duration_seconds)} · {formatVolume(sess.volume_kg)}
                        </Text>
                      </View>
                    </View>
                  ))}
                  {sortedSessions.length > 4 && (
                    <TouchableOpacity onPress={() => setSessionsExpanded((v) => !v)} style={s.expandBtn}>
                      <Text style={s.expandBtnText}>
                        {sessionsExpanded ? 'Ver menos' : `Ver los ${sortedSessions.length}`}
                      </Text>
                    </TouchableOpacity>
                  )}
                </>
              )}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  appBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingVertical: 12 },
  iconBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  appBarTitle: { flex: 1, textAlign: 'center', fontSize: 16, fontFamily: FONT.bold, color: C.textPrimary, marginHorizontal: 4 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 32 },
  monthNav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 16, marginTop: 8, marginBottom: 8 },
  monthNavLabel: { fontFamily: FONT.semiBold, fontSize: 16, color: C.textPrimary, minWidth: 150, textAlign: 'center' },
  grid2x2: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 12 },
  kpiCard: { width: '47%', borderWidth: 1, borderColor: C.border, backgroundColor: C.gray5, borderRadius: 20, padding: 16 },
  kpiLabel: { fontFamily: FONT.medium, fontSize: 13, color: C.textSecondary },
  kpiValue: { fontFamily: FONT.extraBold, fontSize: 20, color: C.textPrimary, marginTop: 5 },
  deltaUp: { fontFamily: FONT.semiBold, fontSize: 11, color: C.success60, marginTop: 4 },
  deltaDown: { fontFamily: FONT.semiBold, fontSize: 11, color: C.destructive60, marginTop: 4 },
  deltaNeutral: { fontFamily: FONT.semiBold, fontSize: 11, color: C.textSecondary, marginTop: 4 },
  card: { backgroundColor: C.surface, borderRadius: 20, marginTop: 16, padding: 20, ...SHADOW.card },
  cardTitle: { fontFamily: FONT.bold, fontSize: 14, color: C.textPrimary, marginBottom: 16 },
  emptyText: { fontFamily: FONT.regular, fontSize: 13, color: C.textSecondary, textAlign: 'center', paddingVertical: 12 },

  weekRow: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-end', height: 120 },
  weekCol: { alignItems: 'center', flex: 1, height: '100%', justifyContent: 'flex-end' },
  weekBarTrack: { width: 22, flex: 1, justifyContent: 'flex-end' },
  weekBarFill: { width: 22, backgroundColor: C.orange, borderRadius: 6 },
  weekLabel: { fontFamily: FONT.medium, fontSize: 11, color: C.textSecondary, marginTop: 8 },

  progressStatsRow: { flexDirection: 'row', gap: 12, marginBottom: 8 },
  progressStat: { flex: 1, backgroundColor: C.gray5, borderRadius: 16, padding: 14, alignItems: 'center' },
  progressStatValue: { fontFamily: FONT.extraBold, fontSize: 22, color: C.textPrimary },
  progressStatLabel: { fontFamily: FONT.regular, fontSize: 11, color: C.textSecondary, marginTop: 3, textAlign: 'center' },
  prRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderTopWidth: 1, borderTopColor: C.border, marginTop: 8 },
  prTitle: { fontFamily: FONT.semiBold, fontSize: 13.5, color: C.textPrimary },
  prSubtitle: { fontFamily: FONT.regular, fontSize: 11.5, color: C.textSecondary, marginTop: 2 },

  muscleDeltaGroup: { marginTop: 8 },
  muscleDeltaGroupLabel: { fontFamily: FONT.semiBold, fontSize: 11, color: C.textSecondary, letterSpacing: 0.4, marginBottom: 8 },
  muscleDeltaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6 },
  muscleDeltaName: { flex: 1, fontFamily: FONT.medium, fontSize: 13, color: C.textPrimary, marginRight: 8 },

  sessionRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderTopWidth: 1, borderTopColor: C.border, marginTop: 8 },
  sessionDateWrap: { width: 56 },
  sessionDate: { fontFamily: FONT.semiBold, fontSize: 12.5, color: C.textSecondary, textTransform: 'capitalize' },
  sessionTitle: { fontFamily: FONT.semiBold, fontSize: 14, color: C.textPrimary },
  sessionSubtitle: { fontFamily: FONT.regular, fontSize: 12, color: C.textSecondary, marginTop: 2 },

  expandBtn: { alignItems: 'center', paddingTop: 12 },
  expandBtnText: { fontFamily: FONT.semiBold, fontSize: 12.5, color: C.accentBlack },
});

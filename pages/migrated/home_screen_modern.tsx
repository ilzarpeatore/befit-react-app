import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Dimensions,
  ActivityIndicator,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { C, FONT } from './theme';
import { dashboardApi } from '../../api/dashboard';
import { workoutsApi } from '../../api/workouts';
import { workoutHistoryApi } from '../../api/workoutHistory';
import { dietApi } from '../../api/diet';
import { blogApi } from '../../api/blog';
import { useAuth } from '../../store/AuthContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const FIGMA_W = 375;
const FIGMA_H = 812;

interface HomeScreenModernProps {
  navigation?: any;
  route?: any;
}

export default function HomeScreenModern(props: HomeScreenModernProps) {
  const { navigation } = props;
  const { state } = useAuth();
  const user = state.user;

  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const scrollRef = useRef<ScrollView>(null);
  const { width: winW, height: winH } = useWindowDimensions();
  const sc = useMemo(() => Math.min(winW / FIGMA_W, winH / FIGMA_H), [winW, winH]);
  const r = (n: number) => Math.round(n * sc);

  const [todayWorkouts, setTodayWorkouts] = useState<any[]>([]);
  const [weeklyWorkouts, setWeeklyWorkouts] = useState<boolean[]>([]);
  const [workoutList, setWorkoutList] = useState<any[]>([]);
  const [dailyPlan, setDailyPlan] = useState<any>(null);
  const [blogPosts, setBlogPosts] = useState<any[]>([]);
  const [notificationCount, setNotificationCount] = useState(0);

  const styles = useMemo(() => StyleSheet.create({
    container: { flex: 1, backgroundColor: C.bg },
    darkHeader: { backgroundColor: C.gray80, borderBottomLeftRadius: r(32), borderBottomRightRadius: r(32), paddingBottom: r(20) },
    headerTop: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: r(20), paddingTop: r(16) },
    avatar: { width: r(40), height: r(40), borderRadius: r(20), backgroundColor: C.gray70 },
    headerTitle: { flex: 1, fontSize: r(16), fontFamily: FONT.bold, color: C.white, textAlign: 'center' as const },
    notifBtn: { width: r(40), height: r(40), borderRadius: r(20), backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center' as const, justifyContent: 'center' as const },
    notifBadge: { position: 'absolute', top: r(6), right: r(6), width: r(16), height: r(16), borderRadius: r(8), backgroundColor: C.destructive, alignItems: 'center' as const, justifyContent: 'center' as const },
    notifBadgeText: { fontSize: r(8), fontFamily: FONT.bold, color: C.white },
    scoreRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: r(20), marginTop: 16 },
    scoreBox: { width: r(64), height: r(64), borderRadius: r(20), backgroundColor: C.orange, alignItems: 'center' as const, justifyContent: 'center' as const, marginRight: r(14) },
    scoreText: { fontSize: r(28), fontFamily: FONT.extraBold, color: C.white },
    scoreTitle: { fontSize: r(16), fontFamily: FONT.bold, color: C.white },
    scoreSub: { fontSize: r(13), color: C.white, marginTop: r(4) },
    sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: r(20), marginTop: r(24), marginBottom: r(12) },
    sectionTitle: { fontSize: r(17), fontFamily: FONT.bold, color: C.white },
    seeAll: { fontSize: r(13), fontFamily: FONT.semiBold, color: C.orange },
    todayWorkoutCard: { backgroundColor: C.surfaceLight, borderRadius: r(20), borderWidth: 1, borderColor: C.border, padding: r(16), marginHorizontal: r(20), marginBottom: r(12) },
    todayWorkoutTopRow: { flexDirection: 'row', alignItems: 'center', marginBottom: r(12) },
    todayWorkoutIcon: { width: r(44), height: r(44), borderRadius: r(12), backgroundColor: 'rgba(255,107,53,0.15)', alignItems: 'center' as const, justifyContent: 'center' as const, marginRight: r(12) },
    todayWorkoutTitle: { fontSize: r(15), fontFamily: FONT.bold, color: C.white },
    todayWorkoutSub: { fontSize: r(12), color: C.textSecondary, marginTop: r(2) },
    noWorkoutText: { fontSize: r(13), color: C.textSecondary },
    activityCard: { backgroundColor: C.surfaceLight, borderRadius: r(20), borderWidth: 1, borderColor: C.border, padding: r(16), marginHorizontal: r(20), marginBottom: r(12) },
    activityWeekRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: r(12) },
    activityWeekTitle: { fontSize: r(14), fontFamily: FONT.semiBold, color: C.white },
    activityWeekCount: { fontSize: r(12), color: C.textSecondary },
    activityDaysRow: { flexDirection: 'row', justifyContent: 'space-between' },
    activityDay: { alignItems: 'center' as const },
    activityDayLabel: { fontSize: r(10), color: C.textSecondary, marginBottom: r(4) },
    activityDayDot: { width: r(28), height: r(28), borderRadius: r(14), borderWidth: r(2), borderColor: C.border, alignItems: 'center' as const, justifyContent: 'center' as const },
    activityDayDotFilled: { backgroundColor: C.orange, borderColor: C.orange },
    activityDayCheck: { fontSize: r(12), color: C.white },
    workoutCard: { width: SCREEN_WIDTH * 0.75, height: r(180), borderRadius: r(20), marginHorizontal: r(6), overflow: 'hidden' },
    workoutImage: { ...StyleSheet.absoluteFill, backgroundColor: C.gray70 },
    workoutGradient: { ...StyleSheet.absoluteFill },
    workoutLevelBadge: { position: 'absolute', top: r(12), left: r(12), backgroundColor: C.white, borderRadius: r(12), paddingHorizontal: r(8), paddingVertical: r(3) },
    workoutLevelText: { fontSize: r(10), fontFamily: FONT.bold, color: C.gray80 },
    workoutBottomInfo: { position: 'absolute', bottom: r(12), left: r(12), right: r(12) },
    workoutCardTitle: { fontSize: r(16), fontFamily: FONT.bold, color: C.white },
    workoutCardMeta: { fontSize: r(11), color: C.gray10, marginTop: r(4) },
    nutritionCard: { backgroundColor: C.surfaceLight, borderRadius: r(20), borderWidth: 1, borderColor: C.border, padding: r(16), marginHorizontal: r(20), marginBottom: r(12) },
    nutritionTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: r(12) },
    nutritionCalCenter: { alignItems: 'center' as const },
    nutritionCalValue: { fontSize: r(28), fontFamily: FONT.extraBold, color: C.white },
    nutritionCalLabel: { fontSize: r(11), color: C.textSecondary },
    nutritionSide: { alignItems: 'center' as const },
    nutritionSideLabel: { fontSize: r(10), color: C.textSecondary },
    nutritionSideValue: { fontSize: r(14), fontFamily: FONT.bold, color: C.white, marginTop: r(2) },
    nutritionMsg: { fontSize: r(12), color: C.textSecondary, textAlign: 'center' as const, marginTop: r(8), marginBottom: r(8) },
    nutritionLink: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: r(8) },
    nutritionLinkText: { fontSize: r(13), fontFamily: FONT.semiBold, color: C.orange },
    macroBar: { flex: 1, alignItems: 'center' as const },
    macroTrack: { height: r(6), borderRadius: r(4), backgroundColor: C.gray70, width: '100%', overflow: 'hidden' },
    macroFill: { height: r(6), borderRadius: r(4) },
    macroLabel: { fontSize: r(10), color: C.textSecondary, marginTop: r(6) },
    macroValue: { fontSize: r(11), fontFamily: FONT.semiBold, color: C.white, marginTop: r(2) },
    sleepCard: { backgroundColor: C.surfaceLight, borderRadius: r(20), borderWidth: 1, borderColor: C.border, padding: r(16), marginHorizontal: r(20), marginBottom: r(12) },
    sleepTopRow: { flexDirection: 'row', alignItems: 'baseline' },
    sleepHours: { fontSize: r(28), fontFamily: FONT.extraBold, color: C.white },
    sleepUnit: { fontSize: r(14), color: C.textSecondary },
    sleepBadge: { backgroundColor: 'rgba(76,175,80,0.15)', borderRadius: r(12), paddingHorizontal: r(8), paddingVertical: r(3), flexDirection: 'row', alignItems: 'center' },
    sleepBadgeText: { fontSize: r(11), fontFamily: FONT.semiBold, color: C.success, marginLeft: r(4) },
    sleepSubtext: { fontSize: r(12), color: C.textSecondary, marginTop: r(6) },
    sleepMetaRow: { flexDirection: 'row', alignItems: 'center', marginTop: r(12) },
    sleepMetaText: { fontSize: r(13), fontFamily: FONT.semiBold, color: C.white, marginLeft: r(6), marginRight: r(4) },
    sleepMetaLabel: { fontSize: r(11), color: C.textSecondary },
    blogCard: { width: r(220), marginRight: r(14), backgroundColor: C.surfaceLight, borderRadius: r(16), borderWidth: 1, borderColor: C.border, overflow: 'hidden' },
    blogImage: { height: r(100), backgroundColor: C.gray70, width: '100%' },
    blogContent: { padding: r(12) },
    blogTag: { backgroundColor: 'rgba(255,107,53,0.15)', borderRadius: r(8), paddingHorizontal: r(8), paddingVertical: r(2), alignSelf: 'flex-start' as const },
    blogTagText: { fontSize: r(9), fontFamily: FONT.semiBold, color: C.orange },
    blogTitle: { fontSize: r(13), fontFamily: FONT.semiBold, color: C.white, marginTop: r(6) },
    blogDate: { fontSize: r(10), color: C.textSecondary, marginTop: r(4) },
    supportCard: { backgroundColor: C.surfaceLight, borderRadius: r(20), borderWidth: 1, borderColor: C.border, padding: r(16), marginHorizontal: r(20), marginBottom: r(12), flexDirection: 'row', alignItems: 'center' },
    supportTitle: { flex: 1, fontSize: r(14), fontFamily: FONT.bold, color: C.white },
    supportLink: { fontSize: r(12), fontFamily: FONT.semiBold, color: C.orange, marginTop: r(6) },
    emptySection: { paddingHorizontal: r(20), paddingVertical: r(12), marginBottom: r(8) },
    emptyText: { fontSize: r(13), color: C.textSecondary, textAlign: 'center' as const },
    errorBanner: { backgroundColor: C.destructive10, borderRadius: r(12), padding: r(12), marginHorizontal: r(20), marginBottom: r(12), flexDirection: 'row', alignItems: 'center' },
    errorText: { flex: 1, fontSize: r(12), color: C.destructive, marginLeft: r(8) },
    loader: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center' as const, justifyContent: 'center' as const },
  }), [sc]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const now = new Date();
      const todayStr = now.toISOString().split('T')[0];
      const currentMonth = now.getMonth() + 1;
      const currentYear = now.getFullYear();

      const [dashRes, calendarRes, workoutsRes, dietRes, blogRes] = await Promise.allSettled([
        dashboardApi.getDashboard(),
        workoutHistoryApi.getMyCalendar(currentMonth, currentYear),
        workoutsApi.getList(1),
        dietApi.getDailyPlan(todayStr),
        blogApi.getList(1, { per_page: 3, order_by: 'created_at', order_dir: 'desc' }),
      ]);

      const errors: string[] = [];

      if (dashRes.status === 'fulfilled') {
        const d: any = dashRes.value.data.data;
        setNotificationCount(d?.notification_data?.unread_total_count ?? 0);
      } else {
        errors.push('dashboard');
      }

      if (calendarRes.status === 'fulfilled') {
        const calData: any = calendarRes.value.data.data;
        const days = calData?.days ?? [];
        const today = days.find((day: any) => day.date === todayStr);
        setTodayWorkouts(today?.workouts ?? []);

        const dayOfWeek = now.getDay();
        const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        const monday = new Date(now);
        monday.setDate(now.getDate() - mondayOffset);
        const weekBools: boolean[] = [];
        for (let i = 0; i < 7; i++) {
          const d = new Date(monday);
          d.setDate(monday.getDate() + i);
          const dateStr = d.toISOString().split('T')[0];
          const dayData = days.find((day: any) => day.date === dateStr);
          weekBools.push(!!(dayData?.workouts && dayData.workouts.length > 0));
        }
        setWeeklyWorkouts(weekBools);
      } else {
        errors.push('calendario');
      }

      if (workoutsRes.status === 'fulfilled') {
        setWorkoutList((workoutsRes.value.data.data ?? []).slice(0, 3));
      } else {
        errors.push('rutinas');
      }

      if (dietRes.status === 'fulfilled') {
        setDailyPlan(dietRes.value.data.data ?? null);
      }

      if (blogRes.status === 'fulfilled') {
        setBlogPosts((blogRes.value.data.data ?? []).slice(0, 3));
      }

      if (errors.length > 0) {
        setErrorMessage(`No se pudo cargar: ${errors.join(', ')}. Desliza para reintentar.`);
      }
    } catch (e: any) {
      setErrorMessage('Error al cargar los datos. Desliza para reintentar.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={C.orange} />
        </View>
      </SafeAreaView>
    );
  }

  const dayLabels = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
  const displayName = user?.first_name || user?.display_name || 'Usuario';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.darkHeader}>
          <View style={styles.headerTop}>
            {user?.profile_image ? (
              <Image source={{ uri: user.profile_image }} style={styles.avatar} />
            ) : (
              <View style={styles.avatar} />
            )}
            <Text style={styles.headerTitle}>Hola, {displayName}!</Text>
            <TouchableOpacity style={styles.notifBtn} onPress={() => navigation?.navigate('MigratedNotification')}>
              <Ionicons name="notifications-outline" size={22} color={C.white} />
              {notificationCount > 0 && (
                <View style={styles.notifBadge}>
                  <Text style={styles.notifBadgeText}>{notificationCount > 9 ? '9+' : notificationCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Sandow Score → Solo acceso rápido a Progreso (sin número hardcodeado) */}
          <TouchableOpacity style={styles.scoreRow} onPress={() => navigation?.navigate('MigratedProgress')}>
            <View style={styles.scoreBox}>
              <Ionicons name="trending-up" size={28} color={C.white} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.scoreTitle}>Mi Progreso</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                <Ionicons name="heart" size={14} color={C.white} />
                <Text style={styles.scoreSub}>Ver reporte completo</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={24} color={C.white} />
          </TouchableOpacity>
        </View>

        {errorMessage && (
          <View style={styles.errorBanner}>
            <Ionicons name="warning" size={16} color={C.destructive} />
            <Text style={styles.errorText}>{errorMessage}</Text>
            <TouchableOpacity onPress={() => fetchData()}>
              <Ionicons name="refresh" size={16} color={C.destructive} />
            </TouchableOpacity>
          </View>
        )}

        {/* Actividad de hoy */}
        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Actividad de Hoy</Text>
          <TouchableOpacity onPress={() => navigation?.navigate('MigratedMyProgramCalendar')}>
            <Text style={styles.seeAll}>Ver Calendario</Text>
          </TouchableOpacity>
        </View>
        {todayWorkouts.length > 0 ? (
          <View style={styles.todayWorkoutCard}>
            {todayWorkouts.map((w: any, i: number) => (
              <TouchableOpacity
                key={`${w.assignment_id}-${i}`}
                style={i > 0 ? { marginTop: r(12), paddingTop: r(12), borderTopWidth: 1, borderTopColor: C.border } : {}}
                onPress={() => navigation?.navigate('MigratedFullWorkout', { programDayAssignmentId: w.assignment_id, mTitle: w.title || 'Entrenamiento' })}
              >
                <View style={styles.todayWorkoutTopRow}>
                  <View style={styles.todayWorkoutIcon}>
                    <Ionicons name="barbell" size={22} color={C.orange} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.todayWorkoutTitle}>{w.title || 'Entrenamiento'}</Text>
                    <Text style={styles.todayWorkoutSub}>Toca para ver detalles</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={C.textSecondary} />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={[styles.todayWorkoutCard, { alignItems: 'center' }]}>
            <Ionicons name="bed-outline" size={32} color={C.textSecondary} />
            <Text style={[styles.noWorkoutText, { marginTop: r(8) }]}>Día de descanso</Text>
            <Text style={[styles.noWorkoutText, { fontSize: r(11) }]}>No hay entrenamientos programados para hoy</Text>
          </View>
        )}

        {/* Actividad semanal */}
        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Actividad Semanal</Text>
        </View>
        <View style={styles.activityCard}>
          <View style={styles.activityWeekRow}>
            <Text style={styles.activityWeekTitle}>Esta semana</Text>
            <Text style={styles.activityWeekCount}>
              {weeklyWorkouts.filter(Boolean).length} de {Math.max(weeklyWorkouts.length, 7)} días
            </Text>
          </View>
          <View style={styles.activityDaysRow}>
            {dayLabels.map((label, i) => (
              <View key={label} style={styles.activityDay}>
                <Text style={styles.activityDayLabel}>{label}</Text>
                <View style={[styles.activityDayDot, weeklyWorkouts[i] && styles.activityDayDotFilled]}>
                  {weeklyWorkouts[i] && <Text style={styles.activityDayCheck}>✓</Text>}
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Rutinas */}
        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Rutinas</Text>
          <TouchableOpacity onPress={() => navigation?.navigate('MigratedViewWorkouts')}>
            <Text style={styles.seeAll}>Ver todas</Text>
          </TouchableOpacity>
        </View>
        {workoutList.length > 0 ? (
          <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} style={{ paddingLeft: 16 }}>
            {workoutList.map((w: any) => (
              <TouchableOpacity key={w.id} style={styles.workoutCard} onPress={() => navigation?.navigate('MigratedWorkoutDetail', { id: w.id })}>
                {w.workout_image ? <Image source={{ uri: w.workout_image }} style={styles.workoutImage} resizeMode="cover" /> : <View style={styles.workoutImage} />}
                <LinearGradient colors={['transparent', 'rgba(0,0,0,0.8)']} style={styles.workoutGradient} />
                <View style={styles.workoutLevelBadge}>
                  <Text style={styles.workoutLevelText}>{w.level_title || 'General'}</Text>
                </View>
                <View style={styles.workoutBottomInfo}>
                  <Text style={styles.workoutCardTitle}>{w.title}</Text>
                  <Text style={styles.workoutCardMeta}>{w.workout_type_title || 'Rutina'}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        ) : (
          <View style={styles.emptySection}>
            <Text style={styles.emptyText}>No hay rutinas disponibles</Text>
          </View>
        )}

        {/* Nutrición */}
        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Nutrición</Text>
          <TouchableOpacity onPress={() => navigation?.navigate('MigratedDiet')}>
            <Text style={styles.seeAll}>Ver dieta</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.nutritionCard}>
          {dailyPlan ? (
            <>
              <View style={styles.nutritionTopRow}>
                <View style={styles.nutritionSide}>
                  <Text style={styles.nutritionSideLabel}>Consumido</Text>
                  <Text style={styles.nutritionSideValue}>{dailyPlan.eaten ?? 0}</Text>
                </View>
                <View style={styles.nutritionCalCenter}>
                  <Text style={styles.nutritionCalValue}>{dailyPlan.daily_kcal ?? 0}</Text>
                  <Text style={styles.nutritionCalLabel}>kcal objetivo</Text>
                </View>
                <View style={styles.nutritionSide}>
                  <Text style={styles.nutritionSideLabel}>Restante</Text>
                  <Text style={styles.nutritionSideValue}>{dailyPlan.left_eat ?? 0}</Text>
                </View>
              </View>
              <View style={{ flexDirection: 'row', marginTop: r(12) }}>
                <View style={styles.macroBar}>
                  <View style={styles.macroTrack}>
                    <View style={[styles.macroFill, { width: `${Math.min(((dailyPlan.protein ?? 0) / Math.max((dailyPlan.daily_kcal ?? 1) / 4, 1)) * 100, 100)}%`, backgroundColor: C.orange }]} />
                  </View>
                  <Text style={styles.macroLabel}>Proteína</Text>
                  <Text style={styles.macroValue}>{dailyPlan.protein ?? 0}g</Text>
                </View>
                <View style={[styles.macroBar, { marginHorizontal: r(12) }]}>
                  <View style={styles.macroTrack}>
                    <View style={[styles.macroFill, { width: `${Math.min(((dailyPlan.fats ?? 0) / Math.max((dailyPlan.daily_kcal ?? 1) / 9, 1)) * 100, 100)}%`, backgroundColor: C.purple }]} />
                  </View>
                  <Text style={styles.macroLabel}>Grasas</Text>
                  <Text style={styles.macroValue}>{dailyPlan.fats ?? 0}g</Text>
                </View>
                <View style={styles.macroBar}>
                  <View style={styles.macroTrack}>
                    <View style={[styles.macroFill, { width: `${Math.min(((dailyPlan.carbs ?? 0) / Math.max((dailyPlan.daily_kcal ?? 1) / 4, 1)) * 100, 100)}%`, backgroundColor: C.blue }]} />
                  </View>
                  <Text style={styles.macroLabel}>Carbos</Text>
                  <Text style={styles.macroValue}>{dailyPlan.carbs ?? 0}g</Text>
                </View>
              </View>
              <Text style={styles.nutritionMsg}>
                {(dailyPlan.left_eat ?? 0) > 0
                  ? `Te quedan ${dailyPlan.left_eat} kcal por consumir. ¡Sigue así!`
                  : '¡Meta de calorías alcanzada hoy!'}
              </Text>
            </>
          ) : (
            <View style={{ alignItems: 'center', paddingVertical: r(12) }}>
              <Ionicons name="nutrition-outline" size={32} color={C.textSecondary} />
              <Text style={[styles.nutritionMsg, { marginTop: r(8) }]}>Sin plan de alimentación hoy</Text>
            </View>
          )}
          <TouchableOpacity style={styles.nutritionLink} onPress={() => navigation?.navigate('MigratedDiet')}>
            <Text style={styles.nutritionLinkText}>Ver dieta</Text>
            <Ionicons name="arrow-forward" size={14} color={C.orange} style={{ marginLeft: r(8) }} />
          </TouchableOpacity>
        </View>

        {/* Sueño */}
        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Sueño</Text>
        </View>
        <View style={styles.sleepCard}>
          <View style={[styles.sleepTopRow, { justifyContent: 'space-between' }]}>
            <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
              <Text style={styles.sleepHours}>7</Text>
              <Text style={styles.sleepUnit}> h </Text>
              <Text style={styles.sleepHours}>30</Text>
              <Text style={styles.sleepUnit}> m</Text>
            </View>
            <View style={styles.sleepBadge}>
              <Ionicons name="checkmark-circle" size={12} color={C.success} />
              <Text style={styles.sleepBadgeText}>Buen descanso</Text>
            </View>
          </View>
          <Text style={styles.sleepSubtext}>Conecta tu dispositivo de salud para datos reales</Text>
          <View style={[styles.sleepMetaRow, { justifyContent: 'space-between' }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="bed-outline" size={16} color={C.textSecondary} />
              <Text style={styles.sleepMetaText}>23:30</Text>
              <Text style={styles.sleepMetaLabel}>Acostarse</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="sunny-outline" size={16} color={C.textSecondary} />
              <Text style={styles.sleepMetaText}>07:00</Text>
              <Text style={styles.sleepMetaLabel}>Levantarse</Text>
            </View>
          </View>
        </View>

        {/* Blog */}
        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Blog</Text>
          <TouchableOpacity onPress={() => navigation?.navigate('MigratedViewAllBlog')}>
            <Text style={styles.seeAll}>Ver todos</Text>
          </TouchableOpacity>
        </View>
        {blogPosts.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ paddingLeft: 16 }}>
            {blogPosts.map((post: any) => (
              <TouchableOpacity key={post.id} style={styles.blogCard} onPress={() => navigation?.navigate('MigratedBlogDetail', { id: post.id })}>
                {post.post_image ? (
                  <Image source={{ uri: post.post_image }} style={styles.blogImage} resizeMode="cover" />
                ) : (
                  <View style={styles.blogImage} />
                )}
                <View style={styles.blogContent}>
                  {post.blog_category && (
                    <View style={styles.blogTag}>
                      <Text style={styles.blogTagText}>{post.blog_category.title}</Text>
                    </View>
                  )}
                  <Text style={styles.blogTitle} numberOfLines={2}>{post.title}</Text>
                  {post.datetime && <Text style={styles.blogDate}>{post.datetime}</Text>}
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        ) : (
          <View style={styles.emptySection}>
            <Text style={styles.emptyText}>No hay artículos disponibles</Text>
          </View>
        )}

        {/* Need Help → FitBot */}
        <View style={{ height: r(16) }} />
        <TouchableOpacity style={styles.supportCard} onPress={() => navigation?.navigate('MigratedChatting', { isDirect: true })}>
          <View style={{ flex: 1 }}>
            <Text style={styles.supportTitle}>¿Necesitas ayuda? Soluciona tus dudas con el bot</Text>
            <Text style={styles.supportLink}>Be Stronger AI</Text>
          </View>
          <Ionicons name="chatbubble-ellipses" size={36} color={C.orange} />
        </TouchableOpacity>

        <View style={{ height: r(16) }} />
      </ScrollView>
    </SafeAreaView>
  );
}

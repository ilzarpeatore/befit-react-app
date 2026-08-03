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
  Modal,
  Pressable,
  Alert,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AppIcon from '@components/AppIcon';
import AnimatedRing from '@components/AnimatedRing';
import { C, FONT } from './theme';
import { dashboardApi } from '../../api/dashboard';
import { workoutsApi } from '../../api/workouts';
import { workoutHistoryApi } from '../../api/workoutHistory';
import { dietApi } from '../../api/diet';
import { blogApi } from '../../api/blog';
import { workoutTemplateApi, WorkoutTemplateListItem } from '../../api/workoutTemplate';
import { subscriptionApi, PackageItem } from '../../api/subscription';
import { resourcesApi, ResourceListItem } from '../../api/resources';
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
  const { state, logout } = useAuth();
  const user = state.user;

  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const scrollRef = useRef<ScrollView>(null);
  const { width: winW, height: winH } = useWindowDimensions();
  const sc = useMemo(() => Math.min(winW / FIGMA_W, winH / FIGMA_H), [winW, winH]);
  const r = (n: number) => Math.round(n * sc);

  const [showMenu, setShowMenu] = useState(false);
  const [appleHealthOn, setAppleHealthOn] = useState(true);
  const [smartWatchOn, setSmartWatchOn] = useState(false);

  const [todayWorkouts, setTodayWorkouts] = useState<any[]>([]);
  const [weeklyWorkouts, setWeeklyWorkouts] = useState<boolean[]>([]);
  const [workoutList, setWorkoutList] = useState<any[]>([]);
  const [dailyPlan, setDailyPlan] = useState<any>(null);
  const [blogPosts, setBlogPosts] = useState<any[]>([]);
  const [notificationCount, setNotificationCount] = useState(0);
  const [workoutTemplateList, setWorkoutTemplateList] = useState<WorkoutTemplateListItem[]>([]);
  const [resourcesList, setResourcesList] = useState<ResourceListItem[]>([]);
  const [packageList, setPackageList] = useState<PackageItem[]>([]);

  const styles = useMemo(() => StyleSheet.create({
    container: { flex: 1, backgroundColor: C.bg },
    darkHeader: { backgroundColor: C.gray80, borderBottomLeftRadius: r(32), borderBottomRightRadius: r(32), paddingBottom: r(20) },
    headerTop: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: r(20), paddingTop: r(16) },
    avatar: { width: r(40), height: r(40), borderRadius: r(20), backgroundColor: C.gray70 },
    headerTitle: { flex: 1, fontSize: r(16), fontFamily: FONT.bold, color: C.white, textAlign: 'center' as const },
    notifBtn: { width: r(40), height: r(40), borderRadius: r(20), backgroundColor: C.brand5, alignItems: 'center' as const, justifyContent: 'center' as const },
    notifBadge: { position: 'absolute', top: r(6), right: r(6), width: r(16), height: r(16), borderRadius: r(8), backgroundColor: C.destructive, alignItems: 'center' as const, justifyContent: 'center' as const },
    notifBadgeText: { fontSize: r(8), fontFamily: FONT.bold, color: '#FFFFFF' },
    scoreRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: r(20), marginTop: 16 },
    scoreText: { fontSize: r(28), fontFamily: FONT.extraBold, color: C.white },
    scoreTitle: { fontSize: r(16), fontFamily: FONT.bold, color: C.white },
    scoreSub: { fontSize: r(13), color: C.white, marginTop: r(4) },
    sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: r(20), marginTop: r(24), marginBottom: r(12) },
    sectionTitle: { fontSize: r(17), fontFamily: FONT.bold, color: C.white },
    seeAll: { fontSize: r(13), fontFamily: FONT.semiBold, color: C.orange },
    todayWorkoutCard: { backgroundColor: C.surfaceLight, borderRadius: r(20), borderWidth: 1, borderColor: C.border, padding: r(16), marginHorizontal: r(20), marginBottom: r(12) },
    todayWorkoutTopRow: { flexDirection: 'row', alignItems: 'center', marginBottom: r(12) },
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
    workoutLevelBadge: { position: 'absolute', top: r(12), left: r(12), backgroundColor: C.surface, borderRadius: r(12), paddingHorizontal: r(8), paddingVertical: r(3) },
    workoutLevelText: { fontSize: r(10), fontFamily: FONT.bold, color: C.textPrimary },
    workoutBottomInfo: { position: 'absolute', bottom: r(12), left: r(12), right: r(12) },
    workoutCardTitle: { fontSize: r(16), fontFamily: FONT.bold, color: '#FFFFFF' },
    workoutCardMeta: { fontSize: r(11), color: '#FFFFFF', marginTop: r(4) },
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
    seeAllImage: { backgroundColor: C.orange, alignItems: 'center' as const, justifyContent: 'center' as const },
    lockBadge: { position: 'absolute' as const, top: r(8), right: r(8), flexDirection: 'row' as const, alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: r(10), paddingHorizontal: r(7), paddingVertical: r(3), gap: r(4) },
    lockBadgeText: { fontSize: r(9), color: '#FFFFFF', fontFamily: FONT.semiBold },
    programPriceBadge: { position: 'absolute' as const, bottom: r(8), left: r(8), backgroundColor: C.orange, borderRadius: r(10), paddingHorizontal: r(9), paddingVertical: r(3) },
    programPriceText: { fontSize: r(12), fontFamily: FONT.bold, color: '#FFFFFF' },
    supportCard: { backgroundColor: C.surfaceLight, borderRadius: r(20), borderWidth: 1, borderColor: C.border, padding: r(16), marginHorizontal: r(20), marginBottom: r(12), flexDirection: 'row', alignItems: 'center' },
    supportTitle: { flex: 1, fontSize: r(14), fontFamily: FONT.bold, color: C.white },
    supportLink: { fontSize: r(12), fontFamily: FONT.semiBold, color: C.orange, marginTop: r(6) },
    emptySection: { paddingHorizontal: r(20), paddingVertical: r(12), marginBottom: r(8) },
    myProgramBadge: { flexDirection: 'row' as const, alignItems: 'center', gap: r(5), paddingHorizontal: r(20), marginBottom: r(8) },
    myProgramBadgeText: { fontSize: r(11), fontFamily: FONT.semiBold, color: C.textPrimary },
    emptyText: { fontSize: r(13), color: C.textSecondary, textAlign: 'center' as const },
    errorBanner: { backgroundColor: C.destructive10, borderRadius: r(12), padding: r(12), marginHorizontal: r(20), marginBottom: r(12), flexDirection: 'row', alignItems: 'center' },
    errorText: { flex: 1, fontSize: r(12), color: C.destructive, marginLeft: r(8) },
    loader: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center' as const, justifyContent: 'center' as const },
    menuOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' as const },
    menuSheet: { backgroundColor: C.surface, borderTopLeftRadius: r(24), borderTopRightRadius: r(24), paddingBottom: r(24), maxHeight: '85%' as const },
    menuHandle: { width: r(40), height: r(4), borderRadius: r(2), backgroundColor: C.border, alignSelf: 'center' as const, marginTop: r(10), marginBottom: r(4) },
    menuHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: r(20), paddingVertical: r(16) },
    menuAvatar: { width: r(48), height: r(48), borderRadius: r(24), backgroundColor: C.gray70, marginRight: r(12) },
    menuGreeting: { fontSize: r(12), color: C.textSecondary },
    menuUserName: { fontSize: r(17), fontFamily: FONT.bold, color: C.white, marginTop: r(2) },
    menuCloseBtn: { width: r(32), height: r(32), borderRadius: r(16), backgroundColor: C.surfaceLight, alignItems: 'center' as const, justifyContent: 'center' as const },
    menuDivider: { height: 1, backgroundColor: C.border, marginHorizontal: r(20) },
    menuItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: r(20), paddingVertical: r(14) },
    menuItemText: { flex: 1, fontSize: r(15), fontFamily: FONT.semiBold, color: C.white },
    menuItemTextDanger: { color: C.destructive },
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

      const [dashRes, calendarRes, workoutsRes, dietRes, blogRes, workoutTemplatesRes, packagesRes, resourcesRes] = await Promise.allSettled([
        dashboardApi.getDashboard(),
        workoutHistoryApi.getMyCalendar(currentMonth, currentYear),
        workoutsApi.getList(1),
        dietApi.getDailyPlan(todayStr),
        blogApi.getList(1, { per_page: 3, order_by: 'created_at', order_dir: 'desc' }),
        workoutTemplateApi.getList(1, 3),
        // Un cliente 1:1 no necesita el catálogo de paquetes (ya tiene acceso
        // completo) — se pide igual porque Promise.allSettled es más simple así,
        // simplemente no se renderiza para ellos.
        subscriptionApi.getPackageList(),
        resourcesApi.getList({ per_page: 3 }),
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

      if (workoutTemplatesRes.status === 'fulfilled') {
        setWorkoutTemplateList((workoutTemplatesRes.value.data.data ?? []).slice(0, 3));
      }

      if (resourcesRes.status === 'fulfilled') {
        setResourcesList((resourcesRes.value.data.data ?? []).slice(0, 3));
      }

      if (packagesRes.status === 'fulfilled') {
        setPackageList((packagesRes.value.data.data ?? []).slice(0, 3));
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

  const handleLogout = () => {
    setShowMenu(false);
    Alert.alert('Cerrar sesión', '¿Estás seguro de que quieres cerrar sesión?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Cerrar sesión', style: 'destructive', onPress: () => logout() },
    ]);
  };

  const navigateFromMenu = (routeName: string) => {
    setShowMenu(false);
    navigation?.navigate(routeName);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.darkHeader}>
          <View style={styles.headerTop}>
            <TouchableOpacity onPress={() => setShowMenu(true)}>
              {user?.profile_image ? (
                <Image source={{ uri: user.profile_image }} style={styles.avatar} />
              ) : (
                <View style={styles.avatar} />
              )}
            </TouchableOpacity>
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
            <AppIcon name="trending-up" size={28} color="#FFFFFF" bg={C.orange} containerSize={r(64)} borderRadius={r(20)} style={{ marginRight: r(14) }} />
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

        {/* Actividad de hoy — para un cliente 1:1 esta ES su sección personalizada
            (viene del calendario que le asigna su coach, ProgramDayAssignment),
            así que se relabela y se destaca en vez de dejarla igual que
            cualquier otra sección genérica. */}
        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>
            {state.user?.is_personal_client ? 'Mi Programa' : 'Actividad de Hoy'}
          </Text>
          <TouchableOpacity onPress={() => navigation?.navigate('MigratedMyProgramCalendar')}>
            <Text style={styles.seeAll}>Ver Calendario</Text>
          </TouchableOpacity>
        </View>
        {state.user?.is_personal_client && (
          <View style={styles.myProgramBadge}>
            <Ionicons name="person-circle" size={14} color={C.textPrimary} />
            <Text style={styles.myProgramBadgeText}>Personalizado por tu coach</Text>
          </View>
        )}
        {todayWorkouts.length > 0 ? (
          <View style={styles.todayWorkoutCard}>
            {todayWorkouts.map((w: any, i: number) => (
              <TouchableOpacity
                key={`${w.assignment_id}-${i}`}
                style={i > 0 ? { marginTop: r(12), paddingTop: r(12), borderTopWidth: 1, borderTopColor: C.border } : {}}
                onPress={() => navigation?.navigate('MigratedWorkoutPreview', { programDayAssignmentId: w.assignment_id, mTitle: w.title || 'Entrenamiento' })}
              >
                <View style={styles.todayWorkoutTopRow}>
                  <AppIcon name="barbell" size={22} color={C.orange} bg="rgba(255,107,53,0.15)" containerSize={r(44)} borderRadius={r(12)} />
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
            <AppIcon name="bed-outline" size={26} color={C.textSecondary} bg={C.brand10} containerSize={r(48)} />
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

        {/* Rutinas + Workouts — catálogos genéricos de exploración. Un cliente
            1:1 ya tiene su entrenamiento real en "Mi Programa" arriba (asignado
            por su coach) — mostrarle además estos 2 catálogos genéricos es lo
            que generaba la confusión de "todo se ve igual"; se ocultan para
            ellos en vez de dejarlos con el mismo peso visual. */}
        {!state.user?.is_personal_client && (
          <>
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

            {/* Workouts sueltos (sistema v2, separado de Rutinas legacy) — 3 tarjetas
                reales + una 4ª tarjeta fija "Ver todos" (en vez de un link aparte
                en el título de sección). */}
            <View style={styles.sectionRow}>
              <Text style={styles.sectionTitle}>Workouts</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ paddingLeft: 16 }}>
              {workoutTemplateList.map((w) => {
                const locked = w.is_exclusive && !w.is_accessible;
                return (
                  <TouchableOpacity
                    key={w.id}
                    style={styles.blogCard}
                    onPress={() => navigation?.navigate('MigratedWorkoutPreview', { workoutTemplateId: w.id, mTitle: w.title })}
                  >
                    {w.thumbnail ? (
                      <Image source={{ uri: w.thumbnail }} style={styles.blogImage} resizeMode="cover" />
                    ) : (
                      <View style={styles.blogImage} />
                    )}
                    {locked && (
                      <View style={styles.lockBadge}>
                        <Ionicons name="lock-closed" size={11} color={'#FFFFFF'} />
                        <Text style={styles.lockBadgeText}>Exclusive</Text>
                      </View>
                    )}
                    <View style={styles.blogContent}>
                      <Text style={styles.blogTitle} numberOfLines={2}>{w.title}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
              <TouchableOpacity
                style={styles.blogCard}
                onPress={() => navigation?.navigate('MigratedWorkoutTemplateList')}
              >
                <View style={[styles.blogImage, styles.seeAllImage]}>
                  <Ionicons name="arrow-forward-circle" size={32} color="#FFFFFF" />
                </View>
                <View style={styles.blogContent}>
                  <Text style={[styles.blogTitle, { textAlign: 'center' }]}>Ver todos los workouts</Text>
                </View>
              </TouchableOpacity>
            </ScrollView>
          </>
        )}

        {/* Recursos — visible para todos (free y 1:1), a diferencia de
            Rutinas/Workouts: un cliente 1:1 tambien puede tener guias o
            documentos asignados individualmente por su coach. */}
        {resourcesList.length > 0 && (
          <>
            <View style={styles.sectionRow}>
              <Text style={styles.sectionTitle}>Recursos</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ paddingLeft: 16 }}>
              {resourcesList.map((r) => (
                <TouchableOpacity
                  key={r.id}
                  style={styles.blogCard}
                  onPress={() => navigation?.navigate('MigratedResourceDetail', { resourceId: r.id, title: r.title })}
                >
                  <View style={[styles.blogImage, styles.seeAllImage]}>
                    <Ionicons
                      name={r.type === 'video' ? 'play-circle-outline' : r.type === 'link' ? 'link-outline' : 'document-text-outline'}
                      size={32}
                      color="#FFFFFF"
                    />
                  </View>
                  <View style={styles.blogContent}>
                    <Text style={styles.blogTitle} numberOfLines={2}>{r.title}</Text>
                  </View>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={styles.blogCard}
                onPress={() => navigation?.navigate('MigratedResourcesList')}
              >
                <View style={[styles.blogImage, styles.seeAllImage]}>
                  <Ionicons name="arrow-forward-circle" size={32} color="#FFFFFF" />
                </View>
                <View style={styles.blogContent}>
                  <Text style={[styles.blogTitle, { textAlign: 'center' }]}>Ver todos los recursos</Text>
                </View>
              </TouchableOpacity>
            </ScrollView>
          </>
        )}

        {/* Programas — punto de entrada real a la tienda (2026-07-30). Para un
            cliente 1:1 no tiene sentido mostrar un carrusel de paquetes para
            comprar (ya tiene acceso completo) — se mantiene el mensaje simple.
            Para free: 3 tarjetas reales + una 4ª tarjeta fija "Ver todos". */}
        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Programas</Text>
        </View>
        {state.user?.is_personal_client ? (
          <TouchableOpacity
            style={styles.emptySection}
            activeOpacity={0.7}
            onPress={() => navigation?.navigate('MigratedSubscriptionDetail')}
          >
            <Text style={styles.emptyText}>Ya tienes acceso completo como cliente 1:1 →</Text>
          </TouchableOpacity>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ paddingLeft: 16 }}>
            {packageList.map((p) => (
              <TouchableOpacity
                key={p.id}
                style={styles.blogCard}
                onPress={() => navigation?.navigate('MigratedSubscribe')}
              >
                <View style={styles.blogImage}>
                  <View style={styles.programPriceBadge}>
                    <Text style={styles.programPriceText}>${Number(p.price ?? 0).toFixed(0)}</Text>
                  </View>
                </View>
                <View style={styles.blogContent}>
                  {(p.training_program_title || p.meal_plan_template_title) && (
                    <View style={{ flexDirection: 'row', gap: 4 }}>
                      {p.training_program_title && (
                        <View style={styles.blogTag}>
                          <Text style={styles.blogTagText}>Entrenamiento</Text>
                        </View>
                      )}
                      {p.meal_plan_template_title && (
                        <View style={styles.blogTag}>
                          <Text style={styles.blogTagText}>Nutrición</Text>
                        </View>
                      )}
                    </View>
                  )}
                  <Text style={styles.blogTitle} numberOfLines={2}>{p.name}</Text>
                  <Text style={styles.blogDate}>/ {p.duration} {p.duration_unit}{p.duration > 1 ? 's' : ''}</Text>
                </View>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.blogCard}
              onPress={() => navigation?.navigate('MigratedSubscriptionDetail')}
            >
              <View style={[styles.blogImage, styles.seeAllImage]}>
                <Ionicons name="arrow-forward-circle" size={32} color={C.white} />
              </View>
              <View style={styles.blogContent}>
                <Text style={[styles.blogTitle, { textAlign: 'center' }]}>Ver todos los programas</Text>
              </View>
            </TouchableOpacity>
          </ScrollView>
        )}

        {/* Nutrición */}
        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Nutrición</Text>
          <TouchableOpacity onPress={() => navigation?.navigate('DietDashboard')}>
            <Text style={styles.seeAll}>Ver dieta</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.nutritionCard}>
          {dailyPlan ? (
            <>
              <View style={styles.nutritionTopRow}>
                <View style={styles.nutritionSide}>
                  <Text style={styles.nutritionSideLabel}>Objetivo</Text>
                  <Text style={styles.nutritionSideValue}>{dailyPlan.daily_kcal ?? 0}</Text>
                </View>
                <View style={styles.nutritionCalCenter}>
                  <AnimatedRing
                    size={r(84)}
                    strokeWidth={r(7)}
                    percent={Math.min(((dailyPlan.eaten ?? 0) / Math.max(dailyPlan.daily_kcal ?? 1, 1)) * 100, 100)}
                    color={C.orange}
                    trackColor={C.gray70}
                    duration={900}
                  >
                    <Text style={styles.nutritionCalValue}>{dailyPlan.eaten ?? 0}</Text>
                    <Text style={styles.nutritionCalLabel}>consumido</Text>
                  </AnimatedRing>
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
              <AppIcon name="nutrition-outline" size={26} color={C.success} bg={C.success10} containerSize={r(48)} />
              <Text style={[styles.nutritionMsg, { marginTop: r(8) }]}>Sin plan de alimentación hoy</Text>
            </View>
          )}
          <TouchableOpacity style={styles.nutritionLink} onPress={() => navigation?.navigate('MigratedPlan')}>
            <Text style={styles.nutritionLinkText}>Añadir comidas</Text>
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
          <AppIcon name="chatbubble-ellipses" size={28} color={C.orange} bg="rgba(255,107,53,0.15)" containerSize={r(52)} />
        </TouchableOpacity>

        <View style={{ height: r(16) }} />
      </ScrollView>

      <TouchableOpacity
        onPress={() => navigation?.navigate('ScreenExplorer')}
        style={{ position: 'absolute', bottom: 80, right: 20, width: 56, height: 56, borderRadius: 28, backgroundColor: '#E5E5EA', alignItems: 'center', justifyContent: 'center', elevation: 8, shadowColor: '#E5E5EA', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, zIndex: 999 }}
      >
        <Text style={{ fontSize: 28, color: '#000000', marginTop: -2 }}>+</Text>
      </TouchableOpacity>

      {/* Menú de usuario (perfil, favoritos, ajustes, salud, comunidad, logout) */}
      <Modal visible={showMenu} transparent animationType="slide" onRequestClose={() => setShowMenu(false)}>
        <Pressable style={styles.menuOverlay} onPress={() => setShowMenu(false)}>
          <Pressable style={styles.menuSheet} onPress={(e) => e.stopPropagation()}>
            <View style={styles.menuHandle} />
            <View style={styles.menuHeader}>
              {user?.profile_image ? (
                <Image source={{ uri: user.profile_image }} style={styles.menuAvatar} />
              ) : (
                <View style={styles.menuAvatar} />
              )}
              <View style={{ flex: 1 }}>
                <Text style={styles.menuGreeting}>Hola</Text>
                <Text style={styles.menuUserName}>{user?.display_name || displayName}</Text>
              </View>
              <TouchableOpacity style={styles.menuCloseBtn} onPress={() => setShowMenu(false)}>
                <Ionicons name="close" size={18} color={C.white} />
              </TouchableOpacity>
            </View>
            <View style={styles.menuDivider} />

            <TouchableOpacity style={styles.menuItem} onPress={() => navigateFromMenu('Profile')}>
              <AppIcon name="person-outline" size={18} color={C.textPrimary} bg={C.brand10} containerSize={r(36)} borderRadius={r(12)} style={{ marginRight: r(14) }} />
              <Text style={styles.menuItemText}>Mi Perfil</Text>
              <Ionicons name="chevron-forward" size={18} color={C.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={() => navigateFromMenu('FavouriteWorkouts')}>
              <AppIcon name="heart-outline" size={18} color={C.destructive} bg={C.destructive10} containerSize={r(36)} borderRadius={r(12)} style={{ marginRight: r(14) }} />
              <Text style={styles.menuItemText}>Mis Favoritos</Text>
              <Ionicons name="chevron-forward" size={18} color={C.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={() => navigateFromMenu('Settings')}>
              <AppIcon name="settings-outline" size={18} color={C.textPrimary} bg={C.brand10} containerSize={r(36)} borderRadius={r(12)} style={{ marginRight: r(14) }} />
              <Text style={styles.menuItemText}>Configuración General</Text>
              <Ionicons name="chevron-forward" size={18} color={C.textSecondary} />
            </TouchableOpacity>

            <View style={styles.menuItem}>
              <AppIcon name="fitness-outline" size={18} color={C.success} bg={C.success10} containerSize={r(36)} borderRadius={r(12)} style={{ marginRight: r(14) }} />
              <Text style={styles.menuItemText}>Apple Health</Text>
              <Switch
                value={appleHealthOn}
                onValueChange={setAppleHealthOn}
                trackColor={{ false: C.gray70, true: C.primary }}
                thumbColor={C.white}
              />
            </View>

            <View style={styles.menuItem}>
              <AppIcon name="watch-outline" size={18} color={C.blue} bg={C.blue10} containerSize={r(36)} borderRadius={r(12)} style={{ marginRight: r(14) }} />
              <Text style={styles.menuItemText}>Smart Watch</Text>
              <Switch
                value={smartWatchOn}
                onValueChange={setSmartWatchOn}
                trackColor={{ false: C.gray70, true: C.primary }}
                thumbColor={C.white}
              />
            </View>

            <TouchableOpacity style={styles.menuItem} onPress={() => navigateFromMenu('CommunityFeed')}>
              <AppIcon name="people-outline" size={18} color={C.textPrimary} bg={C.brand10} containerSize={r(36)} borderRadius={r(12)} style={{ marginRight: r(14) }} />
              <Text style={styles.menuItemText}>Community</Text>
              <Ionicons name="chevron-forward" size={18} color={C.textSecondary} />
            </TouchableOpacity>

            <View style={styles.menuDivider} />

            <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
              <AppIcon name="log-out-outline" size={18} color={C.destructive} bg={C.destructive10} containerSize={r(36)} borderRadius={r(12)} style={{ marginRight: r(14) }} />
              <Text style={[styles.menuItemText, styles.menuItemTextDanger]}>Cerrar sesión</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

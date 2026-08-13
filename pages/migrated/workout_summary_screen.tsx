import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  FlatList,
  Image,
  ScrollView,
  Alert,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library';
import Share from 'react-native-share';
import { C, FONT, SHADOW } from './theme';
import MuscleBodyMap, { MuscleVolumeGroup } from '../../components/MuscleBodyMap';
import { ViewSide } from '../../constants/bodyMusclesPaths';
import { muscleVolumeApi, MuscleVolumeSet } from '../../api/muscleVolume';
import { dashboardApi } from '../../api/dashboard';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PAGE_INDEXES = [0, 1, 2, 3, 4, 5];
const CONDENSED_PAGE_INDEX = 4;

interface Props {
  navigation?: any;
  route?: any;
}

interface ExerciseSummaryItem {
  title: string;
  sets: number;
}

interface FunReference {
  name: string;
  weightKg: number;
  emoji: string;
}

// Referencias de peso reales, de mayor a menor — se elige la mayor que quepa
// al menos una vez en el volumen total, para que la comparación nunca sea
// "0.01 elefantes" (equivalente al "camión" de Hevy, con objetos que sí
// existen en el imaginario de nuestros usuarios).
const FUN_REFERENCES: FunReference[] = [
  { name: 'un elefante africano', weightKg: 6000, emoji: '🐘' },
  { name: 'un coche utilitario', weightKg: 1200, emoji: '🚗' },
  { name: 'un oso pardo', weightKg: 400, emoji: '🐻' },
  { name: 'un piano de cola', weightKg: 300, emoji: '🎹' },
  { name: 'una moto', weightKg: 180, emoji: '🏍️' },
  { name: 'un gran danés', weightKg: 70, emoji: '🐕' },
];

function getFunFact(volumeKg: number): { text: string; emoji: string } | null {
  if (!volumeKg || volumeKg <= 0) return null;
  const ref = FUN_REFERENCES.find((r) => volumeKg >= r.weightKg) ?? FUN_REFERENCES[FUN_REFERENCES.length - 1];
  const multiple = volumeKg / ref.weightKg;
  if (multiple >= 1.15) {
    const count = Math.round(multiple * 10) / 10;
    return { text: `¡Eso es como levantar ${count} veces ${ref.name}!`, emoji: ref.emoji };
  }
  if (multiple >= 0.85) {
    return { text: `¡Eso es como levantar ${ref.name}!`, emoji: ref.emoji };
  }
  const percent = Math.round(multiple * 100);
  return { text: `Eso es el ${percent}% del peso de ${ref.name}`, emoji: ref.emoji };
}

function formatDuration(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  if (m === 0) return `${s}s`;
  return `${m}min`;
}

// Antes había 6 botones que todos hacían exactamente lo mismo (abrir el
// share sheet genérico). Ahora cada uno tiene una acción real y distinta:
// Instagram va directo a Stories, Descargar guarda en la galería sin pasos
// intermedios, y Más es el único que abre el selector genérico de apps.
const SHARE_ICONS: { key: string; icon: keyof typeof Ionicons.glyphMap; label: string }[] = [
  { key: 'stories', icon: 'logo-instagram', label: 'Instagram' },
  { key: 'download', icon: 'download-outline', label: 'Descargar' },
  { key: 'more', icon: 'ellipsis-horizontal', label: 'Más' },
];

const Card = React.forwardRef<View, { children: React.ReactNode; footerCentered?: boolean }>(
  ({ children, footerCentered }, ref) => (
    <View ref={ref} collapsable={false} style={s.card}>
      <View style={s.cardBody}>{children}</View>
      <View style={[s.cardFooter, footerCentered && s.cardFooterCentered]}>
        <Image source={require('@assets/logo.png')} style={s.cardFooterLogo} resizeMode="contain" />
        <Text style={s.cardFooterHandle}>@befit</Text>
      </View>
    </View>
  )
);

function StatCol({ label, value }: { label: string; value: string }) {
  return (
    <View style={s.statCol}>
      <Text style={s.statColValue}>{value}</Text>
      <Text style={s.statColLabel}>{label}</Text>
    </View>
  );
}

function GridCell({ value, label }: { value: string; label: string }) {
  return (
    <View style={s.gridCell}>
      <Text style={s.gridValue}>{value}</Text>
      <Text style={s.gridLabel}>{label}</Text>
    </View>
  );
}

function CondensedStat({ value, label }: { value: string; label: string }) {
  return (
    <View style={s.condensedStat}>
      <Text style={s.condensedValue}>{value}</Text>
      <Text style={s.condensedLabel}>{label}</Text>
    </View>
  );
}

function ExerciseRow({ item }: { item: ExerciseSummaryItem }) {
  return (
    <View style={s.exerciseRow}>
      <Text style={s.exerciseSets}>{item.sets}x</Text>
      <Text style={s.exerciseName} numberOfLines={1}>
        {item.title}
      </Text>
    </View>
  );
}

export default function WorkoutSummaryScreen(props: Props) {
  const { navigation, route } = props;
  const {
    mTitle,
    durationSeconds = 0,
    volumeKg = 0,
    exerciseCount = 0,
    completedSets = 0,
    muscleVolumeSets = [],
    exercisesSummary = [],
  } = route?.params ?? {};

  const [muscleVolume, setMuscleVolume] = useState<MuscleVolumeGroup[]>([]);
  const [mapLoading, setMapLoading] = useState(false);
  const [workoutNumber, setWorkoutNumber] = useState<number | null>(null);
  const [pageIndex, setPageIndex] = useState(0);
  const [isSharing, setIsSharing] = useState(false);
  const pagerRef = useRef<FlatList>(null);
  const cardRefs = useRef<Record<number, View | null>>({});

  useEffect(() => {
    const sets: MuscleVolumeSet[] = muscleVolumeSets;
    if (!sets || sets.length === 0) return;
    let active = true;
    setMapLoading(true);
    muscleVolumeApi
      .compute(sets)
      .then((res) => {
        if (!active) return;
        const data = res.data?.data || res.data;
        setMuscleVolume(data?.volumeByMuscle || []);
      })
      .catch(() => {})
      .finally(() => {
        if (active) setMapLoading(false);
      });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let active = true;
    dashboardApi
      .getDashboard()
      .then((res) => {
        if (!active) return;
        const total = res.data?.data?.workout?.total_workout;
        if (typeof total === 'number') setWorkoutNumber(total);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const funFact = useMemo(() => getFunFact(volumeKg), [volumeKg]);

  const topMuscles = useMemo(() => {
    const total = muscleVolume.reduce((sum, m) => sum + m.volume, 0);
    if (total <= 0) return [];
    return [...muscleVolume]
      .filter((m) => m.volume > 0)
      .sort((a, b) => b.volume - a.volume)
      .slice(0, 3)
      .map((m) => `${m.group} ${Math.round((m.volume / total) * 100)}%`);
  }, [muscleVolume]);

  const onDone = () => {
    if (typeof navigation?.popToTop === 'function') {
      navigation.popToTop();
    } else {
      navigation?.navigate('MigratedHomeModern');
    }
  };

  /** Genera la imagen del card actual una sola vez y la reutiliza en las 3 acciones. */
  const captureCard = async (): Promise<string | null> => {
    const node = cardRefs.current[pageIndex];
    if (!node) return null;
    return captureRef(node, { format: 'png', quality: 0.92 });
  };

  const onShareMore = async () => {
    if (isSharing) return;
    setIsSharing(true);
    try {
      const uri = await captureCard();
      if (!uri) return;
      const available = await Sharing.isAvailableAsync();
      if (!available) {
        Alert.alert('No disponible', 'Compartir no está disponible en este dispositivo.');
        return;
      }
      await Sharing.shareAsync(uri, { mimeType: 'image/png', dialogTitle: 'Compartir entrenamiento' });
    } catch (e) {
      Alert.alert('Error', 'No se pudo generar la imagen para compartir.');
    } finally {
      setIsSharing(false);
    }
  };

  const onDownload = async () => {
    if (isSharing) return;
    setIsSharing(true);
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso necesario', 'Activa el acceso a tu galería para poder guardar la imagen.');
        return;
      }
      const uri = await captureCard();
      if (!uri) return;
      await MediaLibrary.saveToLibraryAsync(uri);
      Alert.alert('Guardado', 'La imagen se ha guardado en tu galería.');
    } catch (e) {
      Alert.alert('Error', 'No se pudo guardar la imagen.');
    } finally {
      setIsSharing(false);
    }
  };

  const onShareInstagramStories = async () => {
    if (isSharing) return;
    setIsSharing(true);
    try {
      const uri = await captureCard();
      if (!uri) return;
      await Share.shareSingle({
        social: Share.Social.INSTAGRAM_STORIES,
        backgroundImage: uri,
        appId: process.env.EXPO_PUBLIC_FACEBOOK_APP_ID,
      } as any);
    } catch (e: any) {
      // El usuario cancelando el share no es un error real.
      if (e?.message && !/cancel/i.test(e.message)) {
        Alert.alert('Instagram no disponible', '¿Tienes Instagram instalada? No se pudo abrir Stories.');
      }
    } finally {
      setIsSharing(false);
    }
  };

  const onShareAction = (key: string) => {
    if (key === 'stories') return onShareInstagramStories();
    if (key === 'download') return onDownload();
    return onShareMore();
  };

  const onPagerScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    setPageIndex(Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH));
  };

  const goToPage = (idx: number) => {
    pagerRef.current?.scrollToIndex({ index: idx, animated: true });
    setPageIndex(idx);
  };

  const renderMap = (height: number, forcedView?: ViewSide) => {
    if (mapLoading) return <ActivityIndicator size="small" color={C.textSecondary} />;
    return <MuscleBodyMap data={muscleVolume} height={height} showToggle={false} forcedView={forcedView} />;
  };

  const renderPage = (index: number) => {
    switch (index) {
      case 0:
        return (
          <View style={s.p0Wrap}>
            <Text style={s.p0Label}>Has levantado un total de</Text>
            <Text style={s.p0Value}>{Math.round(volumeKg)} kg</Text>
            {funFact ? (
              <>
                <Text style={s.p0Emoji}>{funFact.emoji}</Text>
                <Text style={s.p0Fact}>{funFact.text}</Text>
              </>
            ) : null}
          </View>
        );
      case 1:
        return (
          <View style={s.pageFill}>
            <View style={s.statsRow3}>
              <StatCol label="Duración" value={formatDuration(durationSeconds)} />
              <StatCol label="Volumen" value={`${Math.round(volumeKg)} kg`} />
              <StatCol label="Series" value={String(completedSets)} />
            </View>
            <View style={[s.miniMapWrap, s.heatmapRow]}>
              <View style={s.heatmapCol}>{renderMap(170, ViewSide.FRONT)}</View>
              <View style={s.heatmapCol}>{renderMap(170, ViewSide.BACK)}</View>
            </View>
          </View>
        );
      case 2:
        return (
          <View style={s.pageFill}>
            <Text style={s.routineTitle} numberOfLines={2}>
              {mTitle || 'Tu entrenamiento'}
            </Text>
            <View style={s.grid2x2}>
              <GridCell value={formatDuration(durationSeconds)} label="Duración" />
              <GridCell value={`${Math.round(volumeKg)} kg`} label="Volumen" />
              <GridCell value={String(exerciseCount)} label="Ejercicios" />
              <GridCell value={String(completedSets)} label="Series" />
            </View>
          </View>
        );
      case 3:
        return (
          <View style={s.pageFill}>
            <Text style={s.routineTitle} numberOfLines={2}>
              {mTitle || 'Tu entrenamiento'}
            </Text>
            <View style={s.statsRowCompact}>
              <View style={s.compactStat}>
                <Text style={s.compactLabel}>Duración</Text>
                <Text style={s.compactValue}>{formatDuration(durationSeconds)}</Text>
              </View>
              <View style={s.compactStat}>
                <Text style={s.compactLabel}>Volumen</Text>
                <Text style={s.compactValue}>{Math.round(volumeKg)} kg</Text>
              </View>
              <View style={s.compactStat}>
                <Text style={s.compactLabel}>Series</Text>
                <Text style={s.compactValue}>{completedSets}</Text>
              </View>
            </View>
            <ScrollView style={s.exerciseListScroll} showsVerticalScrollIndicator={false}>
              {exercisesSummary.length > 0 ? (
                exercisesSummary.map((ex: ExerciseSummaryItem, i: number) => <ExerciseRow key={i} item={ex} />)
              ) : (
                <Text style={s.emptyHint}>Sin ejercicios registrados.</Text>
              )}
            </ScrollView>
          </View>
        );
      case CONDENSED_PAGE_INDEX:
        return (
          <View style={s.p4Wrap}>
            <CondensedStat value={formatDuration(durationSeconds)} label="Duración" />
            <CondensedStat value={`${Math.round(volumeKg)} kg`} label="Volumen" />
            <CondensedStat value={String(completedSets)} label="Series" />
          </View>
        );
      case 5:
      default:
        return (
          <View style={s.pageFill}>
            <Text style={s.routineTitle} numberOfLines={2}>
              {mTitle || 'Tu entrenamiento'}
            </Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              {exercisesSummary.length > 0 ? (
                exercisesSummary.map((ex: ExerciseSummaryItem, i: number) => <ExerciseRow key={i} item={ex} />)
              ) : null}
              <View style={s.heatmapRow}>
                <View style={s.heatmapCol}>{renderMap(140, ViewSide.FRONT)}</View>
                <View style={s.heatmapCol}>{renderMap(140, ViewSide.BACK)}</View>
              </View>
              {topMuscles.length > 0 ? <Text style={s.topMusclesText}>{topMuscles.join(' · ')}</Text> : null}
            </ScrollView>
          </View>
        );
    }
  };

  return (
    <SafeAreaView style={s.container} edges={['top', 'bottom']}>
      <View style={s.header}>
        <View style={s.confettiBadge}>
          <Ionicons name="sparkles" size={26} color={C.orange} />
        </View>
        <Text style={s.headerTitle}>¡Bien hecho!</Text>
        <Text style={s.headerSubtitle}>
          {workoutNumber ? `Este es tu entrenamiento número ${workoutNumber}` : 'Entrenamiento completado'}
        </Text>
      </View>

      <View style={s.pagerWrap}>
        <FlatList
          ref={pagerRef}
          data={PAGE_INDEXES}
          keyExtractor={(i) => String(i)}
          renderItem={({ item }) => (
            <View style={{ width: SCREEN_WIDTH, flex: 1, paddingHorizontal: 20 }}>
              <Card
                ref={(el) => {
                  cardRefs.current[item] = el;
                }}
                footerCentered={item === CONDENSED_PAGE_INDEX}
              >
                {renderPage(item)}
              </Card>
            </View>
          )}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={onPagerScrollEnd}
          style={{ flex: 1 }}
        />
      </View>

      <View style={s.dotsRow}>
        {PAGE_INDEXES.map((i) => (
          <TouchableOpacity key={i} onPress={() => goToPage(i)} hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}>
            <View style={[s.dot, i === pageIndex && s.dotActive]} />
          </TouchableOpacity>
        ))}
      </View>

      <Text style={s.shareLabel}>Compartir entrenamiento</Text>
      <View style={s.shareRow}>
        {SHARE_ICONS.map((item) => (
          <TouchableOpacity
            key={item.key}
            style={s.shareItem}
            onPress={() => onShareAction(item.key)}
            disabled={isSharing}
            activeOpacity={0.75}
          >
            <View style={s.shareCircle}>
              {isSharing ? (
                <ActivityIndicator size="small" color={C.textPrimary} />
              ) : (
                <Ionicons name={item.icon} size={19} color={C.textPrimary} />
              )}
            </View>
            <Text style={s.shareItemLabel}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={s.footer}>
        <TouchableOpacity style={s.doneBtn} activeOpacity={0.85} onPress={onDone}>
          <Text style={s.doneBtnText}>OK</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  header: { alignItems: 'center', paddingHorizontal: 24, paddingTop: 8, paddingBottom: 16 },
  confettiBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: C.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    ...SHADOW.card,
  },
  headerTitle: { fontFamily: FONT.black, fontSize: 26, color: C.textPrimary, textAlign: 'center' },
  headerSubtitle: { fontFamily: FONT.regular, fontSize: 13.5, color: C.textSecondary, textAlign: 'center', marginTop: 6 },

  pagerWrap: { flex: 1 },
  card: {
    flex: 1,
    backgroundColor: C.surface,
    borderRadius: 28,
    padding: 22,
    ...SHADOW.card,
  },
  cardBody: { flex: 1 },
  cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 },
  cardFooterCentered: { justifyContent: 'center', gap: 8 },
  cardFooterLogo: { width: 60, height: 18 },
  cardFooterHandle: { fontFamily: FONT.regular, fontSize: 12.5, color: C.textSecondary },

  dotsRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 7, marginTop: 12 },
  dot: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: C.border },
  dotActive: { backgroundColor: C.accentBlack, width: 18 },

  shareLabel: { fontFamily: FONT.regular, fontSize: 12.5, color: C.textSecondary, textAlign: 'center', marginTop: 14 },
  shareRow: { flexDirection: 'row', justifyContent: 'center', gap: 14, marginTop: 10, paddingHorizontal: 12 },
  shareItem: { alignItems: 'center', width: 56 },
  shareCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: C.surface, alignItems: 'center', justifyContent: 'center', ...SHADOW.card },
  shareItemLabel: { fontFamily: FONT.regular, fontSize: 9.5, color: C.textSecondary, marginTop: 5, textAlign: 'center' },

  footer: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 6 },
  doneBtn: { backgroundColor: C.accentBlack, borderRadius: 30, paddingVertical: 16, alignItems: 'center' },
  doneBtnText: { fontFamily: FONT.bold, fontSize: 15, color: '#FFFFFF', letterSpacing: 0.5 },

  pageFill: { flex: 1 },

  // Pantalla 1 — dato motivacional
  p0Wrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  p0Label: { fontFamily: FONT.regular, fontSize: 14, color: C.textSecondary },
  p0Value: { fontFamily: FONT.black, fontSize: 44, color: C.orange, marginTop: 6 },
  p0Emoji: { fontSize: 48, marginTop: 20 },
  p0Fact: { fontFamily: FONT.semiBold, fontSize: 15, color: C.textPrimary, textAlign: 'center', marginTop: 10, paddingHorizontal: 12 },

  // Pantalla 2 — stats + mini heatmap
  statsRow3: { flexDirection: 'row', paddingTop: 4, paddingBottom: 8 },
  statCol: { flex: 1, alignItems: 'center' },
  statColValue: { fontFamily: FONT.extraBold, fontSize: 20, color: C.textPrimary },
  statColLabel: { fontFamily: FONT.regular, fontSize: 12, color: C.textSecondary, marginTop: 3 },
  miniMapWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  // Pantalla 3 — rutina + grid 2x2
  routineTitle: { fontFamily: FONT.extraBold, fontSize: 20, color: C.textPrimary, marginBottom: 20 },
  grid2x2: { flexDirection: 'row', flexWrap: 'wrap' },
  gridCell: { width: '50%', marginBottom: 32 },
  gridValue: { fontFamily: FONT.black, fontSize: 28, color: C.textPrimary },
  gridLabel: { fontFamily: FONT.regular, fontSize: 13, color: C.textSecondary, marginTop: 4 },

  // Pantalla 4 — rutina + stats compactos + lista
  statsRowCompact: { flexDirection: 'row', marginBottom: 18, gap: 20 },
  compactStat: {},
  compactLabel: { fontFamily: FONT.regular, fontSize: 11.5, color: C.textSecondary },
  compactValue: { fontFamily: FONT.bold, fontSize: 16, color: C.textPrimary, marginTop: 2 },
  exerciseListScroll: { flex: 1 },
  exerciseRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  exerciseSets: { fontFamily: FONT.extraBold, fontSize: 16, color: C.orange, width: 34 },
  exerciseName: { flex: 1, fontFamily: FONT.semiBold, fontSize: 15, color: C.textPrimary },
  emptyHint: { fontFamily: FONT.regular, fontSize: 13, color: C.textSecondary },

  // Pantalla 5 — resumen condensado
  p4Wrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  condensedStat: { alignItems: 'center', marginVertical: 18 },
  condensedValue: { fontFamily: FONT.black, fontSize: 30, color: C.textPrimary },
  condensedLabel: { fontFamily: FONT.regular, fontSize: 13, color: C.textSecondary, marginTop: 4 },

  // Pantalla 6 — heatmap completo
  heatmapRow: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 16 },
  heatmapCol: { alignItems: 'center' },
  topMusclesText: { fontFamily: FONT.regular, fontSize: 12, color: C.textSecondary, textAlign: 'center', marginTop: 12 },
});

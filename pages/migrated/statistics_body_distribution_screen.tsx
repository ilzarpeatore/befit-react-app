import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import { C, FONT, SHADOW } from './theme';
import MuscleBodyMap, { MuscleVolumeGroup } from '../../components/MuscleBodyMap';
import { ViewSide } from '../../constants/bodyMusclesPaths';
import DaySelectorStrip, { buildWeekRange, DaySelectorItem, toLocalISODate } from '../../components/DaySelectorStrip';
import { muscleVolumeApi, MuscleVolumeSeriesGroup } from '../../api/muscleVolume';

interface Props {
  navigation?: any;
  route?: any;
}

const MONTHS_ES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

function weekLabel(days: DaySelectorItem[]): string {
  const start = new Date(days[0].date + 'T00:00:00');
  const end = new Date(days[days.length - 1].date + 'T00:00:00');
  if (start.getMonth() === end.getMonth()) {
    return `${start.getDate()}-${end.getDate()} ${MONTHS_ES[start.getMonth()]} ${end.getFullYear()}`;
  }
  return `${start.getDate()} ${MONTHS_ES[start.getMonth()].slice(0, 3)} - ${end.getDate()} ${MONTHS_ES[end.getMonth()].slice(0, 3)} ${end.getFullYear()}`;
}

export default function StatisticsBodyDistributionScreen(props: Props) {
  const { navigation } = props;
  const [weekAnchor, setWeekAnchor] = useState(new Date());
  const weekDays = useMemo(() => buildWeekRange(weekAnchor), [weekAnchor]);
  const todayISO = useMemo(() => toLocalISODate(new Date()), []);
  const [selectedDate, setSelectedDate] = useState(() => {
    const days = buildWeekRange(new Date());
    const today = toLocalISODate(new Date());
    return days.some((d) => d.date === today) ? today : days[days.length - 1].date;
  });

  const [volumeByMuscle, setVolumeByMuscle] = useState<MuscleVolumeGroup[]>([]);
  const [seriesByMuscle, setSeriesByMuscle] = useState<MuscleVolumeSeriesGroup[]>([]);
  const [totalSeries, setTotalSeries] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    muscleVolumeApi
      .getMy(1, selectedDate)
      .then((res) => {
        if (!active) return;
        const data = res.data?.data || res.data;
        setVolumeByMuscle(data?.volumeByMuscle || []);
        setSeriesByMuscle(data?.seriesByMuscle || []);
        setTotalSeries(data?.totalSeries || 0);
      })
      .catch(() => {
        if (!active) return;
        setVolumeByMuscle([]);
        setSeriesByMuscle([]);
        setTotalSeries(0);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [selectedDate]);

  const seriesByGroup = useMemo(() => {
    const map = new Map<string, number>();
    seriesByMuscle.forEach((m) => map.set(m.group, m.series));
    return map;
  }, [seriesByMuscle]);

  const goPrevWeek = () => {
    const d = new Date(weekAnchor);
    d.setDate(d.getDate() - 7);
    setWeekAnchor(d);
    setSelectedDate(buildWeekRange(d)[0].date);
  };
  const goNextWeek = () => {
    const d = new Date(weekAnchor);
    d.setDate(d.getDate() + 7);
    setWeekAnchor(d);
    const days = buildWeekRange(d);
    setSelectedDate(days.some((x) => x.date === todayISO) ? todayISO : days[0].date);
  };

  const shareRef = useRef<View>(null);
  const [isSharing, setIsSharing] = useState(false);
  const onShare = async () => {
    if (!shareRef.current || isSharing) return;
    setIsSharing(true);
    try {
      const uri = await captureRef(shareRef, { format: 'png', quality: 0.92 });
      const available = await Sharing.isAvailableAsync();
      if (!available) {
        Alert.alert('No disponible', 'Compartir no está disponible en este dispositivo.');
        return;
      }
      await Sharing.shareAsync(uri, { mimeType: 'image/png', dialogTitle: 'Compartir mapa corporal' });
    } catch (e) {
      Alert.alert('Error', 'No se pudo generar la imagen para compartir.');
    } finally {
      setIsSharing(false);
    }
  };
  const onHelp = () =>
    Alert.alert(
      '¿Qué muestra este mapa?',
      'El color de cada zona refleja el volumen entrenado ese día. La tabla de abajo muestra las series registradas por grupo muscular.'
    );

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <View style={s.appBar}>
        <TouchableOpacity onPress={() => navigation?.goBack()} style={s.iconBtn}>
          <Ionicons name="chevron-back" size={22} color={C.textPrimary} />
        </TouchableOpacity>
        <Text style={s.appBarTitle} numberOfLines={1}>
          Distribución del cuerpo
        </Text>
        <View style={s.appBarRightIcons}>
          <TouchableOpacity style={s.smallIconBtn} onPress={onHelp}>
            <Text style={s.helpBtnText}>?</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.smallIconBtn} onPress={onShare} disabled={isSharing}>
            {isSharing ? (
              <ActivityIndicator size="small" color={C.textSecondary} />
            ) : (
              <Ionicons name="share-outline" size={16} color={C.textSecondary} />
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={s.weekNav}>
          <TouchableOpacity onPress={goPrevWeek} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="chevron-back" size={18} color={C.textSecondary} />
          </TouchableOpacity>
          <Text style={s.weekNavLabel}>{weekLabel(weekDays)}</Text>
          <TouchableOpacity onPress={goNextWeek} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="chevron-forward" size={18} color={C.textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={s.daySelectorWrap}>
          <DaySelectorStrip days={weekDays} selectedDate={selectedDate} onSelect={setSelectedDate} />
        </View>

        <View ref={shareRef} collapsable={false} style={s.heatmapCard}>
          {isLoading ? (
            <ActivityIndicator size="large" color={C.textSecondary} style={{ paddingVertical: 60 }} />
          ) : (
            <View style={s.heatmapRow}>
              <MuscleBodyMap data={volumeByMuscle} height={190} showToggle={false} forcedView={ViewSide.FRONT} />
              <MuscleBodyMap data={volumeByMuscle} height={190} showToggle={false} forcedView={ViewSide.BACK} />
            </View>
          )}
        </View>

        <View style={s.tableCard}>
          <View style={s.tableHeaderRow}>
            <Text style={s.tableHeaderLabel}>MÚSCULO</Text>
            <Text style={s.tableHeaderValue}>SERIES</Text>
          </View>
          <View style={[s.tableRow, s.tableTotalRow]}>
            <Text style={s.tableTotalLabel}>Total</Text>
            <Text style={s.tableTotalValue}>{totalSeries}</Text>
          </View>
          {volumeByMuscle.map((m, idx) => (
            <View key={m.group} style={[s.tableRow, idx < volumeByMuscle.length - 1 && s.tableRowDivider]}>
              <Text style={s.tableRowLabel}>{m.group}</Text>
              <Text style={s.tableRowValue}>{seriesByGroup.get(m.group) ?? 0}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  appBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingVertical: 12 },
  iconBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  appBarTitle: { flex: 1, textAlign: 'center', fontSize: 16, fontFamily: FONT.bold, color: C.textPrimary, marginHorizontal: 4 },
  appBarRightIcons: { flexDirection: 'row', gap: 8 },
  smallIconBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: C.surface, alignItems: 'center', justifyContent: 'center', ...SHADOW.card },
  helpBtnText: { fontFamily: FONT.bold, fontSize: 13, color: C.textSecondary },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 32 },
  weekNav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 16, marginTop: 8 },
  weekNavLabel: { fontFamily: FONT.semiBold, fontSize: 15, color: C.textPrimary },
  daySelectorWrap: { marginTop: 18 },
  heatmapCard: {
    backgroundColor: C.surface,
    borderRadius: 20,
    marginTop: 16,
    paddingVertical: 12,
    minHeight: 180,
    justifyContent: 'center',
    ...SHADOW.card,
  },
  heatmapRow: { flexDirection: 'row', justifyContent: 'space-around' },
  tableCard: { backgroundColor: C.surface, borderRadius: 20, marginTop: 16, overflow: 'hidden', ...SHADOW.card },
  tableHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: C.gray5,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  tableHeaderLabel: { fontFamily: FONT.semiBold, fontSize: 12, color: C.textSecondary, letterSpacing: 0.4 },
  tableHeaderValue: { fontFamily: FONT.semiBold, fontSize: 12, color: C.textSecondary, letterSpacing: 0.4 },
  tableRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 18, paddingVertical: 14 },
  tableRowDivider: { borderBottomWidth: 1, borderBottomColor: C.border },
  tableTotalRow: { borderBottomWidth: 1, borderBottomColor: C.border },
  tableTotalLabel: { fontFamily: FONT.bold, fontSize: 15.5, color: C.textPrimary },
  tableTotalValue: { fontFamily: FONT.bold, fontSize: 15.5, color: C.textPrimary },
  tableRowLabel: { fontFamily: FONT.regular, fontSize: 14.5, color: C.textPrimary },
  tableRowValue: { fontFamily: FONT.regular, fontSize: 14.5, color: C.textPrimary },
});

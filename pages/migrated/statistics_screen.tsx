import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { C, FONT, SHADOW } from './theme';
import MuscleBodyMap, { MuscleVolumeGroup } from '../../components/MuscleBodyMap';
import { ViewSide } from '../../constants/bodyMusclesPaths';
import DaySelectorStrip, { buildDayRange } from '../../components/DaySelectorStrip';
import SimpleBottomSheet from '../../components/SimpleBottomSheet';
import { muscleVolumeApi } from '../../api/muscleVolume';

interface Props {
  navigation?: any;
  route?: any;
}

interface AdvancedItem {
  key: string;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  route: string | null;
  params?: Record<string, any>;
}

const ADVANCED_ITEMS: AdvancedItem[] = [
  {
    key: 'series',
    icon: 'bar-chart-outline',
    title: 'Recuento de series por grupo de músculos',
    subtitle: 'Total agregado por zona en un rango (7/30/90 días), comparado con el periodo anterior',
    route: 'MigratedStatisticsSeriesCount',
  },
  {
    key: 'muscles',
    icon: 'analytics-outline',
    title: 'Distribución de los músculos',
    subtitle: 'Compara la distribución actual y previa de tus músculos entrenados',
    route: 'MigratedStatisticsMuscles',
  },
  {
    key: 'body',
    icon: 'body-outline',
    title: 'Distribución del cuerpo',
    subtitle: 'Heatmap de un día concreto, con navegador para moverte entre semanas',
    route: 'MigratedStatisticsBody',
  },
  {
    key: 'topExercises',
    icon: 'podium-outline',
    title: 'Ejercicios principales',
    subtitle: 'Lista de los ejercicios que realizas con más frecuencia',
    route: 'MigratedStatisticsTopExercises',
  },
  {
    key: 'prs',
    icon: 'trophy-outline',
    title: 'Marcas personales',
    subtitle: 'Ranking de tus mejores marcas por ejercicio',
    route: 'MigratedStatisticsPersonalRecords',
  },
  {
    key: 'monthly',
    icon: 'document-text-outline',
    title: 'Informe mensual',
    subtitle: 'Resumen de tus entrenamientos y estadísticas del mes',
    route: 'MigratedStatisticsMonthlyReport',
  },
];

export default function StatisticsScreen(props: Props) {
  const { navigation } = props;
  const days7 = useMemo(() => buildDayRange(7), []);
  const [selectedDate, setSelectedDate] = useState(days7[days7.length - 1].date);
  const [muscleVolume, setMuscleVolume] = useState<MuscleVolumeGroup[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [helpVisible, setHelpVisible] = useState(false);

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    muscleVolumeApi
      .getMy(7, selectedDate)
      .then((res) => {
        if (!active) return;
        const data = res.data?.data || res.data;
        setMuscleVolume(data?.volumeByMuscle || []);
      })
      .catch(() => {
        if (active) setMuscleVolume([]);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [selectedDate]);

  const openHelp = useCallback(() => setHelpVisible(true), []);

  const onPressItem = (item: AdvancedItem) => {
    if (item.route) {
      navigation?.navigate(item.route, item.params);
    } else {
      navigation?.navigate('MigratedComingSoon', { title: item.title });
    }
  };

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <View style={s.appBar}>
        <TouchableOpacity onPress={() => navigation?.goBack()} style={s.iconBtn}>
          <Ionicons name="chevron-back" size={22} color={C.textPrimary} />
        </TouchableOpacity>
        <Text style={s.appBarTitle}>Estadísticas</Text>
        <View style={s.iconBtn} />
      </View>

      <ScrollView contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={s.sectionTitleRow}>
          <Text style={s.sectionTitle}>Gráfico corporal de los últimos 7 días</Text>
          <TouchableOpacity style={s.helpBtn} onPress={openHelp}>
            <Text style={s.helpBtnText}>?</Text>
          </TouchableOpacity>
        </View>

        <View style={s.daySelectorWrap}>
          <DaySelectorStrip days={days7} selectedDate={selectedDate} onSelect={setSelectedDate} />
        </View>

        <View style={s.heatmapCard}>
          {isLoading ? (
            <ActivityIndicator size="large" color={C.textSecondary} style={{ paddingVertical: 60 }} />
          ) : (
            <View style={s.heatmapRow}>
              <MuscleBodyMap data={muscleVolume} height={190} showToggle={false} forcedView={ViewSide.FRONT} />
              <MuscleBodyMap data={muscleVolume} height={190} showToggle={false} forcedView={ViewSide.BACK} />
            </View>
          )}
        </View>

        <View style={s.advancedHeader}>
          <Text style={s.advancedHeaderText}>ESTADÍSTICAS AVANZADAS</Text>
        </View>

        <View style={s.advancedList}>
          {ADVANCED_ITEMS.map((item, idx) => (
            <TouchableOpacity
              key={item.key}
              style={[s.advancedRow, idx < ADVANCED_ITEMS.length - 1 && s.advancedRowDivider]}
              activeOpacity={0.7}
              onPress={() => onPressItem(item)}
            >
              <Ionicons name={item.icon} size={22} color={C.textSecondary} style={{ marginRight: 14 }} />
              <View style={{ flex: 1 }}>
                <Text style={s.advancedTitle}>{item.title}</Text>
                <Text style={s.advancedSubtitle} numberOfLines={2}>
                  {item.subtitle}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={C.gray40} />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <SimpleBottomSheet visible={helpVisible} onClose={() => setHelpVisible(false)}>
        <View style={s.sheetContent}>
          <Text style={s.sheetTitle}>¿Qué significa el color?</Text>
          <Text style={s.sheetText}>
            La intensidad del color de cada zona muestra cuánto volumen has entrenado ese grupo muscular en los
            últimos 7 días respecto al resto: cuanto más oscuro/saturado, más volumen relativo ha recibido esa zona.
          </Text>
        </View>
      </SimpleBottomSheet>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  appBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  iconBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  appBarTitle: { fontSize: 17, fontFamily: FONT.bold, color: C.textPrimary },
  scrollContent: { paddingBottom: 32 },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 8,
    marginBottom: 14,
  },
  sectionTitle: { flex: 1, fontFamily: FONT.semiBold, fontSize: 15, color: C.textPrimary, marginRight: 12 },
  helpBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: C.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOW.card,
  },
  helpBtnText: { fontFamily: FONT.bold, fontSize: 13, color: C.textSecondary },
  daySelectorWrap: { paddingHorizontal: 20, marginBottom: 16 },
  heatmapCard: {
    backgroundColor: C.surface,
    borderRadius: 20,
    marginHorizontal: 20,
    paddingVertical: 12,
    minHeight: 180,
    justifyContent: 'center',
    ...SHADOW.card,
  },
  heatmapRow: { flexDirection: 'row', justifyContent: 'space-around' },
  advancedHeader: { backgroundColor: C.gray10, paddingHorizontal: 20, paddingVertical: 10, marginTop: 28 },
  advancedHeaderText: { fontFamily: FONT.semiBold, fontSize: 12, color: C.textSecondary, letterSpacing: 0.5 },
  advancedList: { paddingHorizontal: 20 },
  advancedRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16 },
  advancedRowDivider: { borderBottomWidth: 1, borderBottomColor: C.border },
  advancedTitle: { fontFamily: FONT.semiBold, fontSize: 14.5, color: C.textPrimary },
  advancedSubtitle: { fontFamily: FONT.regular, fontSize: 12, color: C.textSecondary, marginTop: 3 },
  sheetContent: { padding: 24 },
  sheetTitle: { fontFamily: FONT.bold, fontSize: 17, color: C.textPrimary, marginBottom: 10 },
  sheetText: { fontFamily: FONT.regular, fontSize: 14, color: C.textSecondary, lineHeight: 20 },
});

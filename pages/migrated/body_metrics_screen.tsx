import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { C, FONT, SHADOW } from './theme';
import SimpleBottomSheet from '@components/SimpleBottomSheet';
import MetricLineChart from '@components/MetricLineChart';
import {
  bodyMetricsApi,
  BodyMetricTypeDef,
  BodyMetricChartData,
  BodyMetricChartPoint,
} from '../../api/bodyMetrics';
import logger from '@helper/logger';

const CHART_WIDTH = Dimensions.get('window').width - 20 * 2 - 18 * 2;

function formatShortDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
}

function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function BodyMetricsScreen(props: any) {
  const initialType: string | undefined = props.route?.params?.metricType;
  const [types, setTypes] = useState<BodyMetricTypeDef[]>([]);
  const [chartData, setChartData] = useState<BodyMetricChartData>({});
  const [selectedType, setSelectedType] = useState<string | null>(initialType ?? null);
  const [loading, setLoading] = useState(true);
  const [sheetVisible, setSheetVisible] = useState(false);
  const [formValue, setFormValue] = useState('');
  const [saving, setSaving] = useState(false);

  // Se cargan tipos + datos juntos y no se muestra nada hasta tener ambos —
  // mostrar la lista de chips antes de saber qué tipos existen (o el valor
  // "más reciente" antes de saber si hay datos) es justo lo que producía el
  // parpadeo/estado roto reportado al añadir una medida y volver a esta pantalla.
  const load = async () => {
    setLoading(true);
    try {
      const [typesRes, chartRes] = await Promise.all([bodyMetricsApi.getTypes(), bodyMetricsApi.getChart()]);
      const fetchedTypes = typesRes.data?.data || [];
      setTypes(fetchedTypes);
      setChartData(chartRes.data?.data || {});
      setSelectedType((prev) => prev ?? fetchedTypes[0]?.value ?? null);
    } catch (e) {
      logger.error('BodyMetrics load error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const meta = types.find((t) => t.value === selectedType) ?? null;
  const entries: BodyMetricChartPoint[] = selectedType ? chartData[selectedType]?.data ?? [] : [];
  const unit = (selectedType && chartData[selectedType]?.unit) || meta?.unit || '';
  const sortedAsc = useMemo(() => [...entries].sort((a, b) => a.date.localeCompare(b.date)), [entries]);
  const sortedDesc = useMemo(() => [...sortedAsc].reverse(), [sortedAsc]);
  const latest = sortedDesc[0] ?? null;
  const previous = sortedDesc[1] ?? null;
  const delta = latest && previous ? latest.value - previous.value : null;

  const typesWithData = useMemo(
    () => new Set(Object.keys(chartData).filter((k) => (chartData[k]?.data?.length ?? 0) > 0)),
    [chartData]
  );

  const openAdd = () => {
    setFormValue(latest ? String(latest.value) : '');
    setSheetVisible(true);
  };

  const save = async () => {
    if (!selectedType) return;
    const numeric = parseFloat(formValue.replace(',', '.'));
    if (!numeric || Number.isNaN(numeric)) return;
    setSaving(true);
    try {
      await bodyMetricsApi.store({
        metric_type: selectedType,
        value: numeric,
        unit: meta?.unit ?? undefined,
        recorded_at: todayISO(),
      });
      setSheetVisible(false);
      await load();
    } catch (e) {
      logger.error('BodyMetrics save error:', e);
    } finally {
      setSaving(false);
    }
  };

  const deleteEntry = (id: number) => {
    Alert.alert('Eliminar medida', '¿Seguro que quieres borrar esta medida?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Borrar',
        style: 'destructive',
        onPress: async () => {
          try {
            await bodyMetricsApi.destroy(id);
            await load();
          } catch (e) {
            logger.error('BodyMetrics delete error:', e);
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <View style={s.appBar}>
        <TouchableOpacity onPress={() => props.navigation?.goBack()} style={s.backBtn}>
          <Ionicons name="chevron-back" size={24} color={C.textPrimary} />
        </TouchableOpacity>
        <Text style={s.appBarTitle}>Antropometría</Text>
        <View style={{ width: 32 }} />
      </View>

      {loading ? (
        <View style={s.loadingWrap}>
          <ActivityIndicator size="large" color={C.textSecondary} />
        </View>
      ) : types.length === 0 ? (
        <View style={s.loadingWrap}>
          <Ionicons name="body-outline" size={40} color={C.gray30} />
          <Text style={s.emptyScreenText}>Tu coach todavía no ha configurado ningún tipo de medida.</Text>
        </View>
      ) : (
        <>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.chipsRow} contentContainerStyle={s.chipsContent}>
            {types.map((t) => (
              <TouchableOpacity
                key={t.value}
                style={[s.chip, selectedType === t.value && s.chipActive]}
                onPress={() => setSelectedType(t.value)}
                activeOpacity={0.75}
              >
                {typesWithData.has(t.value) && <View style={s.chipDot} />}
                <Text style={[s.chipText, selectedType === t.value && s.chipTextActive]}>{t.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <ScrollView contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
            <View style={s.valueCard}>
              {latest ? (
                <>
                  <View style={s.valueCardTop}>
                    <View style={{ flex: 1 }}>
                      <Text style={s.latestLabel}>{meta?.label}</Text>
                      <Text style={s.latestValue}>
                        {latest.value}
                        <Text style={s.latestUnit}> {unit}</Text>
                      </Text>
                    </View>
                    <TouchableOpacity style={s.addIconBtn} onPress={openAdd}>
                      <Ionicons name="add" size={20} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>
                  <View style={s.valueCardMetaRow}>
                    <Text style={s.latestDate}>
                      {formatShortDate(latest.date)} · {latest.source === 'coach' ? 'Tu coach' : 'Tú'}
                    </Text>
                    {delta !== null && (
                      <View style={[s.deltaBadge, delta < 0 ? s.deltaDown : delta > 0 ? s.deltaUp : s.deltaFlat]}>
                        <Ionicons name={delta < 0 ? 'arrow-down' : delta > 0 ? 'arrow-up' : 'remove'} size={11} color={delta < 0 ? C.statusSuccess : delta > 0 ? C.statusWarning : C.gray40} />
                        <Text style={[s.deltaText, { color: delta < 0 ? C.statusSuccess : delta > 0 ? C.statusWarning : C.gray40 }]}>
                          {Math.abs(delta).toFixed(1)} {unit}
                        </Text>
                      </View>
                    )}
                  </View>
                </>
              ) : (
                <View style={s.emptyValueWrap}>
                  <Ionicons name="body-outline" size={32} color={C.gray30} />
                  <Text style={s.emptyText}>Sin medidas de {meta?.label.toLowerCase()} todavía</Text>
                  <TouchableOpacity style={s.emptyAddBtn} onPress={openAdd}>
                    <Text style={s.emptyAddBtnText}>Añadir primera medida</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {sortedAsc.length >= 2 && (
              <View style={s.chartCard}>
                <MetricLineChart
                  series={[{ key: selectedType ?? 'metric', color: C.orange, values: sortedAsc.map((p) => p.value) }]}
                  pointCount={sortedAsc.length}
                  width={CHART_WIDTH}
                  height={130}
                  unit={unit}
                  pointLabels={sortedAsc.map((p) => formatShortDate(p.date))}
                />
                <View style={[s.chartLegendRow, { width: CHART_WIDTH }]}>
                  <Text style={s.chartLegendText}>{formatShortDate(sortedAsc[0].date)}</Text>
                  <Text style={s.chartLegendText}>{formatShortDate(sortedAsc[sortedAsc.length - 1].date)}</Text>
                </View>
              </View>
            )}

            {sortedDesc.length > 0 && (
              <View style={s.historySection}>
                <Text style={s.historyTitle}>Historial</Text>
                {sortedDesc.map((entry) => (
                  <View key={entry.id} style={s.historyRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={s.historyValue}>
                        {entry.value} {unit}
                      </Text>
                      <Text style={s.historyMeta}>
                        {formatShortDate(entry.date)} · {entry.source === 'coach' ? 'Coach' : 'Tú'}
                      </Text>
                      {entry.notes ? <Text style={s.historyNotes}>{entry.notes}</Text> : null}
                    </View>
                    {entry.source === 'client' && (
                      <TouchableOpacity onPress={() => deleteEntry(entry.id)} style={s.historyDeleteBtn}>
                        <Ionicons name="trash-outline" size={16} color={C.gray40} />
                      </TouchableOpacity>
                    )}
                  </View>
                ))}
              </View>
            )}
          </ScrollView>
        </>
      )}

      <SimpleBottomSheet visible={sheetVisible} onClose={() => setSheetVisible(false)}>
        <View style={s.sheetContent}>
          <Text style={s.sheetTitle}>Añadir {meta?.label.toLowerCase()}</Text>
          <View style={s.sheetInputRow}>
            <TextInput
              style={s.sheetInput}
              keyboardType="decimal-pad"
              value={formValue}
              onChangeText={setFormValue}
              placeholder="0.0"
              placeholderTextColor={C.gray30}
              autoFocus
            />
            <Text style={s.sheetInputUnit}>{unit}</Text>
          </View>
          <TouchableOpacity style={s.sheetSaveBtn} onPress={save} disabled={saving}>
            {saving ? <ActivityIndicator size="small" color="#FFFFFF" /> : <Text style={s.sheetSaveBtnText}>Guardar</Text>}
          </TouchableOpacity>
        </View>
      </SimpleBottomSheet>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  appBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingVertical: 12 },
  backBtn: { padding: 4 },
  appBarTitle: { fontSize: 17, fontFamily: FONT.bold, color: C.textPrimary },
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, gap: 12 },
  emptyScreenText: { fontFamily: FONT.regular, fontSize: 13, color: C.textSecondary, textAlign: 'center' },
  chipsRow: { flexGrow: 0 },
  chipsContent: { paddingHorizontal: 20, paddingBottom: 12, gap: 8 },
  chip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: C.surface, ...SHADOW.card },
  chipActive: { backgroundColor: C.accentBlack },
  chipText: { fontFamily: FONT.semiBold, fontSize: 12.5, color: C.textSecondary },
  chipTextActive: { color: '#FFFFFF' },
  chipDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: C.statusSuccess, marginRight: 6 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 32 },
  valueCard: { backgroundColor: C.surface, borderRadius: 20, padding: 18, ...SHADOW.card },
  valueCardTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  valueCardMetaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 },
  latestLabel: { fontFamily: FONT.medium, fontSize: 13, color: C.textSecondary },
  latestValue: { fontFamily: FONT.bold, fontSize: 32, color: C.textPrimary, marginTop: 4 },
  latestUnit: { fontFamily: FONT.medium, fontSize: 15, color: C.textSecondary },
  latestDate: { fontFamily: FONT.regular, fontSize: 12, color: C.textSecondary },
  addIconBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: C.accentBlack, alignItems: 'center', justifyContent: 'center' },
  emptyValueWrap: { alignItems: 'center', paddingVertical: 16, gap: 10 },
  emptyText: { fontFamily: FONT.regular, fontSize: 13, color: C.textSecondary, textAlign: 'center' },
  emptyAddBtn: { backgroundColor: C.accentBlack, borderRadius: 12, paddingHorizontal: 18, paddingVertical: 10, marginTop: 4 },
  emptyAddBtnText: { fontFamily: FONT.bold, fontSize: 13, color: '#FFFFFF' },
  deltaBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 9, paddingVertical: 5, borderRadius: 10 },
  deltaDown: { backgroundColor: C.success10 },
  deltaUp: { backgroundColor: C.warning10 },
  deltaFlat: { backgroundColor: C.gray5 },
  deltaText: { fontFamily: FONT.bold, fontSize: 11.5 },
  chartCard: { backgroundColor: C.surface, borderRadius: 20, padding: 18, marginTop: 12, alignItems: 'center', ...SHADOW.card },
  chartLegendRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  chartLegendText: { fontFamily: FONT.regular, fontSize: 11, color: C.textSecondary },
  historySection: { marginTop: 20 },
  historyTitle: { fontFamily: FONT.bold, fontSize: 13, color: C.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 },
  historyRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.surface, borderRadius: 14, padding: 14, marginBottom: 8, ...SHADOW.card },
  historyValue: { fontFamily: FONT.bold, fontSize: 15, color: C.textPrimary },
  historyMeta: { fontFamily: FONT.regular, fontSize: 12, color: C.textSecondary, marginTop: 2 },
  historyNotes: { fontFamily: FONT.regular, fontSize: 12, color: C.textSecondary, marginTop: 4, fontStyle: 'italic' },
  historyDeleteBtn: { padding: 8 },
  sheetContent: { padding: 24 },
  sheetTitle: { fontFamily: FONT.bold, fontSize: 17, color: C.textPrimary, marginBottom: 16, textAlign: 'center' },
  sheetInputRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.gray5, borderRadius: 14, paddingHorizontal: 16 },
  sheetInput: { flex: 1, fontFamily: FONT.bold, fontSize: 28, color: C.textPrimary, paddingVertical: 14 },
  sheetInputUnit: { fontFamily: FONT.medium, fontSize: 16, color: C.textSecondary },
  sheetSaveBtn: { backgroundColor: C.accentBlack, borderRadius: 14, paddingVertical: 15, alignItems: 'center', marginTop: 16 },
  sheetSaveBtnText: { fontFamily: FONT.bold, fontSize: 15, color: '#FFFFFF' },
});

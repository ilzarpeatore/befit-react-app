import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useResponsiveStyleSheet } from '@helper/responsiveStyleSheet';
import { C, FONT } from './theme';
import { profileApi } from '../../api/profile';

interface GraphDataItem {
  value?: string;
  unit?: string;
  date?: string;
  label?: string;
}

function HorizontalBarChart({ data }: { data: GraphDataItem[] }) {
  if (!data || data.length === 0) return null;
  const maxVal = Math.max(...data.map(d => parseFloat(d.value?.replace(/[^0-9.]/g, '') ?? '0') || 0));
  return (
    <View style={chartStyles.container}>
      {data.map((item, i) => {
        const val = parseFloat(item.value?.replace(/[^0-9.]/g, '') ?? '0') || 0;
        const pct = maxVal > 0 ? (val / maxVal) * 100 : 0;
        return (
          <View key={i} style={chartStyles.barRow}>
            <Text style={chartStyles.barLabel} numberOfLines={1}>{item.label ?? item.date ?? ''}</Text>
            <View style={chartStyles.barTrack}>
              <View style={[chartStyles.barFill, { width: `${pct}%` }]} />
            </View>
            <Text style={chartStyles.barValue}>{val}{item.unit ? ` ${item.unit}` : ''}</Text>
          </View>
        );
      })}
    </View>
  );
}

export default function ProgressScreen(props: any) {

  const [isWeight, setIsWeight] = useState(false);
  const [isHeartRate, setIsHeartRate] = useState(false);
  const [isPush, setIsPush] = useState(false);
  const [weightData, setWeightData] = useState<GraphDataItem[]>([]);
  const [heartRateData, setHeartRateData] = useState<GraphDataItem[]>([]);
  const [pushUpData, setPushUpData] = useState<GraphDataItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    setIsWeight(true);
    setIsHeartRate(true);
    setIsPush(true);

    setIsLoading(true);
    try {
      const [weightRes, heartRes, pushRes] = await Promise.allSettled([
        profileApi.getGraphList('weight'),
        profileApi.getGraphList('heart_rate'),
        profileApi.getGraphList('push_up'),
      ]);

      if (weightRes.status === 'fulfilled') {
        setWeightData((weightRes.value.data.data ?? []).map((g: any) => ({
          value: g.value,
          unit: g.unit,
          date: g.date,
          label: g.date,
        })));
      }
      if (heartRes.status === 'fulfilled') {
        setHeartRateData((heartRes.value.data.data ?? []).map((g: any) => ({
          value: g.value,
          unit: g.unit,
          date: g.date,
          label: g.date,
        })));
      }
      if (pushRes.status === 'fulfilled') {
        setPushUpData((pushRes.value.data.data ?? []).map((g: any) => ({
          value: g.value,
          unit: g.unit,
          date: g.date,
          label: g.date,
        })));
      }
    } catch (e) {
      console.log('Progress init error:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToDetail = (type: string, unit: string, title: string) => {
    props.navigation?.navigate('MigratedProgressDetail', { mType: type, mUnit: unit, mTitle: title });
  };

  const renderHeading = (title: string, onPress: () => void) => (
    <TouchableOpacity style={s.headingRow} onPress={onPress}>
      <Text style={s.headingText}>{title}</Text>
      <Ionicons name="chevron-forward" size={20} color={C.brand5} />
    </TouchableOpacity>
  );

  const renderChartCard = (title: string, data: GraphDataItem[], type: string, unit: string) => (
    <TouchableOpacity style={s.chartCard} onPress={() => navigateToDetail(type, unit, title)}>
      {renderHeading(title, () => navigateToDetail(type, unit, title))}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <HorizontalBarChart data={data} />
      </ScrollView>
    </TouchableOpacity>
  );

  return (
    <View style={s.container}>
      <View style={s.appBar}>
        <TouchableOpacity onPress={() => props.navigation?.goBack()} style={s.backBtn}>
          <Ionicons name="chevron-back" size={24} color={C.brand5} />
        </TouchableOpacity>
        <Text style={s.appBarTitle}>Report</Text>
        <TouchableOpacity style={s.settingsBtn} onPress={() => props.navigation?.navigate('MigratedProgressSetting')}>
          <Ionicons name="settings-outline" size={20} color={C.gray30} />
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={s.summaryRow}>
          <View style={s.summaryCard}>
            <Ionicons name="footsteps-outline" size={28} color={C.brand5} />
            <Text style={s.summaryLabel}>Steps</Text>
            <Text style={s.summaryValue}>--</Text>
          </View>
          <View style={s.summaryCard}>
            <Ionicons name="body-outline" size={28} color={C.orange} />
            <Text style={s.summaryLabel}>BMI</Text>
            <Text style={s.summaryValue}>--</Text>
          </View>
        </View>
        <View style={s.summaryRow}>
          <View style={s.summaryCard}>
            <Ionicons name="pulse-outline" size={28} color={C.destructive} />
            <Text style={s.summaryLabel}>BMR</Text>
            <Text style={s.summaryValue}>--</Text>
          </View>
          <View style={s.summaryCard}>
            <Ionicons name="fitness-outline" size={28} color={C.success} />
            <Text style={s.summaryLabel}>Ideal Weight</Text>
            <Text style={s.summaryValue}>--</Text>
          </View>
        </View>
        <View style={s.chartsSection}>
          {isWeight && renderChartCard('Weight', weightData, 'weight', 'kg')}
          {isHeartRate && renderChartCard('Heart Rate', heartRateData, 'heart_rate', 'bpm')}
          {isPush && renderChartCard('Push Up', pushUpData, 'push_up', 'min')}
        </View>
        {isLoading && (
          <View style={s.loadingOverlay}>
            <ActivityIndicator size="large" color={C.brand5} />
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const chartStyles = StyleSheet.create({
  container: { paddingVertical: 8, paddingHorizontal: 8 },
  barRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  barLabel: { width: 50, fontSize: 10, color: C.gray40, textAlign: 'right', marginRight: 6 },
  barTrack: { flex: 1, height: 16, backgroundColor: C.gray70, borderRadius: 3, overflow: 'hidden' },
  barFill: { height: 16, backgroundColor: C.brand5, borderRadius: 3 },
  barValue: { width: 70, fontSize: 10, color: C.gray20, marginLeft: 6 },
});

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  appBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 48, paddingBottom: 12, backgroundColor: C.surface },
  backBtn: { padding: 4 },
  appBarTitle: { fontSize: 18, fontFamily: FONT.bold, color: C.white },
  settingsBtn: { padding: 4 },
  scrollContent: { paddingBottom: 24 },
  summaryRow: { flexDirection: 'row', paddingHorizontal: 16, marginTop: 16, gap: 16 },
  summaryCard: { flex: 1, backgroundColor: C.surface, borderRadius: 16, padding: 16, alignItems: 'center' },
  summaryLabel: { fontSize: 12, color: C.gray40, marginTop: 8 },
  summaryValue: { fontSize: 18, fontFamily: FONT.bold, color: C.white, marginTop: 4 },
  chartsSection: { marginTop: 16, paddingHorizontal: 16 },
  chartCard: { backgroundColor: C.surface, borderRadius: 16, marginBottom: 16, paddingVertical: 8, overflow: 'hidden' },
  headingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 8 },
  headingText: { fontSize: 16, fontFamily: FONT.bold, color: C.white },
  loadingOverlay: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(0,0,0,0.3)', alignItems: 'center', justifyContent: 'center' },
});

import React from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useResponsiveStyleSheet } from "@helper/responsiveStyleSheet";
import { C, FONT } from "../theme";

const WEEKLY_DATA = [
  { day: "L", value: 70.4 },
  { day: "M", value: 70.2 },
  { day: "X", value: 70.1 },
  { day: "J", value: 70.0 },
  { day: "V", value: 70.0 },
];

const KEY_METRICS = [
  { label: "Promedio", value: "70.2", unit: "kg", icon: "stats-chart" as const, color: C.blue50 },
  { label: "M\u00EDnimo", value: "68.5", unit: "kg", icon: "arrow-down-circle" as const, color: C.success50 },
  { label: "M\u00E1ximo", value: "72.1", unit: "kg", icon: "arrow-up-circle" as const, color: C.destructive50 },
  { label: "Tendencia", value: "\u2193 0.3", unit: "kg/sem", icon: "trending-down" as const, color: C.textPrimary },
];

export default function WeightInsightScreen({ navigation }: any) {
  const styles = useStyle();
  const maxVal = Math.max(...WEEKLY_DATA.map(d => d.value));
  const minVal = Math.min(...WEEKLY_DATA.map(d => d.value));

  return (
    <View style={styles.root}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={C.white} />
          </TouchableOpacity>

          <Text style={styles.title}>Insights de peso</Text>

          <View style={styles.bmiCard}>
            <View style={styles.bmiHeader}>
              <Ionicons name="fitness" size={24} color={C.success50} />
              <Text style={styles.bmiLabel}>BMI</Text>
            </View>
            <Text style={styles.bmiValue}>22.9</Text>
            <View style={styles.bmiStatusBadge}>
              <Text style={styles.bmiStatusText}>Normal</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Comparaci\u00F3n semanal</Text>
          <View style={styles.chartCard}>
            <View style={styles.chartBars}>
              {WEEKLY_DATA.map((d, i) => {
                const normalized = ((d.value - minVal + 0.5) / (maxVal - minVal + 1)) * 120 + 40;
                return (
                  <View key={d.day} style={styles.barCol}>
                    <Text style={styles.barVal}>{d.value}</Text>
                    <View style={[styles.bar, { height: normalized, backgroundColor: i === WEEKLY_DATA.length - 1 ? C.brand50 : C.gray30 }]} />
                    <Text style={styles.barDay}>{d.day}</Text>
                  </View>
                );
              })}
            </View>
          </View>

          <Text style={styles.sectionTitle}>Edad metab\u00F3lica</Text>
          <View style={styles.gaugeCard}>
            <View style={styles.gaugeTrack}>
              <View style={[styles.gaugeFill, { width: "65%" }]} />
            </View>
            <View style={styles.gaugeLabels}>
              <Text style={styles.gaugeAge}>26 a\u00F1os</Text>
              <Text style={styles.gaugeSubtitle}>Edad metab\u00F3lica estimada</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>M\u00E9tricas clave</Text>
          <View style={styles.metricsGrid}>
            {KEY_METRICS.map((m) => (
              <View key={m.label} style={styles.metricCard}>
                <Ionicons name={m.icon} size={20} color={m.color} />
                <Text style={styles.metricValue}>{m.value}</Text>
                <Text style={styles.metricUnit}>{m.unit}</Text>
                <Text style={styles.metricLabel}>{m.label}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function useStyle() {
  return useResponsiveStyleSheet({
    root: { flex: 1, backgroundColor: C.bg },
    scroll: { padding: 24 },
    backBtn: { marginBottom: 8, width: 40, height: 40, justifyContent: "center" },
    title: { fontSize: 26, fontFamily: FONT.bold, color: C.white, marginBottom: 24 },
    bmiCard: { backgroundColor: C.surface, borderRadius: 16, padding: 20, marginBottom: 28, borderWidth: 1, borderColor: C.border },
    bmiHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
    bmiLabel: { fontSize: 14, fontFamily: FONT.medium, color: C.gray5 },
    bmiValue: { fontSize: 36, fontFamily: FONT.extraBold, color: C.white, marginBottom: 8 },
    bmiStatusBadge: { alignSelf: "flex-start", backgroundColor: C.success5, borderRadius: 8, paddingVertical: 4, paddingHorizontal: 12 },
    bmiStatusText: { fontSize: 13, fontFamily: FONT.semiBold, color: C.success50 },
    sectionTitle: { fontSize: 16, fontFamily: FONT.semiBold, color: C.white, marginBottom: 12 },
    chartCard: { backgroundColor: C.surface, borderRadius: 16, padding: 20, marginBottom: 28, borderWidth: 1, borderColor: C.border },
    chartBars: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", height: 180 },
    barCol: { alignItems: "center", flex: 1 },
    bar: { width: 28, borderRadius: 8, marginBottom: 6 },
    barVal: { fontSize: 10, fontFamily: FONT.medium, color: C.gray5, marginBottom: 4 },
    barDay: { fontSize: 12, fontFamily: FONT.medium, color: C.gray5 },
    gaugeCard: { backgroundColor: C.surface, borderRadius: 16, padding: 20, marginBottom: 28, borderWidth: 1, borderColor: C.border },
    gaugeTrack: { height: 10, borderRadius: 5, backgroundColor: C.gray30, marginBottom: 12, overflow: "hidden" },
    gaugeFill: { height: "100%", borderRadius: 5, backgroundColor: C.brand50 },
    gaugeLabels: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    gaugeAge: { fontSize: 20, fontFamily: FONT.bold, color: C.white },
    gaugeSubtitle: { fontSize: 12, fontFamily: FONT.regular, color: C.gray5 },
    metricsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
    metricCard: { width: "47%", backgroundColor: C.surface, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: C.border, gap: 6 },
    metricValue: { fontSize: 22, fontFamily: FONT.bold, color: C.white },
    metricUnit: { fontSize: 12, fontFamily: FONT.regular, color: C.gray5 },
    metricLabel: { fontSize: 13, fontFamily: FONT.medium, color: C.gray5 },
  });
}

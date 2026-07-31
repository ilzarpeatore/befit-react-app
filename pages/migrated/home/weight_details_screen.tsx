import React from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useResponsiveStyleSheet } from "@helper/responsiveStyleSheet";
import { C, FONT } from "../theme";

const METRICS = [
  { label: "BMI", value: "22.9", subtitle: "Normal", color: C.success50 },
  { label: "Meta", value: "65 kg", subtitle: "objetivo", color: C.textPrimary },
  { label: "Cambio/mes", value: "-1.2 kg", subtitle: "progreso", color: C.blue50 },
  { label: "Grasa corporal", value: "18%", subtitle: "estimado", color: C.warning40 },
];

const MONTHLY_DATA = [
  { month: "Ene", value: 72 },
  { month: "Feb", value: 71.5 },
  { month: "Mar", value: 71 },
  { month: "Abr", value: 70.8 },
  { month: "May", value: 70.3 },
  { month: "Jun", value: 70 },
];

export default function WeightDetailsScreen({ navigation }: any) {
  const styles = useStyle();
  const maxVal = Math.max(...MONTHLY_DATA.map(d => d.value));

  return (
    <View style={styles.root}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={C.white} />
          </TouchableOpacity>

          <View style={styles.heroSection}>
            <Text style={styles.heroLabel}>Peso actual</Text>
            <Text style={styles.heroWeight}>70.0 kg</Text>
          </View>

          <View style={styles.metricsGrid}>
            {METRICS.map((m) => (
              <View key={m.label} style={styles.metricCard}>
                <View style={[styles.metricDot, { backgroundColor: m.color }]} />
                <Text style={styles.metricValue}>{m.value}</Text>
                <Text style={styles.metricLabel}>{m.label}</Text>
                <Text style={styles.metricSubtitle}>{m.subtitle}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.sectionTitle}>Progreso mensual</Text>
          <View style={styles.chartCard}>
            <View style={styles.chartBars}>
              {MONTHLY_DATA.map((d, i) => {
                const barHeight = (d.value / maxVal) * 140;
                return (
                  <View key={d.month} style={styles.barWrapper}>
                    <Text style={styles.barValue}>{d.value}</Text>
                    <View style={[styles.bar, { height: barHeight, backgroundColor: i === MONTHLY_DATA.length - 1 ? C.brand50 : C.gray30 }]} />
                    <Text style={styles.barLabel}>{d.month}</Text>
                  </View>
                );
              })}
            </View>
          </View>

          <TouchableOpacity style={styles.insightBtn} onPress={() => navigation.navigate("MigratedWeightInsight")}>
            <Ionicons name="analytics-outline" size={20} color={C.white} />
            <Text style={styles.insightBtnText}>Ver insight</Text>
          </TouchableOpacity>
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
    heroSection: { alignItems: "center", marginBottom: 32 },
    heroLabel: { fontSize: 14, fontFamily: FONT.medium, color: C.gray50, marginBottom: 4 },
    heroWeight: { fontSize: 48, fontFamily: FONT.extraBold, color: C.white },
    metricsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 28 },
    metricCard: { width: "47%", backgroundColor: C.surface, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: C.border },
    metricDot: { width: 8, height: 8, borderRadius: 4, marginBottom: 10 },
    metricValue: { fontSize: 20, fontFamily: FONT.bold, color: C.white, marginBottom: 2 },
    metricLabel: { fontSize: 13, fontFamily: FONT.medium, color: C.gray50 },
    metricSubtitle: { fontSize: 11, fontFamily: FONT.regular, color: C.gray50 },
    sectionTitle: { fontSize: 16, fontFamily: FONT.semiBold, color: C.white, marginBottom: 12 },
    chartCard: { backgroundColor: C.surface, borderRadius: 16, padding: 20, marginBottom: 28, borderWidth: 1, borderColor: C.border },
    chartBars: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", height: 180 },
    barWrapper: { alignItems: "center", flex: 1 },
    bar: { width: 28, borderRadius: 8, marginBottom: 6 },
    barValue: { fontSize: 10, fontFamily: FONT.medium, color: C.gray50, marginBottom: 4 },
    barLabel: { fontSize: 11, fontFamily: FONT.medium, color: C.gray50 },
    insightBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: C.brand50, borderRadius: 16, paddingVertical: 16, gap: 8 },
    insightBtnText: { fontSize: 16, fontFamily: FONT.semiBold, color: C.white },
  });
}

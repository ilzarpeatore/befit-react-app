import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useResponsiveStyleSheet } from "@helper/responsiveStyleSheet";
import { C, FONT } from "../theme";

const TIME_TABS = ["1w", "1m", "3m", "6m", "1y"];

const LINE_POINTS = [
  { x: 0, y: 70.5 },
  { x: 1, y: 70.3 },
  { x: 2, y: 70.1 },
  { x: 3, y: 70.2 },
  { x: 4, y: 70.0 },
  { x: 5, y: 69.8 },
  { x: 6, y: 70.0 },
];

const RECENT_ENTRIES = [
  { date: "Hoy", weight: 70.0 },
  { date: "Ayer", weight: 70.2 },
  { date: "22 Jul", weight: 70.3 },
  { date: "21 Jul", weight: 70.2 },
  { date: "20 Jul", weight: 70.5 },
];

export default function WeightScreen({ navigation }: any) {
  const styles = useStyle();
  const [activeTab, setActiveTab] = useState("1m");

  const minY = Math.min(...LINE_POINTS.map(p => p.y));
  const maxY = Math.max(...LINE_POINTS.map(p => p.y));
  const chartHeight = 140;
  const chartWidth = 300;

  return (
    <View style={styles.root}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <Text style={styles.headerTitle}>Peso</Text>

          <View style={styles.heroCard}>
            <Text style={styles.heroLabel}>Peso actual</Text>
            <Text style={styles.heroWeight}>70.0 kg</Text>
          </View>

          <View style={styles.tabsRow}>
            {TIME_TABS.map((tab) => (
              <TouchableOpacity
                key={tab}
                style={[styles.tab, activeTab === tab && styles.tabActive]}
                onPress={() => setActiveTab(tab)}
              >
                <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.chartCard}>
            <View style={styles.chartArea}>
              {LINE_POINTS.map((point, i) => {
                const x = (i / (LINE_POINTS.length - 1)) * chartWidth;
                const normalizedY = ((point.y - minY) / (maxY - minY || 1)) * (chartHeight - 20) + 10;
                return (
                  <View key={i}>
                    {i < LINE_POINTS.length - 1 && (
                      <View
                        style={[
                          styles.chartLine,
                          {
                            left: x,
                            top: chartHeight - normalizedY,
                            width: chartWidth / (LINE_POINTS.length - 1),
                            transform: [{ rotate: `${-Math.atan2(
                              ((LINE_POINTS[i + 1].y - minY) / (maxY - minY || 1)) * (chartHeight - 20) + 10 - normalizedY,
                              chartWidth / (LINE_POINTS.length - 1)
                            ) * (180 / Math.PI)}deg` }],
                          },
                        ]}
                      />
                    )}
                    <View
                      style={[
                        styles.chartDot,
                        {
                          left: x - 4,
                          top: chartHeight - normalizedY - 4,
                          backgroundColor: i === LINE_POINTS.length - 1 ? C.brand50 : C.gray30,
                        },
                      ]}
                    />
                  </View>
                );
              })}
            </View>
          </View>

          <View style={styles.insightRow}>
            <View style={styles.insightMini}>
              <Text style={styles.insightMiniLabel}>BMI</Text>
              <Text style={styles.insightMiniValue}>22.9</Text>
              <Text style={styles.insightMiniStatus}>Normal</Text>
            </View>
            <View style={styles.insightMini}>
              <Text style={styles.insightMiniLabel}>Tendencia</Text>
              <Text style={[styles.insightMiniValue, { color: C.success50 }]}>{"\u2193"} 0.3 kg</Text>
              <Text style={styles.insightMiniStatus}>por semana</Text>
            </View>
            <TouchableOpacity style={styles.insightMini} onPress={() => navigation.navigate("MigratedWeightInsight")}>
              <Ionicons name="analytics-outline" size={20} color={C.textPrimary} />
              <Text style={[styles.insightMiniValue, { color: C.textPrimary, fontSize: 13 }]}>Ver m\u00E1s</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Historial reciente</Text>
            <TouchableOpacity onPress={() => navigation.navigate("MigratedWeightHistory")}>
              <Text style={styles.seeAll}>Ver todo</Text>
            </TouchableOpacity>
          </View>

          {RECENT_ENTRIES.map((e, i) => (
            <View key={i} style={styles.entryRow}>
              <Text style={styles.entryDate}>{e.date}</Text>
              <Text style={styles.entryWeight}>{e.weight.toFixed(1)} kg</Text>
            </View>
          ))}

          <View style={styles.goalRow}>
            <View style={styles.goalRingSmall}>
              <Ionicons name="flag" size={18} color={C.textPrimary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.goalLabel}>Meta: 65.0 kg</Text>
              <Text style={styles.goalSub}>Faltan 5.0 kg</Text>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate("MigratedWeightDetails")}>
              <Ionicons name="chevron-forward" size={20} color={C.gray5} />
            </TouchableOpacity>
          </View>
        </ScrollView>

        <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate("MigratedLogWeightForm")}>
          <Ionicons name="add" size={28} color={C.white} />
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
}

function useStyle() {
  return useResponsiveStyleSheet({
    root: { flex: 1, backgroundColor: C.bg },
    scroll: { padding: 20, paddingBottom: 80 },
    headerTitle: { fontSize: 28, fontFamily: FONT.bold, color: C.white, marginBottom: 20 },
    heroCard: { backgroundColor: C.surface, borderRadius: 16, padding: 24, alignItems: "center", marginBottom: 20, borderWidth: 1, borderColor: C.border },
    heroLabel: { fontSize: 13, fontFamily: FONT.medium, color: C.gray5, marginBottom: 4 },
    heroWeight: { fontSize: 42, fontFamily: FONT.extraBold, color: C.white },
    tabsRow: { flexDirection: "row", gap: 8, marginBottom: 16 },
    tab: { paddingVertical: 8, paddingHorizontal: 18, borderRadius: 20, backgroundColor: C.surface, borderWidth: 1, borderColor: C.border },
    tabActive: { backgroundColor: C.brand50, borderColor: C.brand50 },
    tabText: { fontSize: 13, fontFamily: FONT.medium, color: C.gray5 },
    tabTextActive: { color: C.white },
    chartCard: { backgroundColor: C.surface, borderRadius: 16, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: C.border },
    chartArea: { height: 140, position: "relative" },
    chartLine: { position: "absolute", height: 2, backgroundColor: C.brand50, opacity: 0.5 },
    chartDot: { position: "absolute", width: 8, height: 8, borderRadius: 4 },
    insightRow: { flexDirection: "row", gap: 10, marginBottom: 24 },
    insightMini: { flex: 1, backgroundColor: C.surface, borderRadius: 12, padding: 12, alignItems: "center", borderWidth: 1, borderColor: C.border },
    insightMiniLabel: { fontSize: 11, fontFamily: FONT.medium, color: C.gray5, marginBottom: 4 },
    insightMiniValue: { fontSize: 16, fontFamily: FONT.bold, color: C.white },
    insightMiniStatus: { fontSize: 10, fontFamily: FONT.regular, color: C.gray5, marginTop: 2 },
    sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
    sectionTitle: { fontSize: 16, fontFamily: FONT.semiBold, color: C.white },
    seeAll: { fontSize: 13, fontFamily: FONT.medium, color: C.textPrimary },
    entryRow: { flexDirection: "row", justifyContent: "space-between", backgroundColor: C.surface, borderRadius: 10, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: C.border },
    entryDate: { fontSize: 14, fontFamily: FONT.medium, color: C.gray5 },
    entryWeight: { fontSize: 15, fontFamily: FONT.semiBold, color: C.white },
    goalRow: { flexDirection: "row", alignItems: "center", backgroundColor: C.surface, borderRadius: 14, padding: 16, marginTop: 8, borderWidth: 1, borderColor: C.border, gap: 12 },
    goalRingSmall: { width: 40, height: 40, borderRadius: 20, backgroundColor: C.brand5, justifyContent: "center", alignItems: "center" },
    goalLabel: { fontSize: 14, fontFamily: FONT.semiBold, color: C.white },
    goalSub: { fontSize: 12, fontFamily: FONT.regular, color: C.gray5, marginTop: 2 },
    fab: { position: "absolute", bottom: 24, right: 24, width: 56, height: 56, borderRadius: 28, backgroundColor: C.brand50, justifyContent: "center", alignItems: "center", elevation: 4 },
  });
}

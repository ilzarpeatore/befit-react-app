import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Animated } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useResponsiveStyleSheet } from "@helper/responsiveStyleSheet";
import { C, FONT } from "../theme";

const ENTRIES = [
  { date: "24 Jul 2026", weight: 70.0, change: -0.2 },
  { date: "23 Jul 2026", weight: 70.2, change: -0.1 },
  { date: "22 Jul 2026", weight: 70.3, change: 0.1 },
  { date: "21 Jul 2026", weight: 70.2, change: -0.3 },
  { date: "20 Jul 2026", weight: 70.5, change: 0.0 },
  { date: "19 Jul 2026", weight: 70.5, change: -0.2 },
  { date: "18 Jul 2026", weight: 70.7, change: -0.1 },
  { date: "17 Jul 2026", weight: 70.8, change: 0.2 },
];

const FILTERS = ["Semana", "Mes", "A\u00F1o"];

export default function WeightHistoryScreen({ navigation }: any) {
  const styles = useStyle();
  const [activeFilter, setActiveFilter] = useState("Semana");

  return (
    <View style={styles.root}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={C.white} />
          </TouchableOpacity>

          <Text style={styles.title}>Historial de peso</Text>

          <View style={styles.filterRow}>
            {FILTERS.map((f) => (
              <TouchableOpacity
                key={f}
                style={[styles.filterChip, activeFilter === f && styles.filterChipActive]}
                onPress={() => setActiveFilter(f)}
              >
                <Text style={[styles.filterText, activeFilter === f && styles.filterTextActive]}>{f}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.list}>
            {ENTRIES.map((entry, i) => (
              <View key={i} style={styles.entryCard}>
                <View style={styles.entryLeft}>
                  <Ionicons name="scale-outline" size={18} color={C.gray50} />
                  <View>
                    <Text style={styles.entryDate}>{entry.date}</Text>
                    <Text style={styles.entryWeight}>{entry.weight.toFixed(1)} kg</Text>
                  </View>
                </View>
                <View style={styles.entryRight}>
                  {entry.change !== 0 && (
                    <View style={[styles.changeBadge, { backgroundColor: entry.change < 0 ? C.success5 : C.destructive5 }]}>
                      <Ionicons name={entry.change < 0 ? "arrow-down" : "arrow-up"} size={12} color={entry.change < 0 ? C.success50 : C.destructive50} />
                      <Text style={[styles.changeText, { color: entry.change < 0 ? C.success50 : C.destructive50 }]}>
                        {entry.change > 0 ? "+" : ""}{entry.change.toFixed(1)} kg
                      </Text>
                    </View>
                  )}
                  {entry.change === 0 && <Text style={styles.noChange}>-</Text>}
                </View>
              </View>
            ))}
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
    scroll: { padding: 24, paddingBottom: 80 },
    backBtn: { marginBottom: 8, width: 40, height: 40, justifyContent: "center" },
    title: { fontSize: 26, fontFamily: FONT.bold, color: C.white, marginBottom: 20 },
    filterRow: { flexDirection: "row", gap: 10, marginBottom: 24 },
    filterChip: { paddingVertical: 8, paddingHorizontal: 20, borderRadius: 20, backgroundColor: C.surface, borderWidth: 1, borderColor: C.border },
    filterChipActive: { backgroundColor: C.brand50, borderColor: C.brand50 },
    filterText: { fontSize: 13, fontFamily: FONT.medium, color: C.gray50 },
    filterTextActive: { color: C.white },
    list: { gap: 8 },
    entryCard: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: C.surface, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: C.border },
    entryLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
    entryDate: { fontSize: 13, fontFamily: FONT.medium, color: C.gray50 },
    entryWeight: { fontSize: 16, fontFamily: FONT.semiBold, color: C.white, marginTop: 2 },
    entryRight: { alignItems: "flex-end" },
    changeBadge: { flexDirection: "row", alignItems: "center", borderRadius: 8, paddingVertical: 4, paddingHorizontal: 8, gap: 4 },
    changeText: { fontSize: 12, fontFamily: FONT.semiBold },
    noChange: { fontSize: 14, fontFamily: FONT.medium, color: C.gray50 },
    fab: { position: "absolute", bottom: 24, right: 24, width: 56, height: 56, borderRadius: 28, backgroundColor: C.brand50, justifyContent: "center", alignItems: "center", elevation: 4 },
  });
}
